import { DateTime, Interval } from "luxon";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "react-query";
import { Calendar, CalendarEvent } from "~/lib/types";

export default function useUpdateAccentColor() {
    const session = useSession();
    const user = session.data?.user;
    if (!user) {
        throw new Error("No user");
    }

    return useMutation({
        mutationFn: async ({ newColor }: { newColor: string }) => {
            const res = await fetch(`/api/users/${user.id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    accentColor: newColor,
                }),
            });
            return res.json();
        },
    });
}
