import { useSQLiteContext, openDatabaseAsync } from "expo-sqlite";
import * as SQLite from "expo-sqlite";
import server from "@/constants/serverAxiosClient";
import { Calendar, CalendarUpsert, UpdateCalendar } from "@/types/calendar.types";
import { useSession } from "@/hooks/authContext";

// Get all calendars from the local database
export const getCalendarsFromDB = async (user_id: string): Promise<Calendar[]> => {
	const db = await openDatabaseAsync("local.db");

	try {
		const calendars = await db.getAllAsync<Omit<Calendar, "is_public"> & {is_public: number}>("SELECT * FROM calendars WHERE user_id = ?", user_id);
		// Convert INTEGER is_public to boolean
		return calendars.map((item) => ({
			...item,
			is_public: item.is_public == 1 ? true : false,
		}));
	} catch (error) {
		if (process.env.SHOW_LOGS == 'true') {
			console.error("Error fetching calendars:", error);
		}
		throw error;
	}
};

// Get a single calendar from the local database
export const getCalendarFromDB = async (calendar_id: string): Promise<Calendar | undefined> => {
	const db = await openDatabaseAsync("local.db");
	try {
		const calendar = await db.getFirstAsync<Omit<Calendar, "is_public"> & {is_public: number}>("SELECT * FROM calendars WHERE calendar_id = ?", calendar_id);
		if (calendar) {
			return {
				...calendar,
				is_public: calendar.is_public == 1 ? true : false,
			};
		}
		return undefined;
	} catch (error) {
		if (process.env.SHOW_LOGS == 'true') {
			console.error("Error fetching calendar:", error);
		}
		throw error;
	}
};

// Insert a calendar into the local database
export const insertCalendarIntoDB = async (calendar: CalendarUpsert, userId: string): Promise<void> => {
	const db = await openDatabaseAsync("local.db");
	console.log("inserting calendar for user", userId);
	try {
		await db.runAsync(
			"INSERT INTO calendars (user_id, calendar_id, group_id, color, title, is_public) VALUES (?, ?, ?, ?, ?, ?)",
			[
				userId,
				calendar.calendar_id || "",
				calendar.group_id || null,
				calendar.color || "#fac805",
				calendar.title,
				calendar.is_public ? 1 : 0,
			]
		);
	} catch (error) {
		if (process.env.SHOW_LOGS == 'true') {
			console.error("Error inserting calendar:", error);
		}
		throw error;
	}
};

// Up a calendar into the local database
export const upsertCalendarIntoDB = async (calendar: CalendarUpsert, userId: string): Promise<void> => {
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
			await updateCalendarInDB(calendar.calendar_id as string, calendar as Calendar, userId);
		} else {
			console.log("inserting calendar");
			await insertCalendarIntoDB(calendar, userId);
		}
	} catch (error) {
		if (process.env.SHOW_LOGS == 'true') {
			console.error("Error upserting calendar:", error);
		}
		throw error;
	}
};

// Update a calendar in the local database
export const updateCalendarInDB = async (calendar_id: string, calendar: UpdateCalendar, userId: string): Promise<void> => {
	const db = await openDatabaseAsync("local.db");
	try {
		const existingCalendar = await getCalendarFromDB(calendar_id);

		if (!existingCalendar) {
			throw new Error("Calendar not found");
		}

		await db.runAsync(
			"UPDATE calendars SET user_id = ?, group_id = ?, title = ?, color = ?, is_public = ?, calendar_id = ? WHERE calendar_id = ?",
			[
				userId,
				calendar.group_id ?? existingCalendar.group_id,
				calendar.title ?? existingCalendar.title,
				calendar.color ?? existingCalendar.color,
				calendar.is_public ?? existingCalendar.is_public,
				calendar.calendar_id,
				calendar_id,
			]
		);
	} catch (error) {
		if (process.env.SHOW_LOGS == 'true') {
			console.error("Error updating calendar:", error);
		}
		throw error;
	}
};

// Delete a calendar from the local database
export const deleteCalendarFromDB = async (calendar_id: string): Promise<void> => {
	const db = await openDatabaseAsync("local.db");
	try {
		await db.runAsync("DELETE FROM calendars WHERE calendar_id = ?", calendar_id);
	} catch (error) {
		if (process.env.SHOW_LOGS == 'true') {
			console.error("Error deleting calendar:", error);
		}
		throw error;
	}
};

// --- API Requests ---

export const getCalendarsFromServer = async (): Promise<Calendar[]> => {
	const response = await server.get("/calendars");
	return response.data;
};

export const getGroupCalendarsFromServer = async (group_id: string): Promise<Calendar[]> => {
	const response = await server.get(`/calendars/@groups/${group_id}`);
	return response.data
}

export const getCalendarFromServer = async (calendar_id: string): Promise<Calendar> => {
	const response = await server.get(`/calendars/${calendar_id}`);
	return response.data;
};

export const getMyGroupCalendarsFromServer = async (): Promise<Calendar[]> => {
	const response = await server.get("/calendars/@groups");
	console.log("Response", response.data);
	return response.data;
}

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

export const createGroupCalendarOnServer = async (calendar: Omit<Calendar, "calendar_id">): Promise<Calendar> => {
	const response = await server.post(`/calendars/${calendar.group_id}`, calendar);
	return response.data;
}

export const updateCalendarOnServer = async (calendar: UpdateCalendar): Promise<Calendar> => {
	const updatedCalendar = {...calendar, is_public: calendar.is_public as unknown as number == 1 ? true : false}
	const response = await server.put(`/calendars/${updatedCalendar.calendar_id}`, updatedCalendar).catch(function (error) {
		if (error.response) {
			// The request was made and the server responded with a status code
			// that falls out of the range of 2xx
			console.log(error.response.data);
			console.log(error.response.status);
			console.log(error.response.headers);
		} else if (error.request) {
			// The request was made but no response was received
			// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
			// http.ClientRequest in node.js
			console.log(error.request);
		} else {
			// Something happened in setting up the request that triggered an Error
			console.log("Error", error.message);
		}
		console.log(error.config);
		throw error;
	});
	return response.data;
};

export const deleteCalendarOnServer = async (calendar_id: string): Promise<void> => {
	await server.delete(`/calendars/${calendar_id}`);
};

export const joinPubCalOnServer = async ( calendar: Omit<Calendar, "calendar_id" | "name">): Promise<Calendar> => {
    const response = await server.post(`/subcriptions/`, calendar);
    return response.data;
} 