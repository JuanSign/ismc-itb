"use server"

import { 
    CreateTeamFormState, createTeamSchema, 
    JoinTeamFormState, joinTeamSchema, 
    UpdateMemberFormState,
    UpdateBillingFormState, 
    SubmitPaperFormState,
    UploadDocsFormState
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
import { getSignedUrlForR2, uploadFileToR2 } from "@/lib/R2";
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
        // Sign URLs
        for (const member of data.members) {
            if(member.sc_link) member.sc_link = await getSignedUrlForR2(member.sc_link);
            if(member.fp_link) member.fp_link = await getSignedUrlForR2(member.fp_link);
        }
        if(data.team.pp_link) data.team.pp_link = await getSignedUrlForR2(data.team.pp_link);
        if(data.team.sd_link) data.team.sd_link = await getSignedUrlForR2(data.team.sd_link);
        if(data.team.od_link) data.team.od_link = await getSignedUrlForR2(data.team.od_link);
        return data;
    } catch (e) {
        if ((e as Error).message === "User not assigned to a team.") redirect("/dashboard/paper");
        throw e;
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
        const scFile = formData.get("sc_link") as File;
        const fpFile = formData.get("fp_link") as File;

        const scKey = (scFile && scFile.size > 0) ? await uploadFileToR2(scFile, "paper-sc", account_id) : null;
        const fpKey = (fpFile && fpFile.size > 0) ? await uploadFileToR2(fpFile, "paper-fp", account_id) : null;

        await updateMember(account_id, name, institution, phoneNum, idNo, scKey, fpKey);
        revalidatePath("/dashboard/paper/team");
        return { message: "Details saved successfully." };
    } catch (e) {
        console.error("Update Member Error:", e);
        return { error: "Error saving details." };
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

export async function uploadOriginalityDoc(prevState: UploadDocsFormState, formData: FormData): Promise<UploadDocsFormState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };
    const { account_id } = session;

    try {
        const odFile = formData.get("doc_originality") as File;
        if (!odFile || odFile.size === 0) return { error: "Please select a file." };
        const odKey = await uploadFileToR2(odFile, "paper-od", account_id);
        const team_id = await getTeamId(account_id);
        if (!team_id) return { error: "Not on a team." };

        await updateOriginality(team_id, odKey);
        revalidatePath("/dashboard/paper/team");
        return { message: "Originality proof uploaded successfully." };
    } catch { return { error: "Error uploading document." }; }
}

export async function submitPaper(prevState: SubmitPaperFormState, formData: FormData): Promise<SubmitPaperFormState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };
    const { account_id } = session;

    try {
        const sdFile = formData.get("doc_submission") as File;
        const sdKey = (sdFile && sdFile.size > 0) ? await uploadFileToR2(sdFile, "paper-sd", account_id) : null;
        const description = formData.get("submission_desc") as string;

        const team_id = await getTeamId(account_id);
        if (!team_id) return { error: "Not on a team." };

        await updateSubmission(team_id, sdKey, description);
        revalidatePath("/dashboard/paper/team");
        return { message: "Paper submitted successfully." };
    } catch (e) {
        console.error("Submit Paper Error:", e);
        return { error: "Error submitting paper." };
    }
}