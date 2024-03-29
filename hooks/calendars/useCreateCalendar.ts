import { useMutation, useQueryClient } from "react-query";

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
