import { boolean, datetime, index, int, mysqlEnum, mysqlTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const calendars = mysqlTable("calendars", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().default("Lorem Ipsum Calendar"),
    color: varchar("color", { length: 7 }).notNull().default("#000000"),
});

export const calendarsRelations = relations(calendars, ({ many }) => ({
    events: many(calendarEvents),
}));

export const calendarEvents = mysqlTable("calendar_events", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull().default("Lorem Ipsum Event"),
    startMonth: int("start_month").notNull().default(12),
    startDay: int("start_day").notNull().default(21),
    startYear: int("start_year").notNull().default(2023),
    startTime: varchar("start_time", { length: 255 }).notNull().default("12:00"),
    endMonth: int("end_month"),
    endDay: int("end_day"),
    endYear: int("end_year"),
    endTime: varchar("end_time", { length: 255 }).notNull().default("13:00"),
    calendarId: int("calendar_id").notNull(),
    allDay: boolean("all_day").notNull().default(false),
    daysOfWeek: varchar("days_of_week", { length: 255 }).notNull().default("1,2,3,4,5"), // 1 = monday, 2 = tuesday, etc so 7 = sunday and 6 = saturday
    repeatType: mysqlEnum("repeatType", ["daily", "weekly", "monthly", "yearly", "none"]).notNull().default("none"),
    numConflicts: int("num_conflicts").default(0), // This value is never actually properly stored in the database, its more here for the typescript type
    daysTurnedOff: text("days_turned_off").notNull().default(""),
});

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
    calendar: one(calendars, {
        fields: [calendarEvents.calendarId],
        references: [calendars.id],
    }),
}));

export type dbCalendar = typeof calendars.$inferSelect;
export type newDbCalendar = typeof calendars.$inferInsert;
export type dbCalendarEvent = typeof calendarEvents.$inferSelect;
export type dbNewCalendarEvent = typeof calendarEvents.$inferInsert;


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
            account.providerAccountId
        ),
        userIdIndex: index("accounts__userId__idx").on(account.userId),
    })
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
    })
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
    },
    (user) => ({
        emailIndex: uniqueIndex("users__email__idx").on(user.email),
    })
);

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
    })
);