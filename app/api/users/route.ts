import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { db } from "~/db/db";
import { users } from "~/db/schema/auth";
import * as crypto from "crypto";
export async function GET(request: NextRequest, { params }: { params: { apiKey: string } }) {
    const decryptedApiKey = params.apiKey;
    const user = await db.select().from(users).where(eq(users.apiKey, decryptedApiKey)).limit(1);
    return { status: 200, body: {
        userId: user[0].id,
    } };
}
