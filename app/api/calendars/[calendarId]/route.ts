import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db/db";
import { calendarEvents, calendars } from "~/db/schema/main";
import getUser from "~/lib/getUser";

export const dynamic = "force-dynamic"; // defaults to auto

// GET /api/calendars/[calendarId]
// get a calendar by id
export async function GET(request: NextRequest, { params }: { params: { calendarId: string } }) {
      const user = await getUser(request);

    if (!user) {
        return NextResponse.json(new Error("User not found"), { status: 404 });
    }



    const calendarId = parseInt(params.calendarId);

    if (calendarId === 0 || isNaN(calendarId)) {
        return NextResponse.json(
            {
                error: "calendar not found",
            },
            { status: 404 }
        );
    }

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
    const user = await getUser(request);

    if (!user) {
        return NextResponse.json(new Error("User not found"), { status: 404 });
    }

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
            name: calendar.isDefault ? "Default Calendar" : body.name ?? calendar.name,
            color: body.color ?? calendar.color,
        })
        .where(eq(calendars.id, calendarId));

    return NextResponse.json({
        ...calendar,
        name: calendar.isDefault ? "Default Calendar" : body.name ?? calendar.name,
        color: body.color ?? calendar.color,
    });
}

// DELETE /api/calendars/[calendarId]
// delete a calendar by id
export async function DELETE(request: NextRequest, { params }: { params: { calendarId: string } }) {
    const user = await getUser(request);

    if (!user) {
        return NextResponse.json(new Error("User not found"), { status: 404 });
    }

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


    if (calendar.userId !== user.id) {
        return NextResponse.json(
            {
                error: "you can't delete someone else's calendar",
            },
            { status: 401 }
        );
    }



    if (calendar.isDefault) {
        return NextResponse.json(
            {
                error: "cannot delete default calendar",
            },
            { status: 400 }
        );
    }

    await db.delete(calendars).where(eq(calendars.id, calendarId));
    await db.delete(calendarEvents).where(eq(calendarEvents.calendarId, calendarId));
    return NextResponse.json({});
}
