import { DateTime, Interval } from "luxon";
import { useQuery } from "react-query";
import { dbCalendar, dbCalendarEvent } from "~/lib/schema";
import { CalendarEvent } from "~/lib/types";

export default function useGetEvents(day: DateTime) {
    return useQuery<CalendarEvent[], {error:string}>(["events", day], async () => {
        const response = await fetch(
            `/api/events?month=${day.month}&day=${day.day}&year=${day.year}`
        );
        const dbEvents = (await response.json()) as (dbCalendarEvent & { calendar: dbCalendar })[];
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
    });
}