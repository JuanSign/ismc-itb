import { z } from "zod";

export type TeamMC = {
  team_id: string;
  name: string;
  code: string;
  status: number;
  count: number;
  notes: string[] | null;
  pp_link: string | null;
  pp_verified: number;
  hd_link: string | null;
  hd_verified: number;
  sp_link: string | null; 
  sp_verified: number;
  ol_link: string | null;
  ol_verified: number;
}

export type MedicalInfo = { 
  name: string; 
  description?: string 
};

export type MemberMC = {
  account_id: string;
  email: string;
  name: string | null;
  institution: string | null;
  phone_num: string | null;
  blood_type: string | null;
  id_no: string | null;
  sc_link: string | null;
  sc_verified: number;
  fp_link: string | null;
  fp_verified: number;
  illness: MedicalInfo[] | null;
  allergy: MedicalInfo[] | null;
  status: number;
  role : 'MANAGER' | 'MEMBER';
  notes: string[] | null;
};

export type CreateTeamFormState = { error?: string; };
export type JoinTeamFormState = { error?: string; };
export type UpdateMemberFormState = { error?: string; message?: string; };
export type UpdateBillingFormState = { error?: string; message?: string; };
export type UploadDocsFormState = { error?: string; message?: string; };
export type UploadHealthDocsFormState = { error?: string; message?: string; };

export const medicalInfoSchema = z.array(z.object({
  name: z.string().min(1, "Name cannot be empty"),
  description: z.string().optional(),
})).optional().nullable();

export const createTeamSchema = z.object({
  teamName: z.string().min(3, "Team name must be at least 3 characters"),
});

export const joinTeamSchema = z.object({
  teamCode: z.string().regex(/^[A-Z]{5}$/, "Code must be 5 uppercase letters."),
});