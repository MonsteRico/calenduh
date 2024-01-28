import { DateTime } from "luxon";
import { useQuery } from "react-query";
import { dbCalendar, dbCalendarEvent } from "~/db/schema/main";
import eventsConverter from "~/lib/eventsConverter";
import { CalendarEvent } from "~/lib/types";

export default function useGetEvents(day: DateTime) {
    return useQuery<CalendarEvent[], { error: string }>(
        ["events", day.month, day.day, day.year],
        async () => {
            return await fetchEvents(day);
        },
        {
            refetchInterval: 1000 * 30,
            refetchIntervalInBackground: true,
        },
    );
}

export async function fetchEvents(day: DateTime) {
    const response = await fetch(`/api/events?month=${day.month}&day=${day.day}&year=${day.year}`);
    const dbEvents = (await response.json()) as (dbCalendarEvent & { calendar: dbCalendar })[];
    const events = eventsConverter(dbEvents);
    console.log("fetchEvents", events);
    return events;
}
