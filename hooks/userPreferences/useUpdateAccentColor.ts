import { DateTime, Interval } from "luxon";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "react-query";
import { Calendar, CalendarEvent } from "~/lib/types";

export default function useUpdateAccentColor() {
    const session = useSession();
    const user = session.data?.user;
        const queryClient = useQueryClient();

    if (!user) {
        throw new Error("No user");
    }


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
            await queryClient.cancelQueries(["preferences", user.id]);

            const previousPreferences = queryClient.getQueryData(["preferences", user.id]);

            queryClient.setQueryData(["preferences", user.id], (old: any) => {
                return {
                    ...old,
                    accentColor: newColor,
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
