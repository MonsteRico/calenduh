import { and, eq, inArray } from "drizzle-orm";
import { DateTime } from "luxon";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";

// GET /api/calendars
// get all calendars
export async function GET(request: NextRequest) {
    const calendars = await db.query.calendars.findMany({});

    return NextResponse.json(calendars);
}