import { DateTime, Interval } from "luxon";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "react-query";
import { Calendar, CalendarEvent } from "~/lib/types";

export default function useUpdateAccentColor() {
    const queryClient = useQueryClient();


    return useMutation({
        mutationFn: async ({ newColor }: { newColor: string }) => {
            const res = await fetch(`/api/me/`, {
                method: "PATCH",
                body: JSON.stringify({
                    accentColor: newColor,
                }),
            });
            return res.json();
        },
        onMutate: async ({ newColor }) => {
            await queryClient.cancelQueries(["preferences"]);

            const previousPreferences = queryClient.getQueryData(["preferences"]);

            queryClient.setQueryData(["preferences"], (old: any) => {
                return {
                    ...old,
                    accentColor: newColor,
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
