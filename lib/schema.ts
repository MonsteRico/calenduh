import { int, mysqlTable, serial, varchar } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const calendars = mysqlTable("calendars", {
    id: serial("id"),
    name: varchar("name", {length: 255}).notNull().default("Lorem Ipsum Calendar"),
    color: varchar("color", {length: 7}).notNull().default("#000000"),
});

export const calendarsRelations = relations(calendars, ({ many }) => ({
    events: many(calendarEvents),
}));

export const calendarEvents = mysqlTable("calendar_events", {
    id: serial("id"),
    title: varchar("title", { length: 255 }).notNull().default("Lorem Ipsum Event"),
    interval: varchar("interval", { length: 255 })
        .notNull()
        .default("2023-12-14T10:38:02.764-05:00/2023-12-14T12:38:02.764-05:00"),
    calendarId: int("calendar_id").notNull(),
});

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
    calendar: one(calendars, {
        fields: [calendarEvents.calendarId],
        references: [calendars.id],
    }),
}));