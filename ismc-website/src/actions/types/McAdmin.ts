import { MemberMC } from "./MC";

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