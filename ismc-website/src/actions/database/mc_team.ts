import { DB } from "@/lib/DB";
import { MemberMC, TeamMC } from "../types/MC";

export async function checkTeamNameExists(teamName: string): Promise<boolean> {
    const result = await DB`
        SELECT 1 FROM mc_team 
        WHERE name LIKE ${teamName}
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
            INSERT INTO mc_team (name, code) 
            VALUES (${teamName}, ${newCode}) 
            RETURNING team_id
        )
        INSERT INTO mc_member (team_id, account_id, email, role)
        SELECT team_id, ${accountId}, ${email}, 'MANAGER'
        FROM new_team
        RETURNING team_id
    `;

    if (result.length === 0) throw new Error("Failed to create team record");
}

export async function addMemberToTeam(teamId: string, accountId: string, email: string) {
    const result = await DB`
        INSERT INTO mc_member (team_id, account_id, email, role)
        SELECT ${teamId}, ${accountId}, ${email}, 'MEMBER'
        WHERE (
            SELECT count FROM mc_team WHERE team_id = ${teamId}
        ) < 7
        RETURNING account_id
    `;

    if (result.length === 0) {
        throw new Error("TEAM_FULL");
    }
}

export async function deleteMember(accountId: string) {
    await DB`
        DELETE FROM mc_member 
        WHERE account_id = ${accountId}
    `;
}

export async function fetchTeamPageData(accountId: string) {
    const teamMembership = await DB`SELECT team_id FROM mc_member WHERE account_id = ${accountId}`;
    
    if (teamMembership.length === 0) {
        throw new Error("User not assigned to a team.");
    }

    const teamId = teamMembership[0].team_id;

    const teamResult = await (DB`
        SELECT * FROM mc_team WHERE team_id = ${teamId}
    `) as TeamMC[];

    const membersResult = await (DB`
        SELECT * FROM mc_member WHERE team_id = ${teamId}
    `) as MemberMC[];

    return {
        team: teamResult[0],
        members: membersResult,
        currentUserAccountId: accountId,
    };
}

export async function getTeamId(accountId: string) {
    const teamResult = await DB`SELECT team_id FROM mc_member WHERE account_id = ${accountId}`;
    return teamResult.length > 0 ? teamResult[0].team_id : null;
}

export async function updatePayment(teamId: string, ppKey: string | null) {
    await DB`
        UPDATE mc_team 
        SET 
            pp_link = COALESCE(${ppKey}::text, pp_link),
            pp_verified = CASE WHEN ${ppKey}::text IS NOT NULL THEN 0 ELSE pp_verified END
        WHERE team_id = ${teamId}
    `;
}

export async function updateTeamDocs(teamId: string, spKey: string | null, olKey: string | null) {
    await DB`
        UPDATE mc_team 
        SET 
            sp_link = COALESCE(${spKey}::text, sp_link),
            sp_verified = CASE WHEN ${spKey}::text IS NOT NULL THEN 0 ELSE sp_verified END,
            ol_link = COALESCE(${olKey}::text, ol_link),
            ol_verified = CASE WHEN ${olKey}::text IS NOT NULL THEN 0 ELSE ol_verified END
        WHERE team_id = ${teamId}
    `;
}

export async function updateHealthDocs(teamId: string, hdKey: string | null) {
    await DB`
        UPDATE mc_team 
        SET 
            hd_link = COALESCE(${hdKey}::text, hd_link),
            hd_verified = CASE WHEN ${hdKey}::text IS NOT NULL THEN 0 ELSE hd_verified END
        WHERE team_id = ${teamId}
    `;
}

export async function updateAssignmentDocs(teamId: string, adKey: string | null) {
    await DB`
        UPDATE mc_team 
        SET 
            td_link = COALESCE(${adKey}::text, td_link),
            td_verified = CASE WHEN ${adKey}::text IS NOT NULL THEN 0 ELSE td_verified END
        WHERE team_id = ${teamId}
    `;
}