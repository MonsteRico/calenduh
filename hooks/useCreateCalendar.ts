import { useMutation, useQueryClient } from "react-query";
import { newDbCalendar } from "~/lib/schema";
import { Calendar } from "~/lib/types";

export default function useCreateCalendar() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ name, color }: { name?: string; color?: string }) => {
            if (!name && !color) {
                throw new Error("Name or color must be provided");
            }
            const res = await fetch(`/api/calendars`, {
                method: "POST",
                body: JSON.stringify({
                    name,
                    color,
                }),
            });
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries("calendars");
        },
    });
}
