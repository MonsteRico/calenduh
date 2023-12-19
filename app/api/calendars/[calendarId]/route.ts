import { and, eq, inArray } from "drizzle-orm";
import { DateTime } from "luxon";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";
import { calendarEvents, calendars } from "~/lib/schema";

export const dynamic = "force-dynamic"; // defaults to auto

// GET /api/calendars/[calendarId]
// get a calendar by id
export async function GET(request: NextRequest, { params }: { params: { calendarId: string } }) {
    const calendarId = parseInt(params.calendarId);

    const calendar = await db.query.calendars.findFirst({
        where: (calendars, { eq }) => eq(calendars.id, calendarId),
    });

    if (!calendar) {
        return NextResponse.json(
            {
                error: "calendar not found",
            },
            { status: 404 }
        );
    }

    return NextResponse.json(calendar);
}

// PATCH /api/calendars/[calendarId]
// update a calendar by id
export async function PATCH(request: NextRequest, { params }: { params: { calendarId: string } }) {
    const calendarId = parseInt(params.calendarId);

    const calendar = await db.query.calendars.findFirst({
        where: (calendars, { eq }) => eq(calendars.id, calendarId),
    });

    if (!calendar) {
        return NextResponse.json(
            {
                error: "calendar not found",
            },
            { status: 404 }
        );
    }

    const body = await request.json();
    const updatedCalendar = await db
        .update(calendars)
        .set({
            name: body.name ?? calendar.name,
            color: body.color ?? calendar.color,
        })
        .where(eq(calendars.id, calendarId));

    return NextResponse.json({
        ...calendar,
        name: body.name ?? calendar.name,
        color: body.color ?? calendar.color,
    });
}

// DELETE /api/calendars/[calendarId]
// delete a calendar by id
export async function DELETE(request: NextRequest, { params }: { params: { calendarId: string } }) {
    const calendarId = parseInt(params.calendarId);

    const calendar = await db.query.calendars.findFirst({
        where: (calendars, { eq }) => eq(calendars.id, calendarId),
    });

    if (!calendar) {
        return NextResponse.json(
            {
                error: "calendar not found",
            },
            { status: 404 }
        );
    }

    await db.delete(calendars).where(eq(calendars.id, calendarId));
    await db.delete(calendarEvents).where(eq(calendarEvents.calendarId, calendarId));
    return NextResponse.json({});
}