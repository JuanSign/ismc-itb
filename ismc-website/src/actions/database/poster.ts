import { DB } from "@/lib/DB";
import { PosterMember } from "../types/Poster";

export async function registerUser(accountId: string, email: string) {
    // Check if already registered
    const existing = await DB`SELECT 1 FROM poster_member WHERE account_id = ${accountId}`;
    if (existing.length > 0) return; // Already registered, do nothing

    await DB`
        INSERT INTO poster_member (account_id, email, status)
        VALUES (${accountId}, ${email}, 0)
    `;
}

export async function unregisterUser(accountId: string) {
    await DB`DELETE FROM poster_member WHERE account_id = ${accountId}`;
}

export async function fetchPosterPageData(accountId: string) {
    const result = await DB`SELECT * FROM poster_member WHERE account_id = ${accountId}`;
    if (result.length === 0) return null;
    return result[0] as PosterMember;
}

export async function updateMemberDetails(
  accountId: string,
  name: string,
  institution: string,
  phoneNum: string,
  idNo: string,
  scKey: string | null,
  fpKey: string | null
) {
  await DB`
    UPDATE poster_member
    SET
      name = ${name},
      institution = ${institution},
      phone_num = ${phoneNum},
      id_no = ${idNo},

      sc_link = COALESCE(${scKey}::text, sc_link),
      sc_verified = CASE WHEN ${scKey}::text IS NOT NULL THEN 0 ELSE sc_verified END,

      fp_link = COALESCE(${fpKey}::text, fp_link),
      fp_verified = CASE WHEN ${fpKey}::text IS NOT NULL THEN 0 ELSE fp_verified END

    WHERE account_id = ${accountId}
  `;
}

export async function updatePayment(accountId: string, ppKey: string | null) {
    await DB`
        UPDATE poster_member 
        SET 
            pp_link = COALESCE(${ppKey}::text, pp_link),
            pp_verified = CASE WHEN ${ppKey}::text IS NOT NULL THEN 0 ELSE pp_verified END
        WHERE account_id = ${accountId}
    `;
}

export async function updateOriginality(accountId: string, odKey: string | null) {
    await DB`
        UPDATE poster_member 
        SET 
            od_link = COALESCE(${odKey}::text, od_link),
            od_verified = CASE WHEN ${odKey}::text IS NOT NULL THEN 0 ELSE od_verified END
        WHERE account_id = ${accountId}
    `;
}

export async function updateSubmission(accountId: string, sdKey: string | null, description: string) {
    await DB`
        UPDATE poster_member 
        SET 
            sd_link = COALESCE(${sdKey}::text, sd_link),
            sdd = ${description},
            sub_verified = 0
        WHERE account_id = ${accountId}
    `;
}