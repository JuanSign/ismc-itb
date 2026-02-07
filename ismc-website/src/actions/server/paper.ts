"use server"

import { 
    CreateTeamFormState, createTeamSchema, 
    JoinTeamFormState, joinTeamSchema, 
    UpdateMemberFormState,
    UpdateBillingFormState, 
    SubmitPaperFormState,
    MemberPaper
} from "../types/Paper";
import { refreshSession, verifySession } from "./session";
import { DB } from "@/lib/DB";
import { 
    checkTeamNameExists, insertNewTeam, addMemberToTeam, 
    deleteMember, fetchTeamPageData, getTeamId, 
    updatePayment, updateSubmission, updateOriginality 
} from "@/actions/database/paper_team";
import { updateMember } from "@/actions/database/paper_member";
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

export async function createTeam(prevState: CreateTeamFormState, formData: FormData): Promise<CreateTeamFormState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };

    const validatedFields = createTeamSchema.safeParse({ teamName: formData.get("teamName") });
    if (!validatedFields.success) return { error: validatedFields.error.issues.map((e) => e.message).join(", ") };

    const { teamName } = validatedFields.data;
    const { account_id, email } = session;

    try {
        if (await checkTeamNameExists(teamName)) return { error: "Team name already taken." };

        let newCode = "", isCodeUnique = false, attempts = 0;
        while (!isCodeUnique && attempts < 5) {
            newCode = generateTeamCode();
            const existing = await DB`SELECT 1 FROM paper_team WHERE code = ${newCode}`;
            if (existing.length === 0) isCodeUnique = true;
            attempts++;
        }
        if (!isCodeUnique) return { error: "Failed to generate unique code." };

        await insertNewTeam(teamName, newCode, account_id, email);
        await addEventToAccount(account_id, "PAPER");
        await refreshSession(account_id);
    } catch (e) {
        console.error("Create Team Error:", e);
        return { error: "An error occurred." };
    }
    revalidatePath("/dashboard/paper");
    redirect("/dashboard/paper");
}

export async function joinTeam(prevState: JoinTeamFormState, formData: FormData): Promise<JoinTeamFormState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };

    const validatedFields = joinTeamSchema.safeParse({ teamCode: formData.get("teamCode")?.toString().toUpperCase() });
    if (!validatedFields.success) return { error: validatedFields.error.issues.map((e) => e.message).join(", ") };

    const { teamCode } = validatedFields.data;
    const { account_id, email } = session;

    try {
        const team = await DB`SELECT team_id FROM paper_team WHERE code = ${teamCode}`;
        if (team.length === 0) return { error: "Invalid team code." };

        await addMemberToTeam(team[0].team_id, account_id, email);
        await addEventToAccount(account_id, "PAPER");
        await refreshSession(account_id);
    } catch(e){
        console.error("Join Error:", e);
        if (e instanceof Error && e.message === "TEAM_FULL") return { error: "Team is full (Max 3)." };
        if (e instanceof NeonDbError && e.code === '23505') return { error: "Already in a team." };
        return { error: "Error joining team." };
    }
    revalidatePath("/dashboard/paper");
    redirect("/dashboard/paper");
}

export async function leaveTeam() {
    const session = await verifySession();
    if (!session) redirect("/");
    const { account_id } = session;
    try {
        await deleteMember(account_id);
        await removeEventFromAccount(account_id, "PAPER");
        await refreshSession(account_id);
    } catch (error) { console.error("Leave Error:", error); }
    revalidatePath("/dashboard/paper");
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
        if(data.team.final_paper_path) {
            data.team.final_paper_path = await getSignedUrlForR2(data.team.final_paper_path);
        }
        
        return data;
    } catch (e) {
        if ((e as Error).message === "User not assigned to a team.") redirect("/dashboard/paper");
        throw e;
    }
}

export async function getMemberDocuments(targetAccountId: string) {
    const session = await verifySession();
    if (!session) return null;

    try {
        const result = await DB`SELECT * FROM paper_member WHERE account_id = ${targetAccountId}`;
        if (result.length === 0) return null;
        
        const member = result[0];

        if (member.sc_link) member.sc_link = await getSignedUrlForR2(member.sc_link);
        if (member.fp_link) member.fp_link = await getSignedUrlForR2(member.fp_link);

        return member as MemberPaper;
    } catch (error) {
        console.error("Error fetching member docs:", error);
        return null;
    }
}

