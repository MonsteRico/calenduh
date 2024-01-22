import { UseQueryOptions, useQuery } from "react-query";
import { dbCalendar, dbCalendarEvent } from "~/db/schema/main";
import eventsConverter from "~/lib/eventsConverter";
import { CalendarEvent } from "~/lib/types";

export default function useGetEvent(id: number, options?: UseQueryOptions<CalendarEvent, { error: string }>) {
    return useQuery<CalendarEvent, { error: string }>(["events", id], async () => {
        const response = await fetch(`/api/events/${id}}`);
        const dbEvent = (await response.json()) as dbCalendarEvent & { calendar: dbCalendar };
        const event = eventsConverter([dbEvent])[0];
        return event;
    });
}
