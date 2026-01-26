"use server"

import { 
    RegisterPhotoState, UpdateMemberFormState,
    UpdateBillingFormState, SubmitPhotoFormState, 
    PhotoMember
} from "../types/Photo";
import { refreshSession, verifySession } from "./session";
import { DB } from "@/lib/DB";
import { 
    registerUser, unregisterUser, fetchPhotoPageData,
    updateMemberDetails as dbUpdateMember, updatePayment, updateOriginality, updateSubmission, updateEngagement as dbUpdateEngagement
} from "@/actions/database/photo";
import { addEventToAccount, removeEventFromAccount } from "@/actions/database/account";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSignedUrlForR2, uploadFileToR2, getPresignedUploadUrl } from "@/lib/R2";

type FormState = { error?: string; message?: string };

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
    } catch (error) { console.error(error); }
    revalidatePath("/dashboard/photo");
    redirect("/dashboard");
}

export async function getPhotoPageData() {
    const session = await verifySession();
    if (!session) redirect("/");
    const { account_id } = session;
    
    const member = await fetchPhotoPageData(account_id);
    if (!member) redirect("/dashboard"); 

    const signLink = async (link: string | null) => link ? await getSignedUrlForR2(link) : null;

    const [fp, pp, od, sd, ed, sc] = await Promise.all([
        signLink(member.fp_link),
        signLink(member.pp_link),
        signLink(member.od_link),
        signLink(member.sd_link),
        signLink(member.ed_link),
        signLink(member.sc_link)
    ]);

    member.fp_link = fp;
    member.pp_link = pp;
    member.od_link = od;
    member.sd_link = sd;
    member.ed_link = ed;
    member.sc_link = sc;

    return { member, currentUserAccountId: account_id };
}

export async function getMemberDocuments(targetAccountId: string) {
    const session = await verifySession();
    if (!session) return null;

    try {
        const result = await DB`SELECT * FROM photo_member WHERE account_id = ${targetAccountId}`;
        if (result.length === 0) return null;
        
        const member = result[0] as PhotoMember;
        
        // Parallel signing for efficiency
        const [sc, fp] = await Promise.all([
            member.sc_link ? getSignedUrlForR2(member.sc_link) : Promise.resolve(null),
            member.fp_link ? getSignedUrlForR2(member.fp_link) : Promise.resolve(null)
        ]);

        member.sc_link = sc;
        member.fp_link = fp;

        return member;
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
        
        await dbUpdateMember(account_id, name, institution, phoneNum, idNo, null, null);
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

        await dbUpdateMember(targetAccountId, null, null, null, null, 
            docType === 'sc' ? fileKey : null, 
            docType === 'fp' ? fileKey : null
        );

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

export async function updateEngagement(prevState: FormState, formData: FormData): Promise<FormState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };
    const { account_id } = session;

    try {
        const edKey = formData.get("engagement_key") as string;
        if (!edKey) return { error: "Missing file key." };
        
        await dbUpdateEngagement(account_id, edKey);
        revalidatePath("/dashboard/photo");
        return { message: "Engagement proof submitted successfully." };
    } catch { return { error: "Error submitting engagement proof." }; }
}

export async function getPresignedUrl(
    docType: 'submission' | 'originality' | 'engagement', 
    fileName: string, 
    fileType: string
) {
    const session = await verifySession();
    if (!session) return { error: "Unauthorized" };

    const FOLDER_MAP = {
        submission: 'photo-sd',
        originality: 'photo-od',
        engagement: 'photo-ed'
    };

    const folder = FOLDER_MAP[docType];
    if (!folder) return { error: "Invalid document type" };

    try {
        return await getPresignedUploadUrl(folder, fileName, fileType, session.account_id);
    } catch {
        return { error: "Failed to generate upload URL" };
    }
}

export async function submitPhoto(prevState: SubmitPhotoFormState, formData: FormData): Promise<SubmitPhotoFormState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };
    const { account_id } = session;

    try {
        const check = await DB`SELECT sub_verified FROM photo_member WHERE account_id = ${account_id}`;
        if (check.length > 0 && check[0].sub_verified > 0 && check[0].sub_verified !== 1) {
            return { error: "You have already submitted." };
        }

        const sdKey = formData.get("submission_key") as string;
        const odKey = formData.get("originality_key") as string;
        const description = formData.get("submission_desc") as string;

        if (!sdKey || !odKey || !description) {
            return { error: "Missing required fields or files." };
        }

        await updateSubmission(account_id, sdKey, description);
        await updateOriginality(account_id, odKey);

        revalidatePath("/dashboard/photo");
        return { message: "Photo submitted successfully." };
    } catch (e) {
        console.error("Submit Photo Error:", e);
        return { error: "Error submitting photo." };
    }
}