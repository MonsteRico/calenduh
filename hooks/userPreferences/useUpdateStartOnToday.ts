import { DateTime, Interval } from "luxon";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "react-query";
import { Calendar, CalendarEvent } from "~/lib/types";

export default function useUpdateStartOnToday() {
    const session = useSession();
    const user = session.data?.user;
    if (!user) {
        throw new Error("No user");
    }

    return useMutation({
        mutationFn: async ({ startOnToday }: { startOnToday: boolean }) => {
            const res = await fetch(`/api/users/${user.id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    startOnToday
                }),
            });
            return res.json();
        },
    });
}
