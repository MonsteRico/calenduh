import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db/db";
import { users } from "~/db/schema/auth";
import { calendars } from "~/db/schema/main";
import getServerAuthSession from "~/lib/getServerAuthSession";
export const dynamic = "force-dynamic"; // defaults to auto

// PATCH /api/me
export async function PATCH(request: NextRequest) {
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
    const body = await request.json();
    const { accentColor, startOnToday, startOnPreviousView, defaultCalendarId } = body as {
        accentColor?: string;
        startOnToday?: boolean;
        startOnPreviousView?: boolean;
        defaultCalendarId?: string;
    };

    console.log("body", body);

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (accentColor) {
        await db.update(users).set({ accent_color: accentColor }).where(eq(users.id, userId));
    }

    if (startOnToday !== undefined) {
        await db.update(users).set({ startOnToday }).where(eq(users.id, userId));
    }

    if (startOnPreviousView !== undefined) {
        await db.update(users).set({ startOnPreviousView }).where(eq(users.id, userId));
    }

    if (defaultCalendarId) {
        await db.update(calendars).set({ isDefault: false }).where(eq(calendars.id, user.defaultCalendarId));
        await db
            .update(users)
            .set({ defaultCalendarId: parseInt(defaultCalendarId) })
            .where(eq(users.id, userId));
        await db
            .update(calendars)
            .set({ isDefault: true })
            .where(eq(calendars.id, parseInt(defaultCalendarId)));
    }

    return NextResponse.json({});
}

// GET /api/me
export async function GET(request: NextRequest) {
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

    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    return NextResponse.json(user[0]);
}