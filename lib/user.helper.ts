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


export const updateUserOnServer = async (user: UpdateUser): Promise<User> => {
	const updatedUser = {...user};
	const response = await server.put(`/users/${user.user_id}`, updatedUser)
    console.log("response in updateUserOnServer", response )
	return response.data;
};