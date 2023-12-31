import { boolean, datetime, index, int, mysqlEnum, mysqlTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";

export const calendars = mysqlTable("calendars", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().default("Lorem Ipsum Calendar"),
    color: varchar("color", { length: 7 }).notNull().default("#000000"),
    userId: varchar("userId", { length: 255 }).notNull(),
    isDefault: boolean("is_default").notNull().default(false),
});

export const calendarsRelations = relations(calendars, ({ many, one }) => ({
    events: many(calendarEvents),
    user: one(users, {
        fields: [calendars.userId],
        references: [users.id],
    }),
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
    userId: varchar("userId", { length: 255 }).notNull(),
});

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
    calendar: one(calendars, {
        fields: [calendarEvents.calendarId],
        references: [calendars.id],
    }),
    user: one(users, {
        fields: [calendarEvents.userId],
        references: [users.id],
    }),
}));

export type dbCalendar = typeof calendars.$inferSelect;
export type newDbCalendar = typeof calendars.$inferInsert;
export type dbCalendarEvent = typeof calendarEvents.$inferSelect;
export type dbNewCalendarEvent = typeof calendarEvents.$inferInsert;