import { int, mysqlTable, serial, varchar } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const calendars = mysqlTable("calendars", {
    id: serial("id").primaryKey(),
    name: varchar("name", {length: 255}).notNull().default("Lorem Ipsum Calendar"),
    color: varchar("color", {length: 7}).notNull().default("#000000"),
});

export const calendarsRelations = relations(calendars, ({ many }) => ({
    events: many(calendarEvents),
}));

export const calendarEvents = mysqlTable("calendar_events", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull().default("Lorem Ipsum Event"),
    month: int("month").notNull().default(12),
    day: int("day").notNull().default(15),
    year: int("year").notNull().default(2023),
    startTime: varchar("start_time", { length: 255 }).notNull().default("12:00"),
    endTime: varchar("end_time", { length: 255 }).notNull().default("13:00"),
    calendarId: int("calendar_id").notNull(),
});

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
    calendar: one(calendars, {
        fields: [calendarEvents.calendarId],
        references: [calendars.id],
    }),
}));

export type dbCalendar = typeof calendars.$inferSelect
export type newDbCalendar = typeof calendars.$inferInsert
export type dbCalendarEvent = typeof calendarEvents.$inferSelect
export type newDbCalendarEvent = typeof calendarEvents.$inferInsert
