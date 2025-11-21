import { DB } from "@/lib/DB";
import { MedicalInfo } from "../types/MC";

export async function updateMember(
  accountId: string,
  name: string | null,
  institution: string | null,
  phone_num: string | null,
  idNo: string | null,
  bloodType: string | null,
  illness: MedicalInfo[] | null,
  allergy: MedicalInfo[] | null,
  scKey: string | null,
  fpKey: string | null
) {
  await DB`
    UPDATE mc_member
    SET
      name = COALESCE(${name}, name),
      institution = COALESCE(${institution}, institution),
      phone_num = COALESCE(${phone_num}, phone_num),
      id_no = COALESCE(${idNo}, id_no),
      blood_type = COALESCE(${bloodType}, blood_type),

      illness = COALESCE(${illness ? JSON.stringify(illness) : null}::jsonb, illness), 
      allergy = COALESCE(${allergy ? JSON.stringify(allergy) : null}::jsonb, allergy),

      sc_link = COALESCE(${scKey}::text, sc_link),
      sc_verified = CASE WHEN ${scKey}::text IS NOT NULL THEN 0 ELSE sc_verified END,

      fp_link = COALESCE(${fpKey}::text, fp_link),
      fp_verified = CASE WHEN ${fpKey}::text IS NOT NULL THEN 0 ELSE fp_verified END

    WHERE account_id = ${accountId}
  `;
}