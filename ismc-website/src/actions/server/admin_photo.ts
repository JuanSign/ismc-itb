"use server";

import { DB } from "@/lib/DB";
import { getSignedUrlForR2 } from "@/lib/R2";
import { revalidatePath } from "next/cache";
import { PhotoMember } from "../types/Admin";

// --- 1. Fetch Data ---
export async function getPhotoData() {
  const data = await DB`
    SELECT * FROM photo_member
    ORDER BY name ASC;
  `;
  return data as PhotoMember[]; 
}

// --- 2. Sign URL ---
export async function getSignedDocUrl(key: string | null) {
  if (!key) return { success: false, error: "No key provided" };
  try {
    const url = await getSignedUrlForR2(key);
    return { success: true, url };
  } catch (error) {
    console.error("Signing error:", error);
    return { success: false, error: "Failed to sign URL" };
  }
}

// --- 3. Update Status / Notes ---
export async function updatePhotoStatus(
  id: string, 
  field: string, 
  value: string | number, 
  mode: 'update' | 'remove_note' = 'update'
) {
  try {
    // --- CASE A: NOTES ---
    if (field === 'notes') {
       if (mode === 'remove_note') {
         await DB`UPDATE photo_member SET notes = array_remove(notes, ${String(value)}) WHERE account_id = ${id}`;
       } else {
         await DB`UPDATE photo_member SET notes = array_append(notes, ${String(value)}) WHERE account_id = ${id}`;
       }
    } 
    
    // --- CASE B: COLUMNS ---
    else {
        const numVal = Number(value);
        switch (field) {
            // Personal
            case 'sc_verified': await DB`UPDATE photo_member SET sc_verified = ${numVal} WHERE account_id = ${id}`; break;
            case 'fp_verified': await DB`UPDATE photo_member SET fp_verified = ${numVal} WHERE account_id = ${id}`; break;
            
            // Competition
            case 'pp_verified':  await DB`UPDATE photo_member SET pp_verified = ${numVal} WHERE account_id = ${id}`; break;
            case 'od_verified':  await DB`UPDATE photo_member SET od_verified = ${numVal} WHERE account_id = ${id}`; break;
            case 'sub_verified': await DB`UPDATE photo_member SET sub_verified = ${numVal} WHERE account_id = ${id}`; break;
            
            // Overall Status
            case 'status':       await DB`UPDATE photo_member SET status = ${numVal} WHERE account_id = ${id}`; break;
            
            default: throw new Error(`Invalid field: ${field}`);
        }
    }

    revalidatePath('/admin/photo');
    return { success: true, message: "Updated successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Database update failed" };
  }
}