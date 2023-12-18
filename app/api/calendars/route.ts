import { and, eq, inArray } from "drizzle-orm";
import { DateTime } from "luxon";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";
import { calendars } from "~/lib/schema";

export const dynamic = "force-dynamic"; // defaults to auto

// GET /api/calendars
// get all calendars
export async function GET(request: NextRequest) {
    const calendars = await db.query.calendars.findMany({});

    return NextResponse.json(calendars);
}

// POST /api/calendars
// create a new calendar
export async function POST(request: NextRequest) {
    const body = await request.json();

    const calendar = await db.insert(calendars).values({
        name: body.name,
        color: body.color,
    });

    return NextResponse.json(calendar);
}
