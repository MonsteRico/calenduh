import { DateTime, Interval } from "luxon";
import { dbCalendar, dbCalendarEvent } from "./schema";
import { CalendarEvent } from "./types";

export default function eventsConverter(dbCalendarEvents: (dbCalendarEvent&{calendar:dbCalendar})[]): CalendarEvent[] {
    return dbCalendarEvents.map((dbEvent) => {
        const startDate = DateTime.fromObject({
            month: dbEvent.startMonth,
            day: dbEvent.startDay,
            year: dbEvent.startYear,
            hour: parseInt(dbEvent.startTime.split(":")[0]),
            minute: parseInt(dbEvent.startTime.split(":")[1]),
        });
        const endDate = DateTime.fromObject({
            month: dbEvent.endMonth ?? dbEvent.startMonth,
            day: dbEvent.endDay ?? dbEvent.startDay,
            year: dbEvent.endYear ?? dbEvent.startYear,
            hour: parseInt(dbEvent.endTime.split(":")[0]),
            minute: parseInt(dbEvent.endTime.split(":")[1]),
        });
        const interval = Interval.fromDateTimes(startDate, endDate) as Interval<true>;
        return {
            ...dbEvent,
            interval,
        }
    });
}
