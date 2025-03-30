import { useSQLiteContext, openDatabaseAsync } from "expo-sqlite";
import * as SQLite from "expo-sqlite";
import server from "@/constants/serverAxiosClient";
import { User, UpdateUser } from "@/types/user.types";
import { useSession } from "@/hooks/authContext";
import { getCalendarsFromDB } from "./calendar.helpers";
import { getEventsForCalendarFromDB, getEventsFromDB } from "./event.helpers";
import { DateTime } from "luxon";

export const deleteUserFromServer = async () => {
    const response = await server.delete('/users/@me');
    return;
}

export const deleteUserFromDB = async (userId: string) => {
    const db = await openDatabaseAsync("local.db");
    try {
        await db.runAsync("DELETE FROM calendars WHERE user_id = ?", [userId]);
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
}

export const migrateUserCalendarsInDB = async (userId: string) => {
    const db = await openDatabaseAsync("local.db");
    try {
        await db.runAsync("UPDATE calendars SET user_id = ? WHERE user_id = ?", [userId, "localUser"]);
    } catch (error) {
        console.error("Error migrating user calendars:", error);
        throw error;
    }
}

export const migrateUserServer  = async (userId: string) => {
    const calendars = await getCalendarsFromDB(userId);
    const events = [];
    for (const calendar of calendars) {
        const eventsForCalendar = await getEventsForCalendarFromDB(calendar.calendar_id);
        events.push(...eventsForCalendar);
    }
    console.log("Migrating user to server:", { events, calendars });
    const response = await server.post('/users/@local', { events, calendars });
    return response.data;
}

export const getUserFromDB = async (userId: string): Promise<User | undefined> => {
    const db = await openDatabaseAsync("local.db");
    try {
        const user = await db.getFirstAsync<{ user_id: string; username: string; email: string; birthday: string; name: string }>("SELECT * FROM users WHERE user_id = ?", userId);
        if (user) {
            return {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                birthday: user.birthday,
                name: user.name,
            };
        }
        return undefined;
    } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
    }
};

export const updateUserInDB = async (user_id: string, user: UpdateUser): Promise<void> => {
    const db = await openDatabaseAsync("local.db");
    try {
        const existingUser = await getUserFromDB(user_id);

        if (!existingUser) {
            throw new Error("User not found");
        }

        await db.runAsync(
            "UPDATE users SET username = ?, birthday = ?, name = ? WHERE user_id = ?",
            [
                // user.email ?? existingUser.email,
                user.username ?? existingUser.username,
                user.birthday ? DateTime.fromISO(user.birthday).toISO() : existingUser.birthday ? DateTime.fromISO(existingUser.birthday).toISO() : null,
                user.name ?? existingUser.name,
                user_id,
            ]
        );
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
};

export const updateUserOnServer = async (user: UpdateUser): Promise<User> => {
	const updatedUser = {...user};
	const response = await server.put(`/users/${user.user_id}`, updatedUser).catch(function (error) {
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