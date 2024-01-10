import { DateTime, Interval } from "luxon";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "react-query";
import { Calendar, CalendarEvent } from "~/lib/types";

export default function useUpdateStartOnToday() {
    const session = useSession();
    const user = session.data?.user;
    const queryClient = useQueryClient();

    if (!user) {
        throw new Error("No user");
    }

    return useMutation({
        mutationFn: async ({ startOnToday }: { startOnToday: boolean }) => {
            const res = await fetch(`/api/me`, {
                method: "PATCH",
                body: JSON.stringify({
                    startOnToday,
                }),
            });
            return res.json();
        },
        onMutate: async ({ startOnToday }) => {
            await queryClient.cancelQueries(["preferences", user.id]);

            const previousPreferences = queryClient.getQueryData(["preferences", user.id]);

            queryClient.setQueryData(["preferences", user.id], (old: any) => {
                return {
                    ...old,
                    startOnToday,
                };
            });

            return { previousPreferences };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(["preferences", user.id], context?.previousPreferences);
        },
        onSettled: () => {
            queryClient.invalidateQueries(["preferences", user.id]);
        },
    });
}
