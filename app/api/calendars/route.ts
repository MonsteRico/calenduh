import { createId } from "@paralleldrive/cuid2";
import { and, eq, inArray } from "drizzle-orm";
import { DateTime } from "luxon";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db/db";
import { calendars } from "~/db/schema/main";
import getServerAuthSession from "~/lib/getServerAuthSession";

export const dynamic = "force-dynamic"; // defaults to auto

// GET /api/calendars
// get all calendars
export async function GET(request: NextRequest) {
    const session = await getServerAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
        return NextResponse.json(
            {
                error: "no user found",
            },
            { status: 404 }
        );
    }

    const calendars = await db.query.calendars.findMany({
        where: (calendars, { eq }) => eq(calendars.userId, userId
        ),
    });

    // get all of the users subscribed calendars
    const usersSubscribedCalendars = await db.query.usersSubscribedCalendars.findMany({
        where: (usersSubscribedCalendars, { eq }) => eq(usersSubscribedCalendars.userId, userId
        ),
    });

    const subscribedCalendarIds = usersSubscribedCalendars.map((calendar) => calendar.calendarId)

    subscribedCalendarIds.push(-1)

    const subscribedCalendars = await db.query.calendars.findMany({
        where: (calendars, {inArray}) => inArray(calendars.id, subscribedCalendarIds)
    })


    return NextResponse.json({myCalendars: calendars, subscribedCalendars: subscribedCalendars});
}

// POST /api/calendars
// create a new calendar
export async function POST(request: NextRequest) {
    const body = await request.json();

    const session = await getServerAuthSession();
    const userId = session?.user?.id

    if (!userId) {
        return NextResponse.json(
            {
                error: "no user found",
            },
            { status: 404 }
        );
    }

    const subscribeCode = createId()

    const calendar = await db.insert(calendars).values({
        name: body.name,
        color: body.color,
        userId: userId,
        subscribeCode,
    });

    return NextResponse.json(calendar);
}
