"use server"

import { 
    CreateTeamFormState, createTeamSchema, 
    JoinTeamFormState, joinTeamSchema, 
    UpdateMemberFormState, medicalInfoSchema, MedicalInfo,
    UpdateBillingFormState, UploadDocsFormState, UploadHealthDocsFormState 
} from "../types/MC";
import { refreshSession, verifySession } from "./session";
import { DB } from "@/lib/DB";
import { 
    checkTeamNameExists, insertNewTeam, addMemberToTeam, 
    deleteMember, fetchTeamPageData, getTeamId, 
    updatePayment, updateTeamDocs, updateHealthDocs 
} from "@/actions/database/mc_team";
import { updateMember } from "@/actions/database/mc_member";
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
            const existing = await DB`SELECT 1 FROM mc_team WHERE code = ${newCode}`;
            if (existing.length === 0) isCodeUnique = true;
            attempts++;
        }

        if (!isCodeUnique) return { error: "Failed to generate unique code." };

        await insertNewTeam(teamName, newCode, account_id, email);
        
        await addEventToAccount(account_id, "MC");
        await refreshSession(account_id);

    } catch (e) {
        console.error("Create Team Error:", e);
        return { error: "An error occurred. Please try again." };
    }

    revalidatePath("/dashboard/mc");
    redirect("/dashboard/mc");
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
        const team = await DB`SELECT team_id FROM mc_team WHERE code = ${teamCode}`;
        if (team.length === 0) return { error: "Invalid team code." };
        
        const teamId = team[0].team_id;

        await addMemberToTeam(teamId, account_id, email);
        
        await addEventToAccount(account_id, "MC");
        await refreshSession(account_id);

    } catch(e){
        console.error("Join team error:", e);
        
        if (e instanceof Error && e.message === "TEAM_FULL") {
            return { error: "This team has reached the maximum of 7 members." };
        }

        if (e instanceof NeonDbError && e.code === '23505') { 
            return { error: "You are already in a team." };
        }

        return { error: "An error occurred while joining." };
    }

    revalidatePath("/dashboard/mc");
    redirect("/dashboard/mc");
}

export async function leaveTeam() {
    const session = await verifySession();
    if (!session) redirect("/");
    const { account_id } = session;

    try {
        await deleteMember(account_id);
        await removeEventFromAccount(account_id, "MC");
        await refreshSession(account_id);
    } catch (error) {
        console.error("Leave team error:", error);
    }

    revalidatePath("/dashboard/mc");
    redirect("/dashboard");
}

export async function getTeamPageData() {
    const session = await verifySession();
    if (!session) redirect("/");
    const { account_id } = session;

    try {
        const data = await fetchTeamPageData(account_id);
        for (const member of data.members) {
            if(member.sc_link) member.sc_link = await getSignedUrlForR2(member.sc_link);
            if(member.fp_link) member.fp_link = await getSignedUrlForR2(member.fp_link);
        }
        if(data.team.sp_link) data.team.sp_link = await getSignedUrlForR2(data.team.sp_link);
        if(data.team.ol_link) data.team.ol_link = await getSignedUrlForR2(data.team.ol_link);
        if(data.team.hd_link) data.team.hd_link = await getSignedUrlForR2(data.team.hd_link);
        if(data.team.pp_link) data.team.pp_link = await getSignedUrlForR2(data.team.pp_link);
        return data;
    } catch (e) {
        if ((e as Error).message === "User not assigned to a team.") {
             redirect("/dashboard/mc");
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
        const idNo = formData.get("id_no") as string;
        const bloodType = formData.get("blood_type") as string;
        const illnessJson = formData.get("illness") as string;
        const allergyJson = formData.get("allergy") as string;
        const scFile = formData.get("sc_link") as File;
        const fpFile = formData.get("fp_link") as File;

        const scKey = (scFile && scFile.size > 0) ? await uploadFileToR2(scFile, "member-sc", account_id) : null;
        const fpKey = (fpFile && fpFile.size > 0) ? await uploadFileToR2(fpFile, "member-fp", account_id) : null;

        let illness: MedicalInfo[] | null = null;
        let allergy: MedicalInfo[] | null = null;
        try {
            illness = medicalInfoSchema.safeParse(JSON.parse(illnessJson || "[]")).data ?? null;
            allergy = medicalInfoSchema.safeParse(JSON.parse(allergyJson || "[]")).data ?? null;
        } catch { return { error: "Failed to parse medical data." }; }

        await updateMember(account_id, idNo, bloodType, illness, allergy, scKey, fpKey);

        revalidatePath("/dashboard/mc/team");
        return { message: "Details saved successfully." };
    } catch (e) {
        console.error("Update Member Error:", e);
        return { error: "An error occurred while saving." };
    }
}

export async function uploadTeamDocuments(
    prevState: UploadDocsFormState,
    formData: FormData
): Promise<UploadDocsFormState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };
    const { account_id } = session;

    try {
        const spFile = formData.get("doc_statement_participants") as File;
        const olFile = formData.get("doc_official_statement") as File;

        if ((!spFile || spFile.size === 0) && (!olFile || olFile.size === 0)) return { error: "Please upload at least one document." };

        const spKey = (spFile && spFile.size > 0) ? await uploadFileToR2(spFile, "team-sp", account_id) : null;
        const olKey = (olFile && olFile.size > 0) ? await uploadFileToR2(olFile, "team-ol", account_id) : null;

        const team_id = await getTeamId(account_id);
        if (!team_id) return { error: "You are not on a team." };

        await updateTeamDocs(team_id, spKey, olKey);
        revalidatePath("/dashboard/mc/team");
        return { message: "Documents uploaded successfully." };
    } catch { return { error: "Error uploading documents." }; }
}

export async function uploadHealthDocuments(
    prevState: UploadHealthDocsFormState,
    formData: FormData
): Promise<UploadHealthDocsFormState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };
    const { account_id } = session;

    try {
        const hdFile = formData.get("doc_health") as File;
        if (!hdFile || hdFile.size === 0) return { error: "Please select a file." };
        const hdKey = await uploadFileToR2(hdFile, "team-hd", account_id);
        const team_id = await getTeamId(account_id);
        if (!team_id) return { error: "You are not on a team." };
        await updateHealthDocs(team_id, hdKey);
        revalidatePath("/dashboard/mc/team");
        return { message: "Health Docs uploaded successfully." };
    } catch { return { error: "Error uploading health docs." }; }
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
        const ppKey = await uploadFileToR2(ppFile, "team-pp", account_id);
        const team_id = await getTeamId(account_id);
        if (!team_id) return { error: "You are not on a team." };
        await updatePayment(team_id, ppKey);
        revalidatePath("/dashboard/mc/team");
        return { message: "Payment proof uploaded successfully." };
    } catch { return { error: "Error uploading payment proof." }; }
}