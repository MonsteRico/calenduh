import { and, asc, eq, inArray } from "drizzle-orm";
import { DateTime } from "luxon";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";
import { dbCalendar, dbCalendarEvent } from "~/lib/schema";

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
        where: (events, { eq }) => and(eq(events.month, parseInt(month)), eq(events.year, parseInt(year as string))),
        with: {
            calendar: true,
        },
        orderBy: (events, { asc }) => asc(events.day),
    });

    const recurringEvents = await db.query.recurringEvents.findMany({
        with: {
            calendar: true,
        },
    });

    // return an array of objects with a key of "events" and a value of an array of events for each day of the month

    const numDaysInMonth = DateTime.fromObject({
        month: parseInt(month),
        year: parseInt(year),
    }).daysInMonth as number;

    const daysOfEvents: { events: (dbCalendarEvent & { calendar: dbCalendar })[] }[] = [];
    for (let i = 0; i < numDaysInMonth; i++) {
        daysOfEvents.push({
            events: events.filter((event) => event.day === i + 1),
        });
    }

    recurringEvents.forEach((recurringEvent) => {
        const startDate = DateTime.fromObject({
            month: recurringEvent.startMonth,
            day: recurringEvent.startDay,
            year: recurringEvent.startYear,
        });

        const dates = getRecurringDates(recurringEvent, startDate, numDaysInMonth);

        dates.forEach((date) => {
            const event: dbCalendarEvent & { calendar: dbCalendar } = {
                id: recurringEvent.id,
                title: recurringEvent.title,
                month: parseInt(month),
                day: date.day,
                year: parseInt(year as string),
                startTime: recurringEvent.startTime,
                endTime: recurringEvent.endTime,
                calendarId: recurringEvent.calendarId,
                allDay: recurringEvent.allDay,
                calendar: recurringEvent.calendar,
            };

            daysOfEvents[date.day - 1].events.push(event);
        });
    });

    return NextResponse.json(daysOfEvents);
}

function getRecurringDates(recurringEvent: any, startDate: DateTime, numDaysInMonth: number) {
    let dates: DateTime[] = [];

    for (let i = 0; i < numDaysInMonth; i++) {
        let thisDay = startDate.plus({ days: i });

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

        if (beforeEndDate || afterStartDate) {
            continue;
        }

        if (recurringEvent.repeatType === "daily" && beforeEndDate && afterStartDate) {
            dates.push(thisDay);
        } else if (recurringEvent.repeatType === "weekly" && beforeEndDate && afterStartDate) {
            if (recurringEvent.daysOfWeek.split(",").includes(thisDay.weekday.toString())) {
                dates.push(thisDay);
            }
        } else if (recurringEvent.repeatType === "monthly" && beforeEndDate && afterStartDate) {
            if (thisDay.day === startDate.day) {
                dates.push(thisDay);
            }
        } else if (recurringEvent.repeatType === "yearly" && beforeEndDate && afterStartDate) {
            if (thisDay.day === startDate.day && thisDay.month === startDate.month) {
                dates.push(thisDay);
            }
        }
    }

    return dates;
}
