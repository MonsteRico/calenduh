import { useSQLiteContext, openDatabaseAsync } from "expo-sqlite";
import * as SQLite from "expo-sqlite";
import server from "@/constants/serverAxiosClient";
import { Calendar, CalendarUpsert } from "@/types/calendar.types";

// Get all calendars from the local database
export const getCalendarsFromDB = async (): Promise<Calendar[]> => {
	const db = await openDatabaseAsync("local.db");
	try {
		const calendars = await db.getAllAsync<Calendar>("SELECT * FROM calendars");
		// Convert INTEGER is_public to boolean
		return calendars.map((item) => ({
			...item,
			is_public: item.is_public === true,
		}));
	} catch (error) {
		console.error("Error fetching calendars:", error);
		throw error;
	}
};

// Get a single calendar from the local database
export const getCalendarFromDB = async (calendar_id: string): Promise<Calendar | undefined> => {
	const db = await openDatabaseAsync("local.db");
	try {
		const calendar = await db.getFirstAsync<Calendar>("SELECT * FROM calendars WHERE calendar_id = ?", calendar_id);
		if (calendar) {
			return {
				...calendar,
			};
		}
		return undefined;
	} catch (error) {
		console.error("Error fetching calendar:", error);
		throw error;
	}
};

// Insert a calendar into the local database
export const insertCalendarIntoDB = async (calendar: CalendarUpsert): Promise<void> => {
	const db = await openDatabaseAsync("local.db");
	try {
		await db.runAsync(
			"INSERT INTO calendars (calendar_id, group_id, color, title, is_public) VALUES (?, ?, ?, ?, ?)",
			[
				calendar.calendar_id || "",
				calendar.group_id || null,
				calendar.color || "#fac805",
				calendar.title,
				calendar.is_public ? true : false,
			]
		);
	} catch (error) {
		console.error("Error inserting calendar:", error);
		throw error;
	}
};

// Insert a calendar into the local database
export const upsertCalendarIntoDB = async (calendar: CalendarUpsert): Promise<void> => {
	const db = await openDatabaseAsync("local.db");
	let calendarInDB = false;
	if (calendar.calendar_id) {
		const calendarFromDB = await getCalendarFromDB(calendar.calendar_id);
		if (calendarFromDB) {
			calendarInDB = true;
		}
	}

	try {
		if (calendarInDB) {
			console.log("updating calendar");
			await updateCalendarInDB(calendar.calendar_id as string, calendar as Calendar);
		} else {
			console.log("inserting calendar");
			await insertCalendarIntoDB(calendar);
		}
	} catch (error) {
		console.error("Error upserting calendar:", error);
		throw error;
	}
};

// Update a calendar in the local database
export const updateCalendarInDB = async (calendar_id: string, calendar: Calendar): Promise<void> => {
	const db = await openDatabaseAsync("local.db");
	try {
		await db.runAsync(
			"UPDATE calendars SET group_id = ?, title = ?, color = ?, is_public = ?, calendar_id = ? WHERE calendar_id = ?",
			[
				calendar.group_id || null,
				calendar.title,
				calendar.color || "#fac805",
				calendar.is_public ? true : false,
				calendar.calendar_id,
				calendar_id,
			]
		);
	} catch (error) {
		console.error("Error updating calendar:", error);
		throw error;
	}
};

// Delete a calendar from the local database
export const deleteCalendarFromDB = async (calendar_id: string): Promise<void> => {
	const db = await openDatabaseAsync("local.db");
	try {
		await db.runAsync("DELETE FROM calendars WHERE calendar_id = ?", calendar_id);
	} catch (error) {
		console.error("Error deleting calendar:", error);
		throw error;
	}
};

// --- API Requests ---

export const getCalendarsFromServer = async (): Promise<Calendar[]> => {
	const response = await server.get("/calendars");
	return response.data;
};

export const getCalendarFromServer = async (calendar_id: string): Promise<Calendar> => {
	const response = await server.get(`/calendars/${calendar_id}`);
	return response.data;
};

export const getMyCalendarsFromServer = async (): Promise<Calendar[]> => {
	const response = await server.get(`/calendars/@me`);
	return response.data;
};

export const getSubscribedCalendarsFromServer = async (): Promise<Calendar[]> => {
	const response = await server.get(`/calendars/@subscribed`);
	return response.data;
};

export const createCalendarOnServer = async (calendar: Omit<Calendar, "calendar_id">): Promise<Calendar> => {
	const response = await server.post("/calendars/", calendar);
	console.log("create calendar on server", response.data);
	return response.data;
};

export const updateCalendarOnServer = async (calendar: Calendar): Promise<Calendar> => {
	const response = await server.put(`/calendars/${calendar.calendar_id}`, calendar);
	return response.data;
};

export const deleteCalendarOnServer = async (calendar_id: string): Promise<void> => {
	await server.delete(`/calendars/${calendar_id}`);
};
