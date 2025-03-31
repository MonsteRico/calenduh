import { useQuery, useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { useIsConnected } from "@/hooks/useIsConnected"; // Adjust path
import { addMutationToQueue, getMutationsFromDB } from "@/lib/mutation.helpers";
import { useSession } from "./authContext";
import * as Crypto from "expo-crypto";
import { User, UpdateUser } from "@/types/user.types";
import { updateUserOnServer, updateUserInDB } from "@/lib/user.helper";
// --- Queries ---
export const useUpdateUser = (
	options?: UseMutationOptions<UpdateUser, Error, UpdateUser, { previousUser: User}>
) => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	const { user, sessionId } = useSession();
	if (!user || !sessionId) {
		throw new Error("User not found or session not found");
	}

	return useMutation({
		mutationFn: async (updatedUser: UpdateUser) => {
			// await updateUserInDB(updatedUser.user_id, updatedUser); // Update the user in the local database
			if (isConnected && user.user_id !== "localUser") {
				return await updateUserOnServer(updatedUser);
			} else {
				return updatedUser;
			}
		},
	});
};