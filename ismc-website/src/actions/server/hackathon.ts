"use server"

import { 
    CreateTeamFormState, createTeamSchema, 
    JoinTeamFormState, joinTeamSchema, 
    UpdateMemberFormState,
    UpdateBillingFormState, 
    SubmitProjectFormState,
    MemberHack
} from "../types/Hackathon";
import { refreshSession, verifySession } from "./session";
import { DB } from "@/lib/DB";
import { 
    checkTeamNameExists, insertNewTeam, addMemberToTeam, 
    deleteMember, fetchTeamPageData, getTeamId, 
    updatePayment, updateSubmission 
} from "@/actions/database/hack_team";
import { updateMember } from "@/actions/database/hack_member";
import { addEventToAccount, removeEventFromAccount } from "@/actions/database/account";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSignedUrlForR2, uploadFileToR2, getPresignedUploadUrl } from "@/lib/R2";
import { NeonDbError } from "@neondatabase/serverless";

function generateTeamCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function createTeam(
    prevState: CreateTeamFormState,
    formData: FormData
): Promise<CreateTeamFormState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };

    const validatedFields = createTeamSchema.safeParse({
        teamName: formData.get("teamName"),
    });

    if (!validatedFields.success) {
        return { error: validatedFields.error.issues.map((e) => e.message).join(", ") };
    }

    const { teamName } = validatedFields.data;
    const { account_id, email } = session;

    try {
        const nameTaken = await checkTeamNameExists(teamName);
        if (nameTaken) return { error: "Team name already taken." };

        let newCode = "";
        let isCodeUnique = false;
        let attempts = 0;

        while (!isCodeUnique && attempts < 5) {
            newCode = generateTeamCode();
            const existing = await DB`SELECT 1 FROM hack_team WHERE code = ${newCode}`;
            if (existing.length === 0) isCodeUnique = true;
            attempts++;
        }

        if (!isCodeUnique) return { error: "Failed to generate unique code." };

        await insertNewTeam(teamName, newCode, account_id, email);
        await addEventToAccount(account_id, "HACK");
        await refreshSession(account_id);

    } catch (e) {
        console.error("Create Team Error:", e);
        return { error: "An error occurred. Please try again." };
    }

    revalidatePath("/dashboard/hackathon");
    redirect("/dashboard/hackathon");
}

export async function joinTeam(
    prevState: JoinTeamFormState,
    formData: FormData
): Promise<JoinTeamFormState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };

    const rawCode = formData.get("teamCode") as string;
    const validatedFields = joinTeamSchema.safeParse({
        teamCode: rawCode?.toUpperCase(),
    });

    if (!validatedFields.success) {
        return { error: validatedFields.error.issues.map((e) => e.message).join(", ") };
    }

    const { teamCode } = validatedFields.data;
    const { account_id, email } = session;

    try {
        const team = await DB`SELECT team_id FROM hack_team WHERE code = ${teamCode}`;
        if (team.length === 0) return { error: "Invalid team code." };
        
        const teamId = team[0].team_id;

        await addMemberToTeam(teamId, account_id, email);
        await addEventToAccount(account_id, "HACK");
        await refreshSession(account_id);

    } catch(e){
        if (e instanceof Error && e.message === "TEAM_FULL") {
            return { error: "This team has reached the maximum of 5 members." };
        }
        if (e instanceof NeonDbError && e.code === '23505') { 
            return { error: "You are already in a team." };
        }
        return { error: "An error occurred while joining." };
    }

    revalidatePath("/dashboard/hackathon");
    redirect("/dashboard/hackathon");
}

export async function leaveTeam() {
    const session = await verifySession();
    if (!session) redirect("/");
    const { account_id } = session;

    try {
        await deleteMember(account_id);
        await removeEventFromAccount(account_id, "HACK");
        await refreshSession(account_id);
    } catch (error) {
        console.error(error);
    }

    revalidatePath("/dashboard/hackathon");
    redirect("/dashboard");
}

export async function getTeamPageData() {
    const session = await verifySession();
    if (!session) redirect("/");
    const { account_id } = session;

    try {
        const data = await fetchTeamPageData(account_id);
        
        for (const member of data.members) {
            if(member.fp_link) member.fp_link = await getSignedUrlForR2(member.fp_link);
        }

        if(data.team.pp_link) data.team.pp_link = await getSignedUrlForR2(data.team.pp_link);
        if(data.team.sd_link) data.team.sd_link = await getSignedUrlForR2(data.team.sd_link);
        if(data.team.od_link) data.team.od_link = await getSignedUrlForR2(data.team.od_link);
        if(data.team.final_pdf_path) {
            data.team.final_pdf_path = await getSignedUrlForR2(data.team.final_pdf_path);
        }
        if(data.team.final_slides_path) {
            data.team.final_slides_path = await getSignedUrlForR2(data.team.final_slides_path);
        }
        return data;
    } catch (e) {
        if ((e as Error).message === "User not assigned to a team.") {
             redirect("/dashboard/hackathon");
        }
        throw e;
    }
}

export async function getMemberDocuments(targetAccountId: string) {
    const session = await verifySession();
    if (!session) return null;

    try {
        const result = await DB`SELECT * FROM hack_member WHERE account_id = ${targetAccountId}`;
        if (result.length === 0) return null;
        
        const member = result[0];

        if (member.sc_link) member.sc_link = await getSignedUrlForR2(member.sc_link);
        if (member.fp_link) member.fp_link = await getSignedUrlForR2(member.fp_link);

        return member as MemberHack;
    } catch (error) {
        console.error("Error fetching member docs:", error);
        return null;
    }
}

