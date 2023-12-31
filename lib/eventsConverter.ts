import { DateTime, Interval } from "luxon";
import { dbCalendar, dbCalendarEvent } from "../db/schema/main";
import { CalendarEvent } from "./types";

export default function eventsConverter(
    dbCalendarEvents: (dbCalendarEvent & { calendar: dbCalendar })[]
): CalendarEvent[] {
    return dbCalendarEvents.map((dbEvent) => {
        const startDate = DateTime.fromObject({
            month: dbEvent.startMonth,
            day: dbEvent.startDay,
            year: dbEvent.startYear,
            hour: parseInt(dbEvent.startTime.split(":")[0]),
            minute: parseInt(dbEvent.startTime.split(":")[1]),
        });
        const endDateTime = DateTime.fromObject({
            month: dbEvent.startMonth,
            day: dbEvent.startDay,
            year: dbEvent.startYear,
            hour: parseInt(dbEvent.endTime.split(":")[0]),
            minute: parseInt(dbEvent.endTime.split(":")[1]),
        });

        const endDate = DateTime.fromObject({
            month: dbEvent.endMonth ? dbEvent.endMonth : -1,
            day: dbEvent.endDay ? dbEvent.endDay : -1,
            year: dbEvent.endYear ? dbEvent.endYear : -1,
        });
        const interval = Interval.fromDateTimes(startDate, endDateTime) as Interval<true>;
        return {
            ...dbEvent,
            interval,
            recurringEndDay: endDate.isValid ? endDate : null,
        };
    });
}
