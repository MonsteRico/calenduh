import { and, asc, eq, inArray } from "drizzle-orm";
import { DateTime } from "luxon";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";

// GET /api/month/events?month=12
// GET /api/month/events?month=12&year=2021
// get all events for the month passed in. year is assumed to be the current year, but can be overridden with the year query parameter
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    const month = searchParams.get("month");
    let year = searchParams.get("year");

    if (!month) {
        return NextResponse.json(
            {
                error: "month is a required query parameter",
            },
            { status: 400 }
        );
    }

    if (!year) {
        year = DateTime.now().year.toString();
    }

    const events = await db.query.calendarEvents.findMany({
        where: (events, { eq }) =>
            and(eq(events.month, parseInt(month)), eq(events.year, parseInt(year as string))),
        with: {
            calendar: true,
        },
        orderBy: (events, { asc }) => asc(events.day),
    });

    // return an array of objects with a key of "events" and a value of an array of events for each day of the month

    const numDaysInMonth = DateTime.fromObject({
        month: parseInt(month),
        year: parseInt(year),
    }).daysInMonth as number;

    const daysOfEvents = [];
    for (let i = 0; i < numDaysInMonth; i++) {
        daysOfEvents.push({
            events: events.filter((event) => event.day === i + 1),
        });
    }

    return NextResponse.json(daysOfEvents);
}
