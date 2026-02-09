"use server";

import { DB } from "@/lib/DB";
import { getSignedUrlForR2 } from "@/lib/R2";
import { revalidatePath } from "next/cache";
import { TeamPaper } from "../types/Admin";

export async function getPaperCompetitionData() {
  const data = await DB`
    SELECT 
      t.*,
      COALESCE(
        jsonb_agg(
          m.* ORDER BY m.name ASC
        ) FILTER (WHERE m.account_id IS NOT NULL), 
        '[]'
      ) as members
    FROM paper_team t
    LEFT JOIN paper_member m ON t.team_id = m.team_id
    GROUP BY t.team_id
    ORDER BY t.is_finalist DESC, t.code ASC;
  `;
  return data as TeamPaper[]; 
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
export async function updatePaperStatus(
  id: string, 
  type: 'team' | 'member', 
  field: string, 
  value: string | number, 
  mode: 'update' | 'remove_note' = 'update'
) {
  try {
    // --- CASE A: NOTES ---
    if (field === 'notes') {
       if (type === 'team') {
         if (mode === 'remove_note') {
           await DB`UPDATE paper_team SET notes = array_remove(notes, ${String(value)}) WHERE team_id = ${id}`;
         } else {
           await DB`UPDATE paper_team SET notes = array_append(notes, ${String(value)}) WHERE team_id = ${id}`;
         }
       } else {
         if (mode === 'remove_note') {
           await DB`UPDATE paper_member SET notes = array_remove(notes, ${String(value)}) WHERE account_id = ${id}`;
         } else {
           await DB`UPDATE paper_member SET notes = array_append(notes, ${String(value)}) WHERE account_id = ${id}`;
         }
       }
    } 
    
    // --- CASE B: TEAM COLUMNS ---
    else if (type === 'team') {
        const numVal = Number(value);
        switch (field) {
            case 'pp_verified':  await DB`UPDATE paper_team SET pp_verified = ${numVal} WHERE team_id = ${id}`; break;
            case 'sub_verified': await DB`UPDATE paper_team SET sub_verified = ${numVal} WHERE team_id = ${id}`; break;
            case 'od_verified':  await DB`UPDATE paper_team SET od_verified = ${numVal} WHERE team_id = ${id}`; break;
            case 'status':       await DB`UPDATE paper_team SET status = ${numVal} WHERE team_id = ${id}`; break;
            default: throw new Error(`Invalid team field: ${field}`);
        }
    } 
    
    // --- CASE C: MEMBER COLUMNS ---
    else if (type === 'member') {
        const numVal = Number(value);
        switch (field) {
            case 'sc_verified': await DB`UPDATE paper_member SET sc_verified = ${numVal} WHERE account_id = ${id}`; break;
            case 'fp_verified': await DB`UPDATE paper_member SET fp_verified = ${numVal} WHERE account_id = ${id}`; break;
            case 'status':      await DB`UPDATE paper_member SET status = ${numVal} WHERE account_id = ${id}`; break;
            default: throw new Error(`Invalid member field: ${field}`);
        }
    }

    revalidatePath('/admin/paper');
    return { success: true, message: "Updated successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Database update failed" };
  }
}