import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { useIsConnected } from "./useIsConnected";
import { deleteEventFromDB, deleteEventOnServer, getEventFromDB } from "@/lib/event.helpers";
import { addMutationToQueue } from "@/lib/mutation.helpers";
import { deleteUserFromDB, deleteUserFromServer } from "@/lib/user.helper";
import { useSession } from "./authContext";
import { useEnabledCalendarIds } from "./useEnabledCalendarIds";

export const useDeleteUser = (options?: UseMutationOptions<void, Error, string, unknown>) => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();
	const { signOut } = useSession();
	const { setEnabledCalendarIds } = useEnabledCalendarIds();

	return useMutation({
		mutationFn: async (user_id: string) => {
			if (isConnected) {
				try {
					setEnabledCalendarIds([]);
					await deleteUserFromDB(user_id);
					await deleteUserFromServer();
				} catch (error) {
					if (process.env.SHOW_LOGS == 'true') {
						console.error("Error deleting user from server:", error);
					}
					throw error;
				}
			} else {
				if (process.env.SHOW_LOGS == 'true') {
					console.error("User is not online, cannot delete user from server");
				}
				return;
			}
		},
		onError: (err, user_id, context) => {
			options?.onError?.(err, user_id, context);
			console.log("Error deleting event:", err);
		},
		onSuccess: (data, variables, context) => {
			options?.onSuccess?.(data, variables, context);
			// Boom Boom Boom Boom Boom
		},
		onSettled: async (data, error, variables, context) => {
			options?.onSettled?.(data, error, variables, context);
			signOut();
		},
	});
};
