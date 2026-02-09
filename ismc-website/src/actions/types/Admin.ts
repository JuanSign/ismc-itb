import { MemberHack } from "./Hackathon";
import { MemberMC } from "./MC";
import { MemberPaper } from "./Paper";

export interface MCTeam {
  team_id: string;
  name: string;
  code: string;
  count: number;
  status: number;
  notes: string[];
  // Document Links (Keys from DB)
  pp_link: string | null;
  sp_link: string | null;
  ol_link: string | null;
  hd_link: string | null;
  td_link: string | null;
  // Verification Status
  pp_verified: number;
  sp_verified: number;
  ol_verified: number;
  hd_verified: number;
  td_verified: number;
  // Nested Members
  members: MemberMC[];
}

export interface PaperTeam {
  team_id: string;
  name: string;
  code: string;
  count: number;
  status: number;
  notes: string[] | null;
  
  // Payment
  pp_link: string | null;
  pp_verified: number;

  // Submission (Abstract / Full Paper)
  sd_link: string | null; 
  sdd: string | null;     // Description/Title/Theme
  sub_verified: number;

  // Originality
  od_link: string | null; 
  od_verified: number;

  members: MemberPaper[];
}

export type HackTeam = {
  team_id: string;
  name: string;
  code: string;
  count: number;
  status: number;
  notes: string[] | null;
  
  pp_link: string | null;
  pp_verified: number;

  sd_link: string | null;
  sdd: string | null;
  od_link: string | null;
  od_verified: number;
  sub_verified: number;
  ext_link: string[] | null;

  is_finalist: boolean;
  final_pdf_path: string | null;
  final_links: { title: string; url: string }[] | null;
  final_slides_path: string | null;
  
  members: MemberHack[]; 
}

export interface PosterMember {
  account_id: string;
  email: string;
  
  name: string | null;
  institution: string | null;
  phone_num: string | null;
  id_no: string | null;
  
  // Personal Docs
  sc_link: string | null;
  sc_verified: number;
  fp_link: string | null;
  fp_verified: number;

  // Competition Docs
  pp_link: string | null;
  pp_verified: number;
  od_link: string | null; // Originality
  od_verified: number;

  // Submission
  sd_link: string | null; 
  sdd: string | null;     // Description/Title
  sub_verified: number;
  
  status: number;
  notes: string[] | null;
}

export interface PhotoMember {
  account_id: string;
  email: string;
  
  name: string | null;
  institution: string | null;
  phone_num: string | null;
  id_no: string | null;
  
  // Personal Docs
  sc_link: string | null;
  sc_verified: number;
  fp_link: string | null;
  fp_verified: number;

  // Competition Docs
  pp_link: string | null;
  pp_verified: number;
  
  // Submission
  sd_link: string | null; // The Photo
  sdd: string | null;     // Description/Caption
  sub_verified: number;

  od_link: string | null; // Originality
  od_verified: number;
  
  is_finalist: boolean; 
  ed_link: string | null;
  ed_verified: number;
  
  status: number;
  notes: string[] | null;
}