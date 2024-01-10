import { DateTime, Interval } from "luxon";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "react-query";
import { Calendar, CalendarEvent } from "~/lib/types";

export default function useUpdateStartOnPreviousView() {
    const session = useSession();
    const user = session.data?.user;
    const queryClient = useQueryClient();

    if (!user) {
        throw new Error("No user");
    }

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
            await queryClient.cancelQueries(["preferences", user.id]);

            const previousPreferences = queryClient.getQueryData(["preferences", user.id]);

            queryClient.setQueryData(["preferences", user.id], (old: any) => {
                return {
                    ...old,
                    startOnPreviousView,
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
