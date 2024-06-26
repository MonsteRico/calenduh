import { and } from "drizzle-orm";
import { DateTime } from "luxon";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db/db";
import { calendarEvents } from "~/db/schema/main";
import getUser from "~/lib/getUser";
export const dynamic = "force-dynamic"; // defaults to auto
// GET /api/events?month=12&day=15&year=2023
// get all events for the month/day/year passed in
export async function GET(request: NextRequest) {
        const user = await getUser(request);
    
    if (!user) {
        return NextResponse.json(new Error("User not found"), { status: 404 });
    }

    const userId = user.id;

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

    const calendars = await db.query.calendars.findMany({
        where: (calendars, { eq }) => eq(calendars.userId, userId),
    });

    const subscribedCalendars = await db.query.usersSubscribedCalendars.findMany({
        where: (subscribedCalendars, { eq }) => eq(subscribedCalendars.userId, userId),
        with: {
            calendar: true,
        },
    });

    const calendarIds = calendars.map((calendar) => calendar.id);

    subscribedCalendars.forEach((subscribedCalendar) => {
        calendarIds.push(subscribedCalendar.calendarId);
    });

    const thisDay = DateTime.fromObject({
        month: parseInt(month),
        day: parseInt(day),
        year: parseInt(year),
    }) as DateTime<true>;

    // get all events that are not recurring, are on this day, and are on one of the user's calendars
    const events = await db.query.calendarEvents.findMany({
        where: (events, { eq, inArray }) =>
            and(
                eq(events.startMonth, thisDay.month),
                eq(events.startDay, thisDay.day),
                eq(events.startYear, thisDay.year),
                eq(events.repeatType, "none"),
                inArray(events.calendarId, calendarIds)
            ),
        with: {
            calendar: true,
        },
    });

    const recurringEvents = await db.query.calendarEvents.findMany({
        where: (events, { ne, inArray }) => and(ne(events.repeatType, "none"), inArray(events.calendarId, calendarIds)),
        with: {
            calendar: true,
        },
    });

    recurringEvents.forEach((recurringEvent) => {
        const daysTurnedOffIsos = recurringEvent.daysTurnedOff.split(",");
        if (daysTurnedOffIsos.includes(thisDay.toISODate())) {
            return;
        }

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

// POST /api/events
// create a new event
export async function POST(request: NextRequest) {
    const body = await request.json();
        const user = await getUser(request);

    if (!user) {
        return NextResponse.json(new Error("User not found"), { status: 404 });
    }

    const userId = user.id;
    let fixedEndTime = body.endTime;
    // if endTime starts with "00", change it to "24" so it's not interpreted as the next day
    if (body.endTime && body.endTime.startsWith("00")) {
        fixedEndTime = "24" + body.endTime.substring(2);
    }

    const event = await db.insert(calendarEvents).values({
        userId: userId,
        calendarId: body.calendarId,
        allDay: body.allDay,
        daysOfWeek: body.daysOfWeekString,
        repeatType: body.repeatType,
        startDay: body.startDay,
        startMonth: body.startMonth,
        startYear: body.startYear,
        startTime: body.startTime,
        endTime: fixedEndTime,
        endDay: body.endDay,
        endMonth: body.endMonth,
        endYear: body.endYear,
        daysTurnedOff: "",
        numConflicts: 0,
        title: body.title,
    });

    console.log("event", event);

    return NextResponse.json({});
}
