import { and } from "drizzle-orm";
import { DateTime } from "luxon";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";
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

    const thisDay = DateTime.fromObject({
        month: parseInt(month),
        day: parseInt(day),
        year: parseInt(year),
    }) as DateTime<true>;

    const events = await db.query.calendarEvents.findMany({
        where: (events, { eq }) =>
            and(
                eq(events.startMonth, thisDay.month),
                eq(events.startDay, thisDay.day),
                eq(events.startYear, thisDay.year),
                eq(events.repeatType, "none")
            ),
        with: {
            calendar: true,
        },
    });

    const recurringEvents = await db.query.calendarEvents.findMany({
        where: (events, { ne, lte }) => and(ne(events.repeatType, "none")),
        with: {
            calendar: true,
        },
    });

    recurringEvents.forEach((recurringEvent) => {
        const startDate = DateTime.fromObject({
            month: recurringEvent.startMonth,
            day: recurringEvent.startDay,
            year: recurringEvent.startYear,
            hour: parseInt(recurringEvent.startTime.split(":")[0]),
            minute: parseInt(recurringEvent.startTime.split(":")[1]),
        }) as DateTime<true>;

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

        if (recurringEvent.repeatType === "daily" && beforeEndDate && afterStartDate) {
            events.push(recurringEvent);
        } else if (recurringEvent.repeatType === "weekly" && beforeEndDate && afterStartDate) {
            if (recurringEvent.daysOfWeek.split(",").includes(thisDay.weekday.toString())) {
                events.push(recurringEvent);
            }
        } else if (recurringEvent.repeatType === "monthly" && beforeEndDate && afterStartDate) {
            if (thisDay.day === startDate.day) {
                events.push(recurringEvent);
            }
        } else if (recurringEvent.repeatType === "yearly" && beforeEndDate && afterStartDate) {
            if (thisDay.day === startDate.day && thisDay.month === startDate.month) {
                events.push(recurringEvent);
            }
        }
    });

    return NextResponse.json(events);
}
