import { useQuery, useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { useIsConnected } from "@/hooks/useIsConnected"; // Adjust path
import { Group } from "@/types/group.types"; // Assume this is where Group type is defined
import {
    getGroupsFromDB,
    getGroupsFromServer,
    getGroupFromServer,
    createGroupOnServer,
    insertGroupIntoDB,
    updateGroupInDB,
    deleteGroupFromDB,
    getGroupFromDB,
} from "@/lib/group.helpers";
import { addMutationToQueue } from "@/lib/mutation.helpers";
import { useSession } from "./authContext";

// --- Queries ---

// Fetches all groups the current user belongs to
export const useMyGroups = () => {
    const queryClient = useQueryClient();
    const isConnected = useIsConnected();

    const { user, sessionId } = useSession();
    if (!user || !sessionId) {
        throw new Error("User not found");
    }

    return useQuery<Group[], Error>({
        queryKey: ["groups"],
        queryFn: async () => {
            const localGroups = await getGroupsFromDB(user.user_id);
            if (isConnected && user.user_id !== "localUser") {
                try {
                    const serverGroups = await getGroupsFromServer();
                    for (const group of serverGroups) {
                        await insertGroupIntoDB(group, user.user_id);
                    }
                    return serverGroups;
                } catch (error) {
                    console.error("Error fetching groups from server:", error);
                    return localGroups; // Return local groups in case of an error
                }
            } else {
                return localGroups; // Return local groups when offline
            }
        },
    });
};

// Fetches a single group by its ID
export const useGroup = (group_id: string) => {
    const queryClient = useQueryClient();
    const isConnected = useIsConnected();

    const { user, sessionId } = useSession();
    if (!user || !sessionId) {
        throw new Error("User not found");
    }

    return useQuery<Group, Error>({
        queryKey: ["groups", group_id],
        queryFn: async () => {
            if (isConnected && user.user_id !== "localUser") {
                try {
                    const serverGroup = await getGroupFromServer(group_id);
                    if (!serverGroup) {
                        throw new Error("Group not found on server");
                    }
                    await updateGroupInDB(serverGroup.group_id, serverGroup, user.user_id);
                    return serverGroup;
                } catch (error) {
                    console.error(`Error fetching group ${group_id} from server:`, error);
                    const localGroup = await getGroupFromDB(group_id);
                    if (localGroup) {
                        return localGroup;
                    } else {
                        throw new Error("Group not found locally or on server");
                    }
                }
            } else {
                const localGroup = await getGroupFromDB(group_id);
                if (localGroup) {
                    return localGroup;
                } else {
                    throw new Error("Group not found locally");
                }
            }
        },
    });
};

// --- Mutations ---

// Creates a new group
export const useCreateGroup = (
    options?: UseMutationOptions<
        Group,
        Error,
        Omit<Group, "group_id">,
        { previousGroups: Group[]; tempId: string }
    >
) => {
    const queryClient = useQueryClient();
    const isConnected = useIsConnected();

    const { user, sessionId } = useSession();
    if (!user || !sessionId) {
        throw new Error("User not found or session not found");
    }

    return useMutation<Group, Error, Omit<Group, "group_id">, { previousGroups: Group[]; tempId: string }>({
        mutationFn: async (newGroup: Omit<Group, "group_id">) => {
            if (isConnected && user.user_id !== "localUser") {
                return await createGroupOnServer(newGroup);
            } else {
                //return { ...newGroup, group_id: "local-" + Crypto.randomUUID() }; // Generate a temporary ID for offline creation
            }
        },
        // onMutate: async (newGroup) => {
        //     options?.onMutate?.(newGroup);
        //     await queryClient.cancelQueries({ queryKey: ["groups"] });
        //     const previousGroups = queryClient.getQueryData<Group[]>(["groups"]) || [];

        //     const tempId = "local-" + Crypto.randomUUID();
        //     const optimisticGroup: Group = { ...newGroup, group_id: tempId };

        //     queryClient.setQueryData<Group[]>(["groups"], (old) => [...(old || []), optimisticGroup]);

        //     await insertGroupIntoDB(optimisticGroup, user.user_id);
        //     if (!isConnected && user.user_id !== "localUser") {
        //         addMutationToQueue("CREATE_GROUP", newGroup, { groupId: tempId });
        //     }
        //     return { previousGroups, tempId };
        // },
        onError: (err, newGroup, context) => {
            options?.onError?.(err, newGroup, context);
            queryClient.setQueryData<Group[]>(["groups"], context?.previousGroups);
        },
        onSuccess: (data, variables, context) => {
            options?.onSuccess?.(data, variables, context);
            // Handle success if needed
        },
        onSettled: async (newGroup, error, variables, context) => {
            options?.onSettled?.(newGroup, error, variables, context);
            await queryClient.invalidateQueries({ queryKey: ["groups"] });
        },
    });
};