import { DB } from "@/lib/DB";
import { MemberHack, TeamHack } from "../types/Hackathon";

export async function checkTeamNameExists(teamName: string): Promise<boolean> {
    const result = await DB`
        SELECT 1 FROM hack_team 
        WHERE name ILIKE ${teamName}
    `;
    return result.length > 0;
}

export async function insertNewTeam(
    teamName: string,
    newCode: string,
    accountId: string,
    email: string
) {
    const result = await DB`
        WITH new_team AS (
            INSERT INTO hack_team (name, code) 
            VALUES (${teamName}, ${newCode}) 
            RETURNING team_id
        )
        INSERT INTO hack_member (team_id, account_id, email, role)
        SELECT team_id, ${accountId}, ${email}, 'MANAGER'
        FROM new_team
        RETURNING team_id
    `;

    if (result.length === 0) throw new Error("Failed to create team record");
}

export async function addMemberToTeam(teamId: string, accountId: string, email: string) {
    // Hackathon typically allows 3-5 members. 
    // Checking if count < 5.
    const result = await DB`
        INSERT INTO hack_member (team_id, account_id, email, role)
        SELECT ${teamId}, ${accountId}, ${email}, 'MEMBER'
        WHERE (
            SELECT count FROM hack_team WHERE team_id = ${teamId}
        ) < 5
        RETURNING account_id
    `;

    if (result.length === 0) {
        throw new Error("TEAM_FULL");
    }
}

export async function deleteMember(accountId: string) {
    await DB`
        DELETE FROM hack_member 
        WHERE account_id = ${accountId}
    `;
}

export async function fetchTeamPageData(accountId: string) {
    const teamMembership = await DB`SELECT team_id FROM hack_member WHERE account_id = ${accountId}`;
    
    if (teamMembership.length === 0) {
        throw new Error("User not assigned to a team.");
    }

    const teamId = teamMembership[0].team_id;

    const teamResult = await (DB`
        SELECT * FROM hack_team WHERE team_id = ${teamId}
    `) as TeamHack[];

    const membersResult = await (DB`
        SELECT * FROM hack_member WHERE team_id = ${teamId}
    `) as MemberHack[];

    return {
        team: teamResult[0],
        members: membersResult,
        currentUserAccountId: accountId,
    };
}

export async function getTeamId(accountId: string) {
    const teamResult = await DB`SELECT team_id FROM hack_member WHERE account_id = ${accountId}`;
    return teamResult.length > 0 ? teamResult[0].team_id : null;
}

export async function updatePayment(teamId: string, ppKey: string | null) {
    await DB`
        UPDATE hack_team 
        SET 
            pp_link = COALESCE(${ppKey}::text, pp_link),
            pp_verified = CASE WHEN ${ppKey}::text IS NOT NULL THEN 0 ELSE pp_verified END
        WHERE team_id = ${teamId}
    `;
}

export async function updateSubmission(
    teamId: string, 
    sdKey: string | null, 
    description: string,
    extLinks: string[]
) {
    // We use ::text[] to cast the array for Postgres
    await DB`
        UPDATE hack_team 
        SET 
            sd_link = COALESCE(${sdKey}::text, sd_link),
            sdd = ${description},
            ext_link = ${extLinks}::text[],
            
            -- Reset verification if new data is submitted
            sub_verified = 0
        WHERE team_id = ${teamId}
    `;
}