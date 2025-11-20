"use server"

import { 
    RegisterPhotoState, UpdateMemberFormState,
    UpdateBillingFormState, SubmitPhotoFormState, UploadDocsFormState
} from "../types/Photo";
import { refreshSession, verifySession } from "./session";
import { 
    registerUser, unregisterUser, fetchPhotoPageData,
    updateMemberDetails as dbUpdateMember, updatePayment, updateOriginality, updateSubmission
} from "@/actions/database/photo";
import { addEventToAccount, removeEventFromAccount } from "@/actions/database/account";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSignedUrlForR2, uploadFileToR2 } from "@/lib/R2";

// --- 1. REGISTER ---
export async function registerPhoto(): Promise<RegisterPhotoState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };
    const { account_id, email } = session;

    try {
        await registerUser(account_id, email);
        await addEventToAccount(account_id, "PHOTO");
        await refreshSession(account_id);
    } catch (e) {
        console.error("Register Error:", e);
        return { error: "Registration failed." };
    }
    revalidatePath("/dashboard/photo");
    redirect("/dashboard/photo");
}

// --- 2. LEAVE ---
export async function leavePhoto() {
    const session = await verifySession();
    if (!session) redirect("/");
    const { account_id } = session;
    try {
        await unregisterUser(account_id);
        await removeEventFromAccount(account_id, "PHOTO");
        await refreshSession(account_id);
    } catch (error) { console.error("Leave Error:", error); }
    revalidatePath("/dashboard/photo");
    redirect("/dashboard");
}

// --- 3. GET DATA ---
export async function getPhotoPageData() {
    const session = await verifySession();
    if (!session) redirect("/");
    const { account_id } = session;
    
    const member = await fetchPhotoPageData(account_id);
    if (!member) redirect("/dashboard"); 

    // Sign URLs
    if(member.sc_link) member.sc_link = await getSignedUrlForR2(member.sc_link);
    if(member.fp_link) member.fp_link = await getSignedUrlForR2(member.fp_link);
    if(member.pp_link) member.pp_link = await getSignedUrlForR2(member.pp_link);
    if(member.od_link) member.od_link = await getSignedUrlForR2(member.od_link);
    if(member.sd_link) member.sd_link = await getSignedUrlForR2(member.sd_link);

    return { member, currentUserAccountId: account_id };
}

// --- 4. UPDATE MEMBER DETAILS ---
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

        const scKey = (scFile && scFile.size > 0) ? await uploadFileToR2(scFile, "photo-sc", account_id) : null;
        const fpKey = (fpFile && fpFile.size > 0) ? await uploadFileToR2(fpFile, "photo-fp", account_id) : null;

        await dbUpdateMember(account_id, name, institution, phoneNum, idNo, scKey, fpKey);
        revalidatePath("/dashboard/photo");
        return { message: "Details saved successfully." };
    } catch (e) {
        console.error("Update Member Error:", e);
        return { error: "Error saving details." };
    }
}

// --- 5. BILLING ---
export async function updateBilling(prevState: UpdateBillingFormState, formData: FormData): Promise<UpdateBillingFormState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };
    const { account_id } = session;

    try {
        const ppFile = formData.get("payment_proof_url") as File;
        if (!ppFile || ppFile.size === 0) return { error: "Please select a file." };
        const ppKey = await uploadFileToR2(ppFile, "photo-pp", account_id);
        
        await updatePayment(account_id, ppKey);
        revalidatePath("/dashboard/photo");
        return { message: "Payment proof uploaded successfully." };
    } catch { return { error: "Error uploading payment proof." }; }
}

// --- 6. SUBMISSION & ORIGINALITY ---
export async function uploadOriginalityDoc(prevState: UploadDocsFormState, formData: FormData): Promise<UploadDocsFormState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };
    const { account_id } = session;

    try {
        const odFile = formData.get("doc_originality") as File;
        if (!odFile || odFile.size === 0) return { error: "Please select a file." };
        const odKey = await uploadFileToR2(odFile, "photo-od", account_id);

        await updateOriginality(account_id, odKey);
        revalidatePath("/dashboard/photo");
        return { message: "Originality proof uploaded successfully." };
    } catch { return { error: "Error uploading document." }; }
}

export async function submitPhoto(prevState: SubmitPhotoFormState, formData: FormData): Promise<SubmitPhotoFormState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };
    const { account_id } = session;

    try {
        const sdFile = formData.get("doc_submission") as File;
        const sdKey = (sdFile && sdFile.size > 0) ? await uploadFileToR2(sdFile, "photo-sd", account_id) : null;
        const description = formData.get("submission_desc") as string;

        await updateSubmission(account_id, sdKey, description);
        revalidatePath("/dashboard/photo");
        return { message: "Photo submitted successfully." };
    } catch (e) {
        console.error("Submit Photo Error:", e);
        return { error: "Error submitting photo." };
    }
}