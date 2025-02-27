import { useSQLiteContext, openDatabaseAsync } from "expo-sqlite";
import * as SQLite from "expo-sqlite";
import server from "@/constants/serverAxiosClient";
import { Calendar, CalendarUpsert, UpdateCalendar } from "@/types/calendar.types";
import { useSession } from "@/hooks/authContext";

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