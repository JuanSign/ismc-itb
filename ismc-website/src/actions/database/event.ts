import { DB } from "@/lib/DB";

export type EventType = 'MT' | 'BTP';

export async function registerForEventDB(
    account_id: string, 
    event_type: EventType, 
    name: string, 
    phone: string, 
    email: string
) {
    await DB`
        INSERT INTO event_registrations (account_id, event_type, name, phone, email)
        VALUES (${account_id}, ${event_type}, ${name}, ${phone}, ${email})
    `;
}

export async function getRegisteredEventsDB(account_id: string): Promise<string[]> {
    const result = await DB`
        SELECT event_type 
        FROM event_registrations 
        WHERE account_id = ${account_id}
    `;
    return result.map(row => row.event_type);
}