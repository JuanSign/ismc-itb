"use server";

import { DB } from "@/lib/DB";
import { getSignedUrlForR2 } from "@/lib/R2";
import { revalidatePath } from "next/cache";
import { verifySession } from "./session";
import { redirect } from "next/navigation";

// --- 1. Fetch Data ---
export async function getMiningCompetitionData() {
  const session = await verifySession();
  
  if (!session || !session.is_admin) {
    redirect("/register");
  }
  
  const data = await DB`
    SELECT 
      t.*,
      COALESCE(
        jsonb_agg(
          m.* ORDER BY m.role ASC
        ) FILTER (WHERE m.account_id IS NOT NULL), 
        '[]'
      ) as members
    FROM mc_team t
    LEFT JOIN mc_member m ON t.team_id = m.team_id
    GROUP BY t.team_id
    ORDER BY t.code ASC;
  `;

  return data; 
}

// --- 2. Sign URL on Demand ---
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
export async function updateMCStatus(
  id: string, 
  type: 'team' | 'member', 
  field: string, 
  value: string | number, 
  mode: 'update' | 'remove_note' = 'update'
) {
  const session = await verifySession();
    
  if (!session || !session.is_admin) {
    redirect("/register");
  }
  
  try {
    if (field === 'notes') {
       if (type === 'team') {
         if (mode === 'remove_note') {
           await DB`UPDATE mc_team SET notes = array_remove(notes, ${String(value)}) WHERE team_id = ${id}`;
         } else {
           await DB`UPDATE mc_team SET notes = array_append(notes, ${String(value)}) WHERE team_id = ${id}`;
         }
       } else {
         if (mode === 'remove_note') {
           await DB`UPDATE mc_member SET notes = array_remove(notes, ${String(value)}) WHERE account_id = ${id}`;
         } else {
           await DB`UPDATE mc_member SET notes = array_append(notes, ${String(value)}) WHERE account_id = ${id}`;
         }
       }
    } 
    
    // --- CASE B: TEAM COLUMNS ---
    else if (type === 'team') {
        const numVal = Number(value);

        switch (field) {
            case 'pp_verified': await DB`UPDATE mc_team SET pp_verified = ${numVal} WHERE team_id = ${id}`; break;
            case 'sp_verified': await DB`UPDATE mc_team SET sp_verified = ${numVal} WHERE team_id = ${id}`; break;
            case 'ol_verified': await DB`UPDATE mc_team SET ol_verified = ${numVal} WHERE team_id = ${id}`; break;
            case 'hd_verified': await DB`UPDATE mc_team SET hd_verified = ${numVal} WHERE team_id = ${id}`; break;
            case 'td_verified': await DB`UPDATE mc_team SET td_verified = ${numVal} WHERE team_id = ${id}`; break;
            case 'status':      await DB`UPDATE mc_team SET status = ${numVal} WHERE team_id = ${id}`; break;
            default: throw new Error(`Invalid team field: ${field}`);
        }
    } 
    
    // --- CASE C: MEMBER COLUMNS ---
    else if (type === 'member') {
        const numVal = Number(value);

        switch (field) {
            case 'sc_verified': await DB`UPDATE mc_member SET sc_verified = ${numVal} WHERE account_id = ${id}`; break;
            case 'fp_verified': await DB`UPDATE mc_member SET fp_verified = ${numVal} WHERE account_id = ${id}`; break;
            case 'id_verified': await DB`UPDATE mc_member SET id_verified = ${numVal} WHERE account_id = ${id}`; break;
            case 'status':      await DB`UPDATE mc_member SET status = ${numVal} WHERE account_id = ${id}`; break;
            case 'general_note': 
                break;
            default: throw new Error(`Invalid member field: ${field}`);
        }
    }

    revalidatePath('/admin/mc');
    return { success: true, message: "Updated successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Database update failed" };
  }
}