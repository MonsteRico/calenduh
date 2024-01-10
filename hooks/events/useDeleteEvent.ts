import { DateTime } from "luxon";
import { useMutation, useQueryClient } from "react-query";
import { Calendar, CalendarEvent } from "~/lib/types";

export default function useDeleteEvent(event: CalendarEvent) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({date}:{date?:DateTime}) => {
            if (date) {
                const res = await fetch(
                    `/api/events/${event.id}?day=${date.day}&month=${date.month}&year=${date.year}`,
                    {
                        method: "DELETE",
                    }
                );
                return res.json();
            } else {
                const res = await fetch(`/api/events/${event.id}`, {
                    method: "DELETE",
                });
                return res.json();
            }
        },
        // When mutate is called:
        onMutate: async ({date}) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries("events");
            const day = date ?? event.interval.start;

            // Snapshot the previous value
            const previousEvents = queryClient.getQueryData(["events", day.month, day.day, day.year]);

            if (!day) {
                return;
            }
            // Optimistically update to the new value
            queryClient.setQueryData<CalendarEvent[]>(["events", day.month, day.day, day.year], (old) => {
                if (!old) {
                    return [];
                }
                return old.filter((c) => c.id !== event.id);
            });

            queryClient.removeQueries(["events", event.id]);

            // Return a context object with the snapshotted value
            return { previousEvents, previousEvent: event, day };
        },
        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (_err, _newCalendar, context) => {
            queryClient.setQueryData(
                ["events", context?.day?.month, context?.day?.day, context?.day?.year],
                context?.previousEvents
            );
            queryClient.setQueryData(["events", event.id], context?.previousEvent);
        },
        onSettled: (_data, _error, _variables, context) => {
            if (context?.previousEvent.repeatType !== "none") {
                queryClient.invalidateQueries("events");
            }
            queryClient.invalidateQueries(["events", context?.day?.month, context?.day?.day, context?.day?.year]);
            queryClient.invalidateQueries(["events", event.id]);
        },
    });
}
