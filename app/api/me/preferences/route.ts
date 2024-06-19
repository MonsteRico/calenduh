import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db/db";
import { users } from "~/db/schema/auth";
import getUser from "~/lib/getUser";
export const dynamic = "force-dynamic"; // defaults to auto
// GET /api/mes/[userId]/userPreferences
// get all events for the month/day/year passed in
export async function GET(request: NextRequest) {
    const user = await getUser(request);

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
