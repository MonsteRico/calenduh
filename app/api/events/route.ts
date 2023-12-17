import { and, eq, inArray } from "drizzle-orm";
import { DateTime } from "luxon";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";
import { dbCalendar, dbCalendarEvent } from "~/lib/schema";
export const dynamic = "force-dynamic"; // defaults to auto
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

    const allEvents: (dbCalendarEvent & { calendar: dbCalendar })[] = [];

    const events = await db.query.calendarEvents.findMany({
        where: (events, { eq }) =>
            and(eq(events.month, parseInt(month)), eq(events.day, parseInt(day)), eq(events.year, parseInt(year))),
        with: {
            calendar: true,
        },
    });

    const recurringEvents = await db.query.recurringEvents.findMany({
        with: {
            calendar: true,
        },
    });

    recurringEvents.forEach((recurringEvent) => {
        const startDate = DateTime.fromObject({
            month: recurringEvent.startMonth,
            day: recurringEvent.startDay,
            year: recurringEvent.startYear,
        });

        const thisDay = DateTime.fromObject({
            month: parseInt(month),
            day: parseInt(day),
            year: parseInt(year as string),
        });
        const afterStartDate = thisDay.endOf("day") >= startDate;
        const beforeEndDate =
            !recurringEvent.endMonth ||
            recurringEvent.endMonth === 0 ||
            !recurringEvent.endDay ||
            recurringEvent.endDay === 0 ||
            !recurringEvent.endYear ||
            recurringEvent.endYear === 0 ||
            thisDay.startOf("day") <
                DateTime.fromObject({
                    month: recurringEvent.endMonth,
                    day: recurringEvent.endDay,
                    year: recurringEvent.endYear,
                }).endOf("day");

        const event: dbCalendarEvent & { calendar: dbCalendar } = {
            id: recurringEvent.id,
            title: recurringEvent.title,
            month: parseInt(month),
            day: parseInt(day),
            year: parseInt(year as string),
            startTime: recurringEvent.startTime,
            endTime: recurringEvent.endTime,
            calendarId: recurringEvent.calendarId,
            allDay: recurringEvent.allDay,
            calendar: recurringEvent.calendar,
        };
        if (afterStartDate && beforeEndDate) {
            const event: dbCalendarEvent & { calendar: dbCalendar } = {
                id: recurringEvent.id,
                title: recurringEvent.title,
                month: parseInt(month),
                day: parseInt(day),
                year: parseInt(year as string),
                startTime: recurringEvent.startTime,
                endTime: recurringEvent.endTime,
                calendarId: recurringEvent.calendarId,
                allDay: recurringEvent.allDay,
                calendar: recurringEvent.calendar,
            };
            if (recurringEvent.repeatType === "daily") {
                allEvents.push(event);
            } else if (recurringEvent.repeatType === "weekly") {
                const dayOfWeek = thisDay.weekday;
                if (recurringEvent.daysOfWeek.split(",").includes(dayOfWeek.toString())) {
                    allEvents.push(event);
                }
            } else if (recurringEvent.repeatType === "monthly") {
                if (thisDay.day === startDate.day) {
                    allEvents.push(event);
                }
            } else if (recurringEvent.repeatType === "yearly") {
                if (thisDay.day === startDate.day && thisDay.month === startDate.month) {
                    allEvents.push(event);
                }
            }
        }
    });

    return NextResponse.json([...events, ...allEvents]);
}
