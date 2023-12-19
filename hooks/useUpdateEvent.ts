import { Interval } from "luxon";
import { useMutation, useQueryClient } from "react-query";
import { Calendar, CalendarEvent } from "~/lib/types";

export default function useUpdateEvent(event: CalendarEvent) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            name,
            interval,
            calendarId,
        }: {
            name?: string;
            interval?: Interval;
            calendarId?: number;
        }) => {
            if (!name && !interval && !calendarId) {
                return;
            }
            if (!interval?.start || !interval?.end) {
                return;
            }
            const res = await fetch(`/api/events/${event.id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    name,
                    interval,
                    calendarId,
                }),
            });
            return res.json();
        },
        // When mutate is called:
        onMutate: async (newEventData) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries("events");

            const day = event.interval.start;

            if (!day) {
                return;
            }

            // Snapshot the previous value
            const previousEvents = queryClient.getQueryData(["events", day.month, day.day, day.year]);

            // Optimistically update to the new value
            queryClient.setQueryData<CalendarEvent[]>(["events", day.month, day.day, day.year], (old) => {
                if (!old) {
                    return [];
                }
                return old.map((c) => {
                    if (c.id === event.id) {
                        return { ...c, ...newEventData };
                    }
                    return c;
                });
            });

            queryClient.setQueryData<CalendarEvent>(["events", event.id], () => {
                return { ...event, ...newEventData };
            });

            // Return a context object with the snapshotted value
            return { previousEvents, day, previousEvent: event };
        },
        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (_err, _newCalendar, context) => {
            queryClient.setQueryData("calendars", context?.previousEvents);
            queryClient.setQueryData(["calendars", event.id], context?.previousEvent);
        },
        onSettled: (_data, _error, _variables, context) => {
            queryClient.invalidateQueries(["events", context?.day?.month, context?.day?.day, context?.day?.year]);
            queryClient.invalidateQueries(["events", event.id]);
        },
    });
}
