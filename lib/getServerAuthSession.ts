import { Session, getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextRequest } from "next/server";
import { db } from "~/db/db";
import { users } from "~/db/schema/auth";
import { eq } from "drizzle-orm";

export default async function getServerAuthSession(request?: NextRequest) {
    // get the bearer token from the request if it exists
    const token = request?.headers.get("authorization")?.replace("Bearer ", "");
    if (token) {
        const [user] = await db.select().from(users).where(eq(users.apiKey, token)).limit(1);
        return {
            expires: new Date().toISOString(),
            user,
        } as Session;
    }
    return getServerSession(authOptions);
}
