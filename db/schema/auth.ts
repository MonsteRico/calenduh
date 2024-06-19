import { relations } from "drizzle-orm";
import { calendarEvents, calendars, usersSubscribedCalendars } from "./main";
import { boolean, date, index, integer, pgTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";


export const users = pgTable(
    "users",
    {
        id: varchar("id", { length: 191 }).primaryKey().notNull(),
        apiKey: varchar("api_key", { length: 191 }).notNull(),
        name: varchar("name", { length: 191 }),
        email: varchar("email", { length: 191 }).notNull(),
        emailVerified: timestamp("emailVerified"),
        image: varchar("image", { length: 191 }),
        created_at: timestamp("created_at").notNull().defaultNow(),
        updated_at: timestamp("updated_at").notNull().defaultNow(),
        accent_color: varchar("accent_color", { length: 191 }).notNull().default("#cfb991"),
        startOnToday: boolean("start_on_today").notNull().default(true), // start on today or last day viewed
        startOnPreviousView: boolean("start_on_previous_view").notNull().default(false), // start on the last view (day, week, month, year) or on month
        defaultCalendarId: integer("default_calendar_id").notNull().default(-1),
    }
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

export type dbUser = typeof users.$inferSelect & {
    calendars: Array<typeof calendars.$inferSelect>;
    subscribedCalendars: Array<typeof usersSubscribedCalendars.$inferSelect>;
    defaultCalendar: typeof calendars.$inferSelect;
    events?: Array<typeof calendarEvents.$inferSelect>;
};