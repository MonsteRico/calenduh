import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db/db";
import { usersSubscribedCalendars } from "~/db/schema/main";
import getServerAuthSession from "~/lib/getServerAuthSession";

export const dynamic = "force-dynamic"; // defaults to auto

// GET /api/calendars/subscribe/[subscribeId]
export async function GET(request: NextRequest, { params }: { params: { subscribeId: string } }) {
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

    const subscribeId = params.subscribeId;

    const calendar = await db.query.calendars.findFirst({
        where: (calendars, { eq }) => eq(calendars.subscribeCode, subscribeId),
    });

    if (!calendar) {
        return NextResponse.json(
            {
                error: "calendar not found",
            },
            { status: 404 }
        );
    }

    if (calendar.userId === userId) {
        return NextResponse.json(
            {
                error: "you can't subscribe to your own calendar",
            },
            { status: 400 }
        );
    }

    if (calendar.isDefault) {
        return NextResponse.json(
            {
                error: "you can't subscribe to someones default calendar",
            },
            { status: 400 }
        );
    }

    await db.insert(usersSubscribedCalendars).values({
        userId: userId,
        calendarId: calendar.id,
    });

    redirect("/?subscribedTo=" + calendar.id);
}
