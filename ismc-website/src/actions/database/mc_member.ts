import { DB } from "@/lib/DB";
import { MedicalInfo } from "../types/MC";

export async function updateMember(
  accountId: string,
  idNo: string,
  bloodType: string,
  illness: MedicalInfo[] | null,
  allergy: MedicalInfo[] | null,
  scKey: string | null,
  fpKey: string | null
) {
  await DB`
    UPDATE mc_member
    SET
      id_no = ${idNo},
      blood_type = ${bloodType},
      illness = ${JSON.stringify(illness || [])}, 
      allergy = ${JSON.stringify(allergy || [])},

      sc_link = COALESCE(${scKey}::text, sc_link),
      sc_verified = CASE WHEN ${scKey}::text IS NOT NULL THEN 0 ELSE sc_verified END,

      fp_link = COALESCE(${fpKey}::text, fp_link),
      fp_verified = CASE WHEN ${fpKey}::text IS NOT NULL THEN 0 ELSE fp_verified END

    WHERE account_id = ${accountId}
  `;
}