export async function updateMemberDetails(prevState: UpdateMemberFormState, formData: FormData): Promise<UpdateMemberFormState> {
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
        
        revalidatePath("/dashboard/paper/team");
        return { message: "Details saved successfully." };
    } catch (e) {
        console.error("Update Member Error:", e);
        return { error: "Error saving details." };
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
        
        const keyPrefix = docType === 'sc' ? 'paper-sc' : 'paper-fp';
        const fileKey = await uploadFileToR2(file, keyPrefix, targetAccountId);
        
        if (!fileKey) return { error: "R2 Upload failed to return a key" };

        if (docType === 'sc') {
            await DB`UPDATE paper_member SET sc_link = ${fileKey}, sc_verified = 0 WHERE account_id = ${targetAccountId}`;
        } else {
            await DB`UPDATE paper_member SET fp_link = ${fileKey}, fp_verified = 0 WHERE account_id = ${targetAccountId}`;
        }

        revalidatePath("/dashboard/paper");
        return { success: true, message: "File uploaded successfully" };

    } catch (e) {
        console.error("[UPLOAD DEBUG] EXCEPTION THROWN:", e);
        return { error: "Upload failed" };
    }
}

export async function updateBilling(prevState: UpdateBillingFormState, formData: FormData): Promise<UpdateBillingFormState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };
    const { account_id } = session;

    try {
        const ppFile = formData.get("payment_proof_url") as File;
        if (!ppFile || ppFile.size === 0) return { error: "Please select a file." };
        const ppKey = await uploadFileToR2(ppFile, "paper-pp", account_id);
        const team_id = await getTeamId(account_id);
        if (!team_id) return { error: "Not on a team." };
        
        await updatePayment(team_id, ppKey);
        revalidatePath("/dashboard/paper/team");
        return { message: "Payment proof uploaded successfully." };
    } catch { return { error: "Error uploading payment proof." }; }
}

// --- NEW PRESIGNED URL ACTIONS ---

export async function getPresignedUrl(
    docType: 'submission' | 'originality', 
    fileName: string, 
    fileType: string
) {
    const session = await verifySession();
    if (!session) return { error: "Unauthorized" };

    const folder = docType === 'submission' ? 'paper-sd' : 'paper-od';

    try {
        return await getPresignedUploadUrl(folder, fileName, fileType, session.account_id);
    } catch {
        return { error: "Failed to generate upload URL" };
    }
}

export async function submitPaper(prevState: SubmitPaperFormState, formData: FormData): Promise<SubmitPaperFormState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };
    const { account_id } = session;

    try {
        const sdKey = formData.get("submission_key") as string;
        const odKey = formData.get("originality_key") as string;
        const description = formData.get("submission_desc") as string;

        const team_id = await getTeamId(account_id);
        if (!team_id) return { error: "Not on a team." };

        // 1. Update Paper Submission (if provided or description changed)
        // If sdKey is null/empty, the DB function usually keeps the old one or handles it.
        // Assuming updateSubmission expects (team_id, sdKey | null, description)
        await updateSubmission(team_id, sdKey || null, description);

        // 2. Update Originality (if provided)
        if (odKey) {
            await updateOriginality(team_id, odKey);
        }

        revalidatePath("/dashboard/paper/team");
        return { message: "Paper submitted successfully." };
    } catch (e) {
        console.error("Submit Paper Error:", e);
        return { error: "Error submitting paper." };
    }
}

export async function getPaperFinalistUploadUrl(fileName: string, fileType: string) {
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");
  const teamId = await getTeamId(session.account_id);

  const { signedUrl, key } = await getPresignedUploadUrl("paper-finals", fileName, fileType, teamId);

  return { signedUrl, key };
}

export async function saveFinalistPaper(fileKey: string) {
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");
  const teamId = await getTeamId(session.account_id);

  const team = await DB`SELECT final_paper_path FROM paper_team WHERE team_id = ${teamId}`;
  if (team[0].final_paper_path) {
    throw new Error("Final paper has already been submitted. Cannot overwrite.");
  }

  await DB`
    UPDATE paper_team 
    SET final_paper_path = ${fileKey}
    WHERE team_id = ${teamId}
  `;

  revalidatePath("/dashboard/paper");
  return { success: true };
}