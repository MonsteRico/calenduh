import { and, eq, inArray } from "drizzle-orm";
import { DateTime } from "luxon";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";
export const dynamic = 'force-dynamic' // defaults to auto
// GET /api/events?month=12&day=15&year=2023
// get all events for the month/day/year passed in
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    const month = searchParams.get("month");
    const day = searchParams.get("day");
    const year = searchParams.get("year");
    if (!month || !day || !year) {
        return NextResponse.json(
            {
                error: "month, day, and year are required query parameters",
            },
            { status: 400 }
        );
    }

    const events = await db.query.calendarEvents.findMany({
        where: (events, { eq }) =>
            and(eq(events.month, parseInt(month)), eq(events.day, parseInt(day)), eq(events.year, parseInt(year))),
        with: {
            calendar: true,
        }
    });

    return NextResponse.json(events);
}