export async function updateMemberDetails(
    prevState: UpdateMemberFormState,
    formData: FormData
): Promise<UpdateMemberFormState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };
    const { account_id } = session;

    try {
        const name = formData.get("name") as string;
        const institution = formData.get("institution") as string;
        const phoneNum = formData.get("phone_num") as string;
        const idNo = formData.get("id_no") as string;
        
        const scKey = null; 
        const fpKey = null;

        await updateMember(account_id, name, institution, phoneNum, idNo, scKey, fpKey);

        revalidatePath("/dashboard/hackathon");
        return { message: "Details saved successfully." };
    } catch (e) {
        console.error("Update Member Error:", e);
        return { error: "An error occurred while saving." };
    }
}

export async function uploadMemberDocument(
    targetAccountId: string,
    docType: 'sc' | 'fp',
    formData: FormData
) {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated" };
    
    try {
        const file = formData.get("file") as File;
        if (!file || file.size === 0) return { error: "No file provided" };

        const keyPrefix = docType === 'sc' ? 'hack-sc' : 'hack-fp';
        const fileKey = await uploadFileToR2(file, keyPrefix, targetAccountId);

        if (docType === 'sc') {
            await DB`UPDATE hack_member SET sc_link = ${fileKey}, sc_verified = 0 WHERE account_id = ${targetAccountId}`;
        } else {
            await DB`UPDATE hack_member SET fp_link = ${fileKey}, fp_verified = 0 WHERE account_id = ${targetAccountId}`;
        }

        revalidatePath("/dashboard/hackathon");
        return { success: true, message: "File uploaded successfully" };

    } catch (e) {
        console.error("Upload error:", e);
        return { error: "Upload failed" };
    }
}

export async function updateBilling(
    prevState: UpdateBillingFormState,
    formData: FormData
): Promise<UpdateBillingFormState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };
    const { account_id } = session;

    try {
        const ppFile = formData.get("payment_proof_url") as File;
        if (!ppFile || ppFile.size === 0) return { error: "Please select a file." };
        const ppKey = await uploadFileToR2(ppFile, "hack-pp", account_id);
        
        const team_id = await getTeamId(account_id);
        if (!team_id) return { error: "You are not on a team." };
        
        await updatePayment(team_id, ppKey);
        revalidatePath("/dashboard/hackathon");
        return { message: "Payment proof uploaded successfully." };
    } catch { return { error: "Error uploading payment proof." }; }
}

export async function getPresignedUrl(
    docType: 'submission' | 'originality', 
    fileName: string, 
    fileType: string
) {
    const session = await verifySession();
    if (!session) return { error: "Unauthorized" };

    const folder = docType === 'submission' ? 'hack-sd' : 'hack-od';

    try {
        return await getPresignedUploadUrl(folder, fileName, fileType, session.account_id);
    } catch {
        return { error: "Failed to generate upload URL" };
    }
}

export async function submitProject(
    prevState: SubmitProjectFormState,
    formData: FormData
): Promise<SubmitProjectFormState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };
    const { account_id } = session;

    try {
        const sdKey = formData.get("submission_key") as string;
        const odKey = formData.get("originality_key") as string;
        
        const description = formData.get("submission_desc") as string;
        if (!description) return { error: "Description is required." };

        const extLinksJson = formData.get("external_links") as string;
        let extLinks: string[] = [];
        try {
            extLinks = JSON.parse(extLinksJson || "[]");
        } catch {
            return { error: "Invalid external links format." };
        }

        const team_id = await getTeamId(account_id);
        if (!team_id) return { error: "You are not on a team." };

        await updateSubmission(team_id, sdKey, description, extLinks);

        if (odKey) {
            await DB`UPDATE hack_team SET od_link = ${odKey}, od_verified = 0 WHERE team_id = ${team_id}`;
        }

        revalidatePath("/dashboard/hackathon");
        return { message: "Project submitted successfully." };

    } catch (e) {
        console.error("Submit Project Error:", e);
        return { error: "An error occurred during submission." };
    }
}

export async function getFinalistUploadUrl(fileName: string, fileType: string, type: 'pdf' | 'slides') {
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");

  const teamId = await getTeamId(session.account_id);

  const folder = type === 'pdf' ? 'finals/pdf' : 'finals/slides';
  
  const { signedUrl, key } = await getPresignedUploadUrl(folder, fileName, fileType, teamId);

  return { signedUrl, key };
}

export async function saveFinalistProject(fileKey: string, links: { title: string; url: string }[]) {
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");
  const teamId = await getTeamId(session.account_id);

  const team = await DB`SELECT final_pdf_path FROM hack_team WHERE team_id = ${teamId}`;
  if (team[0].final_pdf_path) {
    throw new Error("Submission already exists. Cannot overwrite.");
  }

  await DB`
    UPDATE hack_team 
    SET 
      final_pdf_path = ${fileKey},
      final_links = ${JSON.stringify(links)}
    WHERE team_id = ${teamId}
  `;

  revalidatePath("/dashboard/hackathon");
  return { success: true };
}

export async function saveFinalistSlides(fileKey: string) {
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");
  const teamId = await getTeamId(session.account_id);

  await DB`
    UPDATE hack_team 
    SET final_slides_path = ${fileKey}
    WHERE team_id = ${teamId}
  `;

  revalidatePath("/dashboard/hackathon");
  return { success: true };
}