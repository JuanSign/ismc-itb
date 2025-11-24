import { DB } from "@/lib/DB";
import { MCTeam } from "../types/Admin";
import { verifySession } from "../server/session";
import { redirect } from "next/navigation";

export async function getMiningCompetitionData(): Promise<MCTeam[]> {
  const session = await verifySession();
  
  if (!session || !session.is_admin) {
    redirect("/register");
  }
  
  const result = await DB`
    SELECT 
      t.*,
      COALESCE(
        jsonb_agg(
          m.* ORDER BY m.name ASC
        ) FILTER (WHERE m.account_id IS NOT NULL), 
        '[]'
      ) as members
    FROM mc_team t
    LEFT JOIN mc_member m ON t.team_id = m.team_id
    GROUP BY t.team_id
    ORDER BY t.code ASC;
  `;

  return result as unknown as MCTeam[];
}