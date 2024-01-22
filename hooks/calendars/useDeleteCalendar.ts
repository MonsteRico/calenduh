import { useMutation, useQueryClient } from "react-query";
import { Calendar } from "~/lib/types";

export default function useDeleteCalendar(calendar: Calendar) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/calendars/${calendar.id}`, {
                method: "DELETE",
            });
            return res.json();
        },
        // When mutate is called:
        onMutate: async () => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries("calendars");

            // Snapshot the previous value
            const previousCalendars = queryClient.getQueryData("calendars");

            // Optimistically update to the new value
            queryClient.setQueryData<Calendar[]>("calendars", (old) => {
                if (!old) {
                    return [];
                }
                return old.filter((c) => c.id !== calendar.id);
            });

            queryClient.removeQueries(["calendars", calendar.id]);

            // Return a context object with the snapshotted value
            return { previousCalendars, previousCalendar: calendar };
        },
        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (_err, _newCalendar, context) => {
            queryClient.setQueryData("calendars", context?.previousCalendars);
            queryClient.setQueryData(["calendars", calendar.id], context?.previousCalendar);
        },
        onSettled: (data) => {
            queryClient.invalidateQueries("calendars");
            queryClient.invalidateQueries(["calendars", calendar.id]);
            queryClient.invalidateQueries("events");
        },
    });
}
