"use server"

import { 
    CreateTeamFormState, createTeamSchema, 
    JoinTeamFormState, joinTeamSchema, 
    UpdateMemberFormState,
    UpdateBillingFormState, 
    SubmitProjectFormState
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
import { getSignedUrlForR2, uploadFileToR2 } from "@/lib/R2";
import { NeonDbError } from "@neondatabase/serverless";

// --- Helper ---
function generateTeamCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// --- 1. CREATE TEAM ---
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

// --- 2. JOIN TEAM ---
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
        console.error("Join team error:", e);
        
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

// --- 3. LEAVE TEAM ---
export async function leaveTeam() {
    const session = await verifySession();
    if (!session) redirect("/");
    const { account_id } = session;

    try {
        await deleteMember(account_id);
        await removeEventFromAccount(account_id, "HACK");
        await refreshSession(account_id);
    } catch (error) {
        console.error("Leave team error:", error);
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
        
        // Sign Member Docs
        for (const member of data.members) {
            if(member.sc_link) member.sc_link = await getSignedUrlForR2(member.sc_link);
            if(member.fp_link) member.fp_link = await getSignedUrlForR2(member.fp_link);
        }

        // Sign Team Docs
        if(data.team.pp_link) data.team.pp_link = await getSignedUrlForR2(data.team.pp_link);
        if(data.team.sd_link) data.team.sd_link = await getSignedUrlForR2(data.team.sd_link);
        
        return data;
    } catch (e) {
        if ((e as Error).message === "User not assigned to a team.") {
             redirect("/dashboard/hackathon");
        }
        throw e;
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
        
        const scFile = formData.get("sc_link") as File;
        const fpFile = formData.get("fp_link") as File;

        const scKey = (scFile && scFile.size > 0) ? await uploadFileToR2(scFile, "hack-sc", account_id) : null;
        const fpKey = (fpFile && fpFile.size > 0) ? await uploadFileToR2(fpFile, "hack-fp", account_id) : null;

        await updateMember(account_id, name, institution, phoneNum, idNo, scKey, fpKey);

        revalidatePath("/dashboard/hackathon");
        return { message: "Details saved successfully." };
    } catch (e) {
        console.error("Update Member Error:", e);
        return { error: "An error occurred while saving." };
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

export async function submitProject(
    prevState: SubmitProjectFormState,
    formData: FormData
): Promise<SubmitProjectFormState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };
    const { account_id } = session;

    try {
        // 1. Handle File (Submission Document)
        const sdFile = formData.get("doc_submission") as File;
        const sdKey = (sdFile && sdFile.size > 0) 
            ? await uploadFileToR2(sdFile, "hack-sd", account_id) 
            : null;

        // 2. Handle Description
        const description = formData.get("submission_desc") as string;
        if (!description) return { error: "Description is required." };

        // 3. Handle External Links (Expects JSON string from frontend)
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

        revalidatePath("/dashboard/hackathon");
        return { message: "Project submitted successfully." };

    } catch (e) {
        console.error("Submit Project Error:", e);
        return { error: "An error occurred during submission." };
    }
}