import { DateTime } from "luxon";
import { QueryClient, useQueries, useQuery, useQueryClient } from "react-query";
import { eventsConverter } from "~/lib/eventsConverter";
import { dbCalendar, dbCalendarEvent } from "~/lib/schema";
export function useGetMonthsEvents(dayBeingViewed: DateTime) {
    const queryClient = useQueryClient();
    return useQuery<string, { error: string }>(["events", dayBeingViewed.month, dayBeingViewed.year], async () => {
        await fetchMonthsEvents(dayBeingViewed, queryClient);
        return "done";
    });
}

export async function fetchMonthsEvents(dayBeingViewed: DateTime, queryClient: QueryClient) {
    const response = await fetch(
        `/api/month/events?month=${dayBeingViewed.month.toString()}&year=${dayBeingViewed.year.toString()}`
    );
    const daysOfEvents = (await response.json()) as {
        events: (dbCalendarEvent & { calendar: dbCalendar })[];
    }[];

    daysOfEvents.forEach((dayOfEvents, i) => {
        console.log(dayOfEvents)
        const convertedEvents = eventsConverter(dayOfEvents.events);
        const day = DateTime.fromObject({
            month: dayBeingViewed.month,
            day: i + 1,
            year: dayBeingViewed.year,
        });
        queryClient.setQueryData(["events", day.month, day.day, day.year], convertedEvents);
    });
    return "done";
}
