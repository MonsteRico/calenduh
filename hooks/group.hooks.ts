import { useQuery, useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { useIsConnected } from "@/hooks/useIsConnected"; // Adjust path
import { Group, UpdateGroup } from "@/types/group.types"; // Assume this is where Group type is defined
import {
    //getGroupsFromDB,
    getGroupsFromServer,
    getGroupFromServer,
    createGroupOnServer,
    getMyGroupsFromServer,
    updateGroupOnServer,
    joinGroupOnServer,
    leaveGroupOnServer,
    //insertGroupIntoDB,
    //updateGroupInDB,
    //deleteGroupFromDB,
    //getGroupFromDB,
} from "@/lib/group.helpers";
import { addMutationToQueue } from "@/lib/mutation.helpers";
import { useSession } from "./authContext";
import { User } from "lucide-react-native";

// --- Queries ---
export const useMyGroups = () => {
    const queryClient = useQueryClient();
    const isConnected = useIsConnected();

    const { user, sessionId } = useSession();
    if (!user || !sessionId) {
        throw new Error("User not found");
    }

    return useQuery({
        queryKey: ["groups"],
        queryFn: async () => {
            if (isConnected && user.user_id !== "localUser") {
                try {
                    const serverGroups = await getMyGroupsFromServer();
                    return serverGroups;
                } catch (error) {
                    console.error("Error fetching groupsf rom server:", error);
                    throw new Error("Error fetching groups from server");
                }
            }
        },
    });
};

export const useGroup = (group_id: string) => {
    const queryClient = useQueryClient();
    const isConnected = useIsConnected();

    const { user, sessionId } = useSession();
    if (!user || !sessionId) {
        throw new Error("User not found");
    }

    return useQuery({
        queryKey: ['groups', group_id],
        queryFn: async () => {
            if (isConnected && user.user_id !== "localUser") {
                try {
                    const serverGroup = await getGroupFromServer(group_id);
                    if (!serverGroup) {
                        throw new Error("Group not found on server");
                    }
                    return serverGroup;
                } catch (error) {
                    console.error(`Error fetching group ${group_id} from server:`, error);
                    throw new Error(`Error fetching group ${group_id} from server`);
                }
            }
        }
    })
}

// --- Mutations ---

export const useCreateGroup = (
    options?: UseMutationOptions<
        Group,
        Error,
        Omit<Group, "group_id" | "invite_code">
    >
) => {
    const queryClient = useQueryClient();
    const isConnected = useIsConnected();
    const { user, sessionId } = useSession();

    if (!user || !sessionId) {
        throw new Error("User not found or session not found");
    }


    return useMutation<Group, Error, Omit<Group, "group_id" | "invite_code">>(
        {
            mutationFn: async (newGroup: Omit<Group, "group_id" | "invite_code">) => {
                if (isConnected && user.user_id !== "localUser") {
                    return await createGroupOnServer(newGroup);
                } else {
                    throw new Error("Not connected to server or using a local-only account");
                }
            },
            onMutate: async (newGroup) => {
                options?.onMutate?.(newGroup);
                //await queryClient.invalidateQueries({ queryKey: ["groups"] });              
            },
            onSuccess: async (data) => {
                options?.onSuccess?.(data, { name: data.name } as any, undefined as any);
                await queryClient.invalidateQueries({ queryKey: ["groups"]})
            }
        }
    )
}

export const useUpdateGroup = (
    options?: UseMutationOptions<UpdateGroup, Error, UpdateGroup>
) => {
    const queryClient = useQueryClient();
    const isConnected = useIsConnected();
    const { user, sessionId } = useSession();

    if (!user || !sessionId) {
        throw new Error("User not found or session not found");
    }

    return useMutation({
        mutationFn: async (updatedGroup: UpdateGroup) => {
            if (isConnected && user.user_id !== 'localUser') {
                return await updateGroupOnServer(updatedGroup);
            } else {
                throw new Error("Not connected to server or using a local-only account");
            }
        },
        onMutate: async (updatedGroup) => {
            options?.onMutate?.(updatedGroup);
        },
        onSuccess: async (data) => { //onSuccess needed to invalidate queries properly
            options?.onSuccess?.(data, { name: data.name } as any, undefined as any);
            await queryClient.invalidateQueries({ queryKey: ["groups"]});
        }
    })
}

export const useJoinGroup = (
    options?: UseMutationOptions<Group, Error, Omit<Group, "group_id" | "name">>
) => {
    const queryClient = useQueryClient();
    const isConnected = useIsConnected();
    const { user, sessionId } = useSession();

    if (!user || !sessionId) {
        throw new Error("User not found or session not found");   
    }

    return useMutation<Group, Error, Omit<Group, "group_id" | "name">>({
        mutationFn: async(group: Omit<Group, "group_id" | "name">) => {
            if (isConnected && user.user_id !== 'localUser') {
                return await joinGroupOnServer(group);
            } else {
                throw new Error("Not connected to server or using a local-only account");
            }
        },
        onMutate: async (group) => {
            options?.onMutate?.(group);
        },
        onSuccess: async (data) => {
            options?.onSuccess?.(data, { name: data.name } as any, undefined as any);
            await queryClient.invalidateQueries({ queryKey: ["groups"]});
        }
    })
}

export const useLeaveGroup = (
    options?: UseMutationOptions<Group, Error, Group>) => {
        const queryClient = useQueryClient();
        const isConnected = useIsConnected();
        const { user, sessionId } = useSession();

        if (!user || !sessionId) {
            throw new Error("User not found or session not found");
        }

        return useMutation<Group, Error, Group>({
            mutationFn: async(group: Group) => {
                if (isConnected && user.user_id !== 'localUser') {
                    console.log("Delete");
                    return await leaveGroupOnServer(group);
                } else {
                    throw new Error("Not connected to server or using a local-only account");
                }
            },
            onMutate: async(group) => {
                options?.onMutate?.(group);
            },
            onSuccess: async(data) => {
                options?.onSuccess?.(data, { name: data.name } as any, undefined as any);
                await queryClient.invalidateQueries({ queryKey: ["groups"] });
            }
        })
    }


// Creates a new group
/*xport const useCreateGroup = (
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
};*/