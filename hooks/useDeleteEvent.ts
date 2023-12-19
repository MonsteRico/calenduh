import { useMutation, useQueryClient } from "react-query";
import { Calendar, CalendarEvent } from "~/lib/types";

export default function useDeleteEvent(event: CalendarEvent) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/events/${event.id}`, {
                method: "DELETE",
            });
            return res.json();
        },
        // When mutate is called:
        onMutate: async () => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries("events");

            // Snapshot the previous value
            const previousEvents = queryClient.getQueryData("calendars");
            const day = event.interval.start;

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
            queryClient.setQueryData("calendars", context?.previousEvents);
            queryClient.setQueryData(["calendars", event.id], context?.previousEvent);
        },
        onSettled: (_data, _error, _variables, context) => {
            queryClient.invalidateQueries(["events", context?.day?.month, context?.day?.day, context?.day?.year]);
            queryClient.invalidateQueries(["events", event.id]);
        },
    });
}
