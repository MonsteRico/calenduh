import { and, eq, inArray } from "drizzle-orm";
import { DateTime, Interval } from "luxon";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";
import { calendarEvents } from "~/lib/schema";
export const dynamic = "force-dynamic"; // defaults to auto
// GET /api/events/[eventId]
// get event by id
export async function GET(request: NextRequest, { params }: { params: { eventId: string } }) {
    const eventId = parseInt(params.eventId);
    const event = await db.query.calendarEvents.findFirst({
        where: (calendarEvents, { eq }) => eq(calendarEvents.id, eventId),
        with: {
            calendar: true,
        },
    });

    return NextResponse.json(event);
}

// PATCH /api/events/[eventId]
// update event by id, takes title, interval, allDay, daysOfWeek (an array of numbers), repeatType, and calendarId as body
export async function PATCH(request: NextRequest, { params }: { params: { eventId: string } }) {
    const eventId = parseInt(params.eventId);
    const body = await request.json();
    const { title, interval, calendarId, allDay, daysOfWeek, repeatType } = (await body.value) as {
        title?: string;
        interval?: Interval;
        calendarId?: number;
        allDay?: boolean;
        daysOfWeek?: number[];
        repeatType?: "daily" | "weekly" | "monthly" | "yearly";
    };
    if (!title && !interval && !calendarId && allDay === undefined && !daysOfWeek && !repeatType) {
        return NextResponse.json(
            {
                error: "title, interval, allDay, or calendarId are required",
            },
            { status: 400 }
        );
    }



    const startTime = interval ? interval.start?.toLocaleString(DateTime.TIME_24_SIMPLE) : null;
    const endTime = interval ? interval.end?.toLocaleString(DateTime.TIME_24_SIMPLE) : null;
    const startMonth = interval ? interval.start?.month : null;
    const startDay = interval ? interval.start?.day : null;
    const startYear = interval ? interval.start?.year : null;
    const endMonth = interval ? interval.end?.month : null;
    const endDay = interval ? interval.end?.day : null;
    const endYear = interval ? interval.end?.year : null;

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

    const daysOfWeekString = daysOfWeek ? daysOfWeek.join(",") : null;

    await db
        .update(calendarEvents)
        .set({
            title: title ?? originalEvent.title,
            startTime: startTime ?? originalEvent.startTime,
            endTime: endTime ?? originalEvent.endTime,
            startMonth: startMonth ?? originalEvent.startMonth,
            startDay: startDay ?? originalEvent.startDay,
            startYear: startYear ?? originalEvent.startYear,
            endMonth: endMonth ?? originalEvent.endMonth,
            endDay: endDay ?? originalEvent.endDay,
            endYear: endYear ?? originalEvent.endYear,
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

    await db.delete(calendarEvents).where(eq(calendarEvents.id, eventId));

    return NextResponse.json(event);
}
