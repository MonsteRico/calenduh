import { NextRequest } from "next/server";
import { db } from "~/db/db";
import { dbUser, users } from "~/db/schema/auth";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export default async function getUser(request?: NextRequest) : Promise<dbUser | null> {
    // get the bearer token from the request if it exists
    const userIdToken = request?.headers.get("x-authorization")?.replace("Bearer ", "");
    const { userId } = auth();
    if (userId) {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            with: {
                calendars: true,
                subscribedCalendars: true,
                defaultCalendar: true,
            }
        });
        if (user) {
            return user
        }
    }
    else if (userIdToken) {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userIdToken),
            with: {
                calendars: true,
                subscribedCalendars: true,
                defaultCalendar: true,
            }
        });
        if (user) {
            return user
        }
    }
    return null
}
