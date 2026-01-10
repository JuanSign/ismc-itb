"use server";

import { verifySession, refreshSession } from "@/actions/server/session";
import { addEventToAccount } from "@/actions/database/account";
import { registerForEventDB, EventType } from "@/actions/database/event";
import { revalidatePath } from "next/cache";

export type EventRegistrationState = {
    success?: boolean;
    error?: string;
    message?: string;
};

export async function registerEventAction(
    prevState: EventRegistrationState, 
    formData: FormData
): Promise<EventRegistrationState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated" };

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    
    // Type assertion with validation check
    const rawEventType = formData.get("event_type") as string;
    if (rawEventType !== 'MT' && rawEventType !== 'BTP') {
        return { error: "Invalid event type selected." };
    }
    const eventType = rawEventType as EventType;

    if (!name || !phone) {
        return { error: "Missing required fields" };
    }

    try {
        // 1. Save to Registration Table
        await registerForEventDB(session.account_id, eventType, name, phone, session.email);
        
        // 2. Add Event Flag to Account Table
        await addEventToAccount(session.account_id, eventType);
        
        // 3. Refresh Session
        await refreshSession(session.account_id);

        revalidatePath("/dashboard/event");
        return { success: true, message: "Successfully registered!" };
    } catch (e: unknown) {
        // Safe error handling for TypeScript
        console.error("Event Reg Error:", e);
        
        // Check for Postgres unique constraint violation (code 23505)
        if (typeof e === 'object' && e !== null && 'code' in e && (e as { code: string }).code === '23505') {
            return { error: "You are already registered for this event." };
        }
        
        return { error: "Failed to register. Please try again." };
    }
}