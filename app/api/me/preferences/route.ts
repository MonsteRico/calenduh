import { and, eq } from "drizzle-orm";
import { DateTime } from "luxon";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db/db";
import { users } from "~/db/schema/auth";
import { calendarEvents } from "~/db/schema/main";
import getServerAuthSession from "~/lib/getServerAuthSession";
export const dynamic = "force-dynamic"; // defaults to auto
// GET /api/mes/[userId]/userPreferences
// get all events for the month/day/year passed in
export async function GET() {
    const session = await getServerAuthSession();
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json(
            {
                error: "no user found",
            },
            { status: 404 }
        );
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
        return NextResponse.json(new Error("User not found"), { status: 404 });
    }

    return NextResponse.json({
        accentColor: user.accent_color,
        startOnToday: user.startOnToday,
        startOnPreviousView: user.startOnPreviousView,
        defaultCalendarId: user.defaultCalendarId,
    });
}
