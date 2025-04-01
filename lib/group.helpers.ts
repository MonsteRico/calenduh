import { openDatabaseAsync } from "expo-sqlite";
import server from "@/constants/serverAxiosClient";
import { Group, GroupUpsert, UpdateGroup } from "@/types/group.types";

// --- Local Database Functions ---

// Get all groups from the local database
// export const getGroupsFromDB = async (user_id: string): Promise<Group[]> => {
//     const db = await openDatabaseAsync("local.db");

//     try {
//         const groups = await db.getAllAsync<Group>("SELECT * FROM groups WHERE user_id = ?", user_id);
//         return groups;
//     } catch (error) {
//         console.error("Error fetching groups:", error);
//         throw error;
//     }
// };

// Get a single group from the local database
// export const getGroupFromDB = async (group_id: string): Promise<Group | undefined> => {
//     const db = await openDatabaseAsync("local.db");
//     try {
//         const group = await db.getFirstAsync<Group>("SELECT * FROM groups WHERE group_id = ?", group_id);
//         return group || undefined;
//     } catch (error) {
//         console.error("Error fetching group:", error);
//         throw error;
//     }
// };

// Insert a group into the local database
// export const insertGroupIntoDB = async (group: GroupUpsert, userId: string): Promise<void> => {
//     const db = await openDatabaseAsync("local.db");
//     try {
//         await db.runAsync(
//             "INSERT INTO groups (user_id, group_id, title, description) VALUES (?, ?, ?, ?)",
//             [
//                 userId,
//                 group.group_id || "",
//                 group.title,
//                 group.description || "",
//             ]
//         );
//     } catch (error) {
//         console.error("Error inserting group:", error);
//         throw error;
//     }
// };

// Update a group in the local database
// export const updateGroupInDB = async (group_id: string, group: UpdateGroup, userId: string): Promise<void> => {
//     const db = await openDatabaseAsync("local.db");
//     try {
//         const existingGroup = await getGroupFromDB(group_id);
//         if (!existingGroup) {
//             throw new Error("Group not found");
//         }

//         await db.runAsync(
//             "UPDATE groups SET user_id = ?, title = ?, description = ? WHERE group_id = ?",
//             [
//                 userId,
//                 group.title ?? existingGroup.title,
//                 group.description ?? existingGroup.description,
//                 group_id,
//             ]
//         );
//     } catch (error) {
//         console.error("Error updating group:", error);
//         throw error;
//     }
// };

// Delete a group from the local database
// export const deleteGroupFromDB = async (group_id: string): Promise<void> => {
//     const db = await openDatabaseAsync("local.db");
//     try {
//         await db.runAsync("DELETE FROM groups WHERE group_id = ?", group_id);
//     } catch (error) {
//         console.error("Error deleting group:", error);
//         throw error;
//     }
// };

// --- API Requests ---

// Get all groups from the server
export const getGroupsFromServer = async (): Promise<Group[]> => {
    const response = await server.get("/groups");
    return response.data;
};

// Get a single group from the server
export const getGroupFromServer = async (group_id: string): Promise<Group> => {
    const response = await server.get(`/groups/${group_id}`);
    return response.data;
};

export const getMyGroupsFromServer = async (): Promise<Group []> => {
    const response = await server.get(`groups/@me`);
    return response.data;
}

export const createGroupOnServer = async (group: Omit<Group, "group_id" | "invite_code">): Promise<Group> => {
    const response = await server.post("/groups/", group);
    return response.data;
}

// Update a group on the server
export const updateGroupOnServer = async (group: UpdateGroup): Promise<Group> => {
    const response = await server.put(`/groups/${group.group_id}`, group).catch(function (error) {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        } else if (error.request) {
            console.log(error.request);
        } else {
            console.log("Error", error.message);
        }
        console.log(error.config);
        throw error;
    });
    return response.data;
};

// Delete a group from the server
export const deleteGroupOnServer = async (group_id: string): Promise<void> => {
    await server.delete(`/groups/${group_id}`);
};