import { DateTime, Interval } from "luxon";
import { dbCalendar, dbCalendarEvent } from "./schema";
import { CalendarEvent } from "./types";

// converts dbCalendarEvents WITH calendar INCLUDED to CalendarEvents

export function eventsConverter(dbEvents: (dbCalendarEvent & { calendar: dbCalendar })[]) {
    const events = dbEvents.map((dbEvent) => {
        const start = DateTime.fromObject({
            month: dbEvent.month,
            day: dbEvent.day,
            year: dbEvent.year,
            hour: parseInt(dbEvent.startTime.split(":")[0]),
            minute: parseInt(dbEvent.startTime.split(":")[1]),
        });
        const end = DateTime.fromObject({
            month: dbEvent.month,
            day: dbEvent.day,
            year: dbEvent.year,
            hour: parseInt(dbEvent.endTime.split(":")[0]),
            minute: parseInt(dbEvent.endTime.split(":")[1]),
        });
        const interval = Interval.fromDateTimes(start, end);
        return {
            id: dbEvent.id.toString(),
            interval,
            name: dbEvent.title,
            calendar: {
                id: dbEvent.calendar.id.toString(),
                name: dbEvent.calendar.name,
                color: dbEvent.calendar.color,
            },
            allDay: dbEvent.allDay,
        } as CalendarEvent;
    });

    // sort myEvents by start time
    events.sort((a, b) => {
        if (!a.interval.start || !b.interval.start) {
            return 0;
        }
        return a.interval.start.toMillis() - b.interval.start.toMillis();
    });

    return events;
}
