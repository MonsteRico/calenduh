import { eq } from "drizzle-orm";
import { DateTime } from "luxon";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db/db";
import { calendarEvents } from "~/db/schema/main";
import getServerAuthSession from "~/lib/getServerAuthSession";
export const dynamic = "force-dynamic"; // defaults to auto
// GET /api/events/[eventId]
// get event by id
export async function GET(request: NextRequest, { params }: { params: { eventId: string } }) {
    const session = await getServerAuthSession(request);
    const userId = session?.user?.id;
    if (!userId) {
        return NextResponse.json(
            {
                error: "no user found",
            },
            { status: 404 }
        );
    }

    const eventId = parseInt(params.eventId);
    const event = await db.query.calendarEvents.findFirst({
        where: (calendarEvents, { eq }) => eq(calendarEvents.id, eventId),
        with: {
            calendar: true,
        },
    });

    if (!event) {
        return NextResponse.json(
            {
                error: "event not found",
            },
            { status: 404 }
        );
    }

    return NextResponse.json(event);
}

// PATCH /api/events/[eventId]
// update event by id, takes title, interval, allDay, repeatType, daysOfWeek, and calendarId as body
export async function PATCH(request: NextRequest, { params }: { params: { eventId: string } }) {
    const session = await getServerAuthSession(request);
    const userId = session?.user?.id;
    if (!userId) {
        return NextResponse.json(
            {
                error: "no user found",
            },
            { status: 404 }
        );
    }

    const eventId = parseInt(params.eventId);
    const body = await request.json();
    const {
        title,
        startDay,
        startMonth,
        startYear,
        startTime,
        endDay,
        endMonth,
        endYear,
        endTime,
        calendarId,
        allDay,
        daysOfWeekString,
        repeatType,
    } = body as {
        title?: string;
        startDay?: number;
        startMonth?: number;
        startYear?: number;
        startTime?: string;
        endDay?: number;
        endMonth?: number;
        endYear?: number;
        endTime?: string;
        calendarId?: number;
        allDay?: boolean;
        daysOfWeekString?: string;
        repeatType?: "daily" | "weekly" | "monthly" | "yearly";
    };

    console.log("body", body);

    if (
        !title &&
        !calendarId &&
        allDay === undefined &&
        !daysOfWeekString &&
        !repeatType &&
        !startTime &&
        !startDay &&
        !startMonth &&
        !startYear &&
        !endTime &&
        endDay !== undefined &&
        endMonth !== undefined &&
        endYear !== undefined
    ) {
        return NextResponse.json(
            {
                error: "no data provided",
            },
            { status: 400 }
        );
    }

    const originalEvent = await db.query.calendarEvents.findFirst({
        where: (calendarEvents, { eq }) => eq(calendarEvents.id, eventId),
    });

    if (!originalEvent) {
        return NextResponse.json(
            {
                error: "event not found",
            },
            { status: 404 }
        );
    }

    if (calendarId) {
        const calendar = await db.query.calendars.findFirst({
            where: (calendars, { eq }) => eq(calendars.id, calendarId),
        });
        if (!calendar) {
            return NextResponse.json(
                {
                    error: "calendar to change to not found",
                },
                { status: 404 }
            );
        }
    }

    let fixedEndTime = endTime;
    // if endTime starts with "00", change it to "24" so it's not interpreted as the next day
    if (endTime && endTime.startsWith("00")) {
        fixedEndTime = "24" + endTime.substring(2);
    }

    await db
        .update(calendarEvents)
        .set({
            title: title ?? originalEvent.title,
            startTime: startTime ?? originalEvent.startTime,
            endTime: fixedEndTime ?? originalEvent.endTime,
            startMonth: startMonth ?? originalEvent.startMonth,
            startDay: startDay ?? originalEvent.startDay,
            startYear: startYear ?? originalEvent.startYear,
            endMonth: endMonth ?? null,
            endDay: endDay ?? null,
            endYear: endYear ?? null,
            calendarId: calendarId ?? originalEvent.calendarId,
            allDay: allDay ?? originalEvent.allDay,
            daysOfWeek: daysOfWeekString ?? originalEvent.daysOfWeek,
            repeatType: repeatType ?? originalEvent.repeatType,
        })
        .where(eq(calendarEvents.id, eventId));

    const updatedEvent = await db.query.calendarEvents.findFirst({
        where: (calendarEvents, { eq }) => eq(calendarEvents.id, eventId),
        with: {
            calendar: true,
        },
    });

    return NextResponse.json(updatedEvent);
}

// DELETE /api/events/[eventId]
// delete event by id
// if day, month, and year query params are provided, it will instead turn off the event for that day (for toggling recurring events without deleting all instances)
export async function DELETE(request: NextRequest, { params }: { params: { eventId: string } }) {
    const eventId = parseInt(params.eventId);
    const event = await db.query.calendarEvents.findFirst({
        where: (calendarEvents, { eq }) => eq(calendarEvents.id, eventId),
    });

    if (!event) {
        return NextResponse.json(
            {
                error: "event not found",
            },
            { status: 404 }
        );
    }

    const searchParams = request.nextUrl.searchParams;
    if (searchParams.get("day") && searchParams.get("month") && searchParams.get("year")) {
        const day = parseInt(searchParams.get("day") as string);
        const month = parseInt(searchParams.get("month") as string);
        const year = parseInt(searchParams.get("year") as string);

        const date = DateTime.fromObject({
            day,
            month,
            year,
        }) as DateTime<true>;

        const daysTurnedOff = event.daysTurnedOff.split(",");
        daysTurnedOff.push(date.toISODate());

        await db
            .update(calendarEvents)
            .set({
                daysTurnedOff: daysTurnedOff.join(","),
            })
            .where(eq(calendarEvents.id, eventId));

        return NextResponse.json({ ...event, daysTurnedOff: daysTurnedOff.join(",") });
    }

    await db.delete(calendarEvents).where(eq(calendarEvents.id, eventId));

    return NextResponse.json(event);
}
