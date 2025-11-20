import { z } from "zod";

// --- Domain Types ---
export type TeamHack = {
  team_id: string;
  name: string;
  code: string;
  count: number;
  status: number;
  notes: string[] | null;
  
  pp_link: string | null;
  pp_verified: number;

  sd_link: string | null; // Submission Document
  sdd: string | null;     // Submission Description
  sub_verified: number;
  ext_link: string[] | null; // External Links
}

export type MemberHack = {
  account_id: string;
  email: string;
  role: 'MANAGER' | 'MEMBER';
  
  name: string | null;
  institution: string | null;
  phone_num: string | null;
  id_no: string | null;
  
  sc_link: string | null;
  sc_verified: number;
  
  fp_link: string | null;
  fp_verified: number;
  
  status: number;
  notes: string[] | null;
};

// --- Form States ---
export type CreateTeamFormState = { error?: string; };
export type JoinTeamFormState = { error?: string; };
export type UpdateMemberFormState = { error?: string; message?: string; };
export type UpdateBillingFormState = { error?: string; message?: string; };
export type SubmitProjectFormState = { error?: string; message?: string; }; // New for Hackathon

// --- Zod Schemas ---
export const createTeamSchema = z.object({
  teamName: z.string().min(3, "Team name must be at least 3 characters"),
});

export const joinTeamSchema = z.object({
  teamCode: z.string().regex(/^[A-Z]{5}$/, "Code must be 5 uppercase letters."),
});