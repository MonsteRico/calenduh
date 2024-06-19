import { User } from "@clerk/nextjs/server";
import { createId } from "@paralleldrive/cuid2";
import Color from "color";
import { and, eq } from "drizzle-orm";
import type { Adapter } from "next-auth/adapters";
import { db, type DbClient } from "~/db/db";
import {  users,  } from "~/db/schema/auth";
import { calendarEvents, calendars } from "~/db/schema/main";

        export async function createUser(userData:User) {
            const newId = createId();
            const apiKey = createId();
            await db.insert(users).values({
                id: newId,
                apiKey,
                email: userData.primaryEmailAddress!.emailAddress,
                emailVerified: new Date(),
                name: userData.username,
                image: userData.imageUrl ?? "",
            });
            const newColor = Color.rgb(
                Math.floor(Math.random() * 255),
                Math.floor(Math.random() * 255),
                Math.floor(Math.random() * 255),
            ).hex();
            const subscribeCode = createId();
            await db.insert(calendars).values({
                name: "Default Calendar",
                color: newColor,
                userId: newId,
                isDefault: true,
                subscribeCode,
            });
            const [newCalendar] = await db.select().from(calendars).where(eq(calendars.userId, newId)).limit(1);
            await db.update(users).set({ defaultCalendarId: newCalendar.id }).where(eq(users.id, newId));
            const rows = await db.select().from(users).where(eq(users.email, userData.primaryEmailAddress!.emailAddress)).limit(1);
            const row = rows[0];
            if (!row) throw new Error("User not found");
            return row;
        }