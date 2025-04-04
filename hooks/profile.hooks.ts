import { useQuery, useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { useIsConnected } from "@/hooks/useIsConnected"; // Adjust path
import { addMutationToQueue, getMutationsFromDB } from "@/lib/mutation.helpers";
import { useSession } from "./authContext";
import * as Crypto from "expo-crypto";
import { User, UpdateUser } from "@/types/user.types";
import { updateUserOnServer } from "@/lib/user.helper";
import * as SecureStore from "expo-secure-store";
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
			console.log(updatedUser)
			if (isConnected && user.user_id !== "localUser") {
				const res = await updateUserOnServer(updatedUser);
				console.log(res)
				return res
			} else {
				return updatedUser;
			}
		},
		onSuccess: async (updatedUser: UpdateUser) => {
			console.log("updated user", updatedUser);
			const user = await JSON.parse(SecureStore.getItem("user") ?? "")
			SecureStore.setItem("user", JSON.stringify({...user, ...updatedUser}));
			console.log("set secure store user to ", {...user, ...updatedUser})
		},
		onSettled: async (data, error, variables, context: { previousUser: User } | undefined) => {
			options?.onSettled?.(data, error, variables, context);
		}
	});
};