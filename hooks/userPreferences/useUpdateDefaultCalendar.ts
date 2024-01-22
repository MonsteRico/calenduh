import { useMutation, useQueryClient } from "react-query";
import { Calendar } from "~/lib/types";

export default function useUpdateDefaultCalendar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ newDefaultCalendar }: { newDefaultCalendar: Calendar }) => {
            const res = await fetch(`/api/me`, {
                method: "PATCH",
                body: JSON.stringify({
                    defaultCalendarId: newDefaultCalendar.id,
                }),
            });
            return res.json();
        },
        onMutate: async ({ newDefaultCalendar }) => {
            await queryClient.cancelQueries(["preferences"]);
            await queryClient.cancelQueries(["calendars"]);
            const previousPreferences = queryClient.getQueryData(["preferences"]);

            queryClient.setQueryData(["preferences"], (old: any) => {
                return {
                    ...old,
                    defaultCalendarId: newDefaultCalendar.id,
                };
            });

            const previousCalendars = queryClient.getQueryData(["calendars"]);

            queryClient.setQueryData(["calendars"], (old: any) => {
                return old.map((calendar: Calendar) => {
                    if (calendar.id === newDefaultCalendar.id) {
                        return {
                            ...calendar,
                            isDefault: true,
                        };
                    } else {
                        return {
                            ...calendar,
                            isDefault: false,
                        };
                    }
                });
            });

            return { previousPreferences, previousCalendars };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(["preferences"], context?.previousPreferences);
            queryClient.setQueryData(["calendars"], context?.previousCalendars);
        },
        onSettled: () => {
            queryClient.invalidateQueries(["preferences"]);
            queryClient.invalidateQueries(["calendars"]);
        },
    });
}
