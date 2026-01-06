"use server"

import { 
    RegisterPosterState, UpdateMemberFormState,
    UpdateBillingFormState, SubmitPosterFormState, UploadDocsFormState,
    PosterMember
} from "../types/Poster";
import { refreshSession, verifySession } from "./session";
import { DB } from "@/lib/DB";
import { 
    registerUser, unregisterUser, fetchPosterPageData,
    updateMemberDetails as dbUpdateMember, updatePayment, updateOriginality, updateSubmission
} from "@/actions/database/poster";
import { addEventToAccount, removeEventFromAccount } from "@/actions/database/account";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSignedUrlForR2, uploadFileToR2 } from "@/lib/R2";

export async function registerPoster(): Promise<RegisterPosterState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };
    const { account_id, email } = session;

    try {
        await registerUser(account_id, email);
        await addEventToAccount(account_id, "POSTER");
        await refreshSession(account_id);
    } catch (e) {
        console.error("Register Error:", e);
        return { error: "Registration failed." };
    }
    revalidatePath("/dashboard/poster");
    redirect("/dashboard/poster");
}

export async function leavePoster() {
    const session = await verifySession();
    if (!session) redirect("/");
    const { account_id } = session;
    try {
        await unregisterUser(account_id);
        await removeEventFromAccount(account_id, "POSTER");
        await refreshSession(account_id);
    } catch (error) { console.error("Leave Error:", error); }
    revalidatePath("/dashboard/poster");
    redirect("/dashboard");
}

export async function getPosterPageData() {
    const session = await verifySession();
    if (!session) redirect("/");
    const { account_id } = session;
    
    const member = await fetchPosterPageData(account_id);
    if (!member) redirect("/dashboard"); 

    // Note: SC Link is not signed here to save payload size. It is fetched via getMemberDocuments.
    if(member.fp_link) member.fp_link = await getSignedUrlForR2(member.fp_link);
    
    if(member.pp_link) member.pp_link = await getSignedUrlForR2(member.pp_link);
    if(member.od_link) member.od_link = await getSignedUrlForR2(member.od_link);
    if(member.sd_link) member.sd_link = await getSignedUrlForR2(member.sd_link);

    return { member, currentUserAccountId: account_id };
}

export async function getMemberDocuments(targetAccountId: string) {
    const session = await verifySession();
    if (!session) return null;

    try {
        const result = await DB`SELECT * FROM poster_member WHERE account_id = ${targetAccountId}`;
        if (result.length === 0) return null;
        
        const member = result[0];

        if (member.sc_link) member.sc_link = await getSignedUrlForR2(member.sc_link);
        if (member.fp_link) member.fp_link = await getSignedUrlForR2(member.fp_link);

        return member as PosterMember;
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
        
        // Files are handled by the orchestrator via uploadMemberDocument
        const scKey = null;
        const fpKey = null;

        await dbUpdateMember(account_id, name, institution, phoneNum, idNo, scKey, fpKey);
        revalidatePath("/dashboard/poster");
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

        const keyPrefix = docType === 'sc' ? 'poster-sc' : 'poster-fp';
        const fileKey = await uploadFileToR2(file, keyPrefix, targetAccountId);

        if (docType === 'sc') {
            await DB`UPDATE poster_member SET sc_link = ${fileKey}, sc_verified = 0 WHERE account_id = ${targetAccountId}`;
        } else {
            await DB`UPDATE poster_member SET fp_link = ${fileKey}, fp_verified = 0 WHERE account_id = ${targetAccountId}`;
        }

        revalidatePath("/dashboard/poster");
        return { success: true, message: "File uploaded successfully" };

    } catch (e) {
        console.error("Upload error:", e);
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
        const ppKey = await uploadFileToR2(ppFile, "poster-pp", account_id);
        
        await updatePayment(account_id, ppKey);
        revalidatePath("/dashboard/poster");
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
        const odKey = await uploadFileToR2(odFile, "poster-od", account_id);

        await updateOriginality(account_id, odKey);
        revalidatePath("/dashboard/poster");
        return { message: "Originality proof uploaded successfully." };
    } catch { return { error: "Error uploading document." }; }
}

export async function submitPoster(prevState: SubmitPosterFormState, formData: FormData): Promise<SubmitPosterFormState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };
    const { account_id } = session;

    try {
        const sdFile = formData.get("doc_submission") as File;
        const sdKey = (sdFile && sdFile.size > 0) ? await uploadFileToR2(sdFile, "poster-sd", account_id) : null;
        const description = formData.get("submission_desc") as string;

        await updateSubmission(account_id, sdKey, description);
        revalidatePath("/dashboard/poster");
        return { message: "Poster submitted successfully." };
    } catch (e) {
        console.error("Submit Poster Error:", e);
        return { error: "Error submitting poster." };
    }
}