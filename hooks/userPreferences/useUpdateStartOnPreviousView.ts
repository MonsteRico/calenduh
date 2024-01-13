import { DateTime, Interval } from "luxon";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "react-query";
import { Calendar, CalendarEvent } from "~/lib/types";

export default function useUpdateStartOnPreviousView() {
    const queryClient = useQueryClient();



    return useMutation({
        mutationFn: async ({ startOnPreviousView }: { startOnPreviousView: boolean }) => {
            const res = await fetch(`/api/me`, {
                method: "PATCH",
                body: JSON.stringify({
                    startOnPreviousView,
                }),
            });
            return res.json();
        },
        onMutate: async ({ startOnPreviousView }) => {
            await queryClient.cancelQueries(["preferences"]);

            const previousPreferences = queryClient.getQueryData(["preferences"]);

            queryClient.setQueryData(["preferences"], (old: any) => {
                return {
                    ...old,
                    startOnPreviousView,
                };
            });

            return { previousPreferences };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(["preferences"], context?.previousPreferences);
        },
        onSettled: () => {
            queryClient.invalidateQueries(["preferences"]);
        },
    });
}
