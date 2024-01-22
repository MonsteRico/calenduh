import { relations } from "drizzle-orm";
import {
    boolean,
    datetime,
    index,
    int,
    mysqlTable,
    text,
    timestamp,
    uniqueIndex,
    varchar,
} from "drizzle-orm/mysql-core";
import { calendarEvents, calendars, usersSubscribedCalendars } from "./main";

export const accounts = mysqlTable(
    "accounts",
    {
        id: varchar("id", { length: 191 }).primaryKey().notNull(),
        userId: varchar("userId", { length: 191 }).notNull(),
        type: varchar("type", { length: 191 }).notNull(),
        provider: varchar("provider", { length: 191 }).notNull(),
        providerAccountId: varchar("providerAccountId", { length: 191 }).notNull(),
        access_token: text("access_token"),
        expires_in: int("expires_in"),
        id_token: text("id_token"),
        refresh_token: text("refresh_token"),
        refresh_token_expires_in: int("refresh_token_expires_in"),
        scope: varchar("scope", { length: 191 }),
        token_type: varchar("token_type", { length: 191 }),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    },
    (account) => ({
        providerProviderAccountIdIndex: uniqueIndex("accounts__provider__providerAccountId__idx").on(
            account.provider,
            account.providerAccountId,
        ),
        userIdIndex: index("accounts__userId__idx").on(account.userId),
    }),
);

export const sessions = mysqlTable(
    "sessions",
    {
        id: varchar("id", { length: 191 }).primaryKey().notNull(),
        sessionToken: varchar("sessionToken", { length: 191 }).notNull(),
        userId: varchar("userId", { length: 191 }).notNull(),
        expires: datetime("expires").notNull(),
        created_at: timestamp("created_at").notNull().defaultNow(),
        updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
    },
    (session) => ({
        sessionTokenIndex: uniqueIndex("sessions__sessionToken__idx").on(session.sessionToken),
        userIdIndex: index("sessions__userId__idx").on(session.userId),
    }),
);

export const users = mysqlTable(
    "users",
    {
        id: varchar("id", { length: 191 }).primaryKey().notNull(),
        name: varchar("name", { length: 191 }),
        email: varchar("email", { length: 191 }).notNull(),
        emailVerified: timestamp("emailVerified"),
        image: varchar("image", { length: 191 }),
        created_at: timestamp("created_at").notNull().defaultNow(),
        updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
        accent_color: varchar("accent_color", { length: 191 }).notNull().default("#cfb991"),
        startOnToday: boolean("start_on_today").notNull().default(true), // start on today or last day viewed
        startOnPreviousView: boolean("start_on_previous_view").notNull().default(false), // start on the last view (day, week, month, year) or on month
        defaultCalendarId: int("default_calendar_id").notNull().default(-1),
    },
    (user) => ({
        emailIndex: uniqueIndex("users__email__idx").on(user.email),
    }),
);

export const userRelations = relations(users, ({ many, one }) => ({
    events: many(calendarEvents),
    calendars: many(calendars),
    defaultCalendar: one(calendars, {
        fields: [users.defaultCalendarId],
        references: [calendars.id],
    }),
    subscribedCalendars: many(usersSubscribedCalendars),
}));

export type dbUser = typeof users.$inferSelect;

export const verificationTokens = mysqlTable(
    "verification_tokens",
    {
        identifier: varchar("identifier", { length: 191 }).primaryKey().notNull(),
        token: varchar("token", { length: 191 }).notNull(),
        expires: datetime("expires").notNull(),
        created_at: timestamp("created_at").notNull().defaultNow(),
        updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
    },
    (verificationToken) => ({
        tokenIndex: uniqueIndex("verification_tokens__token__idx").on(verificationToken.token),
    }),
);
