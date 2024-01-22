import { useMutation, useQueryClient } from "react-query";

export default function useUpdateStartOnToday() {
    const queryClient = useQueryClient();

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
            await queryClient.cancelQueries(["preferences"]);

            const previousPreferences = queryClient.getQueryData(["preferences"]);

            queryClient.setQueryData(["preferences"], (old: any) => {
                return {
                    ...old,
                    startOnToday,
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
