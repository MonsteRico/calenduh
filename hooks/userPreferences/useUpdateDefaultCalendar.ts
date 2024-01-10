import { DateTime, Interval } from "luxon";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "react-query";
import { Calendar, CalendarEvent } from "~/lib/types";

export default function useUpdateDefaultCalendar() {
    const session = useSession();
    const user = session.data?.user;
    if (!user) {
        throw new Error("No user");
    }

    return useMutation({
        mutationFn: async ({ newDefaultCalendar }: { newDefaultCalendar: Calendar }) => {
            const res = await fetch(`/api/users/${user.id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    defaultCalendarId: newDefaultCalendar.id,
                }),
            });
            return res.json();
        },
    });
}
