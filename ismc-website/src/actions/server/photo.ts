"use server"

import { 
    RegisterPhotoState, UpdateMemberFormState,
    UpdateBillingFormState, SubmitPhotoFormState, UploadDocsFormState,
    PhotoMember
} from "../types/Photo";
import { refreshSession, verifySession } from "./session";
import { DB } from "@/lib/DB";
import { 
    registerUser, unregisterUser, fetchPhotoPageData,
    updateMemberDetails as dbUpdateMember, updatePayment, updateOriginality, updateSubmission
} from "@/actions/database/photo";
import { addEventToAccount, removeEventFromAccount } from "@/actions/database/account";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSignedUrlForR2, uploadFileToR2 } from "@/lib/R2";

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

export async function getPhotoPageData() {
    const session = await verifySession();
    if (!session) redirect("/");
    const { account_id } = session;
    
    const member = await fetchPhotoPageData(account_id);
    if (!member) redirect("/dashboard"); 

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
        const result = await DB`SELECT * FROM photo_member WHERE account_id = ${targetAccountId}`;
        if (result.length === 0) return null;
        
        const member = result[0];

        if (member.sc_link) member.sc_link = await getSignedUrlForR2(member.sc_link);
        if (member.fp_link) member.fp_link = await getSignedUrlForR2(member.fp_link);

        return member as PhotoMember;
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

        await dbUpdateMember(account_id, name, institution, phoneNum, idNo, scKey, fpKey);
        revalidatePath("/dashboard/photo");
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

        const keyPrefix = docType === 'sc' ? 'photo-sc' : 'photo-fp';
        const fileKey = await uploadFileToR2(file, keyPrefix, targetAccountId);

        if (docType === 'sc') {
            await DB`UPDATE photo_member SET sc_link = ${fileKey}, sc_verified = 0 WHERE account_id = ${targetAccountId}`;
        } else {
            await DB`UPDATE photo_member SET fp_link = ${fileKey}, fp_verified = 0 WHERE account_id = ${targetAccountId}`;
        }

        revalidatePath("/dashboard/photo");
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
        const ppKey = await uploadFileToR2(ppFile, "photo-pp", account_id);
        
        await updatePayment(account_id, ppKey);
        revalidatePath("/dashboard/photo");
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