import { useMutation, useQueryClient } from "react-query";
import { Calendar } from "~/lib/types";

export default function useUpdateCalendar(calendar: Calendar) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ name, color }: { name?: string; color?: string }) => {
            if (!name && !color) {
                return;
            }
            const res = await fetch(`/api/calendars/${calendar.id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    name,
                    color,
                }),
            });
            return res.json();
        },
        // When mutate is called:
        onMutate: async (newCalendarData) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries("calendars");

            // Snapshot the previous value
            const previousCalendars = queryClient.getQueryData("calendars");

            // Optimistically update to the new value
            queryClient.setQueryData<Calendar[]>("calendars", (old) => {
                if (!old) {
                    return [];
                }
                return old.map((c) => {
                    if (c.id === calendar.id) {
                        return { ...c, ...newCalendarData };
                    }
                    return c;
                });
            });

            queryClient.setQueryData<Calendar>(["calendars", calendar.id], (old) => {
                if (!old) {
                    return { ...calendar, ...newCalendarData };
                }
                return { ...old, ...newCalendarData };
            });

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
        },
    });
}