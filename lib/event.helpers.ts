import { useSQLiteContext } from "expo-sqlite";
import { Event, EventUpsert } from "@/types/event.types";
import server from "@/constants/serverAxiosClient";

// Get all events from the local database
export const getEventsFromDB = async (): Promise<Event[]> => {
	const db = await openDatabaseAsync("local.db");

	try {
		const events = await db.getAllAsync<Event>("SELECT * FROM events");
		return events.map((item) => ({
			...item,
			start_time: new Date(item.start_time),
			end_time: new Date(item.end_time),
		}));
	} catch (error) {
		console.error("Error fetching events:", error);
		throw error;
	}
};

// Get events for a specific calendar from the local database
export const getEventsForCalendarFromDB = async (calendar_id: string): Promise<Event[]> => {
	const db = await openDatabaseAsync("local.db");
	try {
		const events = await db.getAllAsync<Event>("SELECT * FROM events WHERE calendar_id = ?", calendar_id);
		return events.map((item) => ({
			...item,
			start_time: new Date(item.start_time),
			end_time: new Date(item.end_time),
		}));
	} catch (error) {
		console.error("Error fetching events for calendar:", error);
		throw error;
	}
};

// Get a single event from the local database
export const getEventFromDB = async (calendar_id: string, event_id: string): Promise<Event | undefined> => {
	const db = await openDatabaseAsync("local.db");

	try {
		const event = await db.getFirstAsync<Event>(
			"SELECT * FROM events WHERE calendar_id = ? AND event_id = ?",
			calendar_id,
			event_id
		);
		if (event) {
			return {
				...event,
				start_time: new Date(event.start_time),
				end_time: new Date(event.end_time),
			};
		}
		return undefined;
	} catch (error) {
		console.error("Error fetching event:", error);
		throw error;
	}
};

// Insert an event into the local database
export const insertEventIntoDB = async (event: EventUpsert): Promise<void> => {
	const db = await openDatabaseAsync("local.db");

	try {
		await db.runAsync(
			"INSERT INTO events (event_id, calendar_id, name, location, description, notification, frequency, priority, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			[
				event.event_id || "",
				event.calendar_id,
				event.name,
				event.location || null,
				event.description || null,
				event.notification || null,
				event.frequency || null,
				event.priority || null,
				event.start_time.toISOString(),
				event.end_time.toISOString(),
			]
		);
	} catch (error) {
		console.error("Error inserting event:", error);
		throw error;
	}
};

// Update an event in the local database
export const updateEventInDB = async (event: Event): Promise<void> => {
	const db = await openDatabaseAsync("local.db");

	try {
		await db.runAsync(
			"UPDATE events SET calendar_id = ?, name = ?, location = ?, description = ?, notification = ?, frequency = ?, priority = ?, start_time = ?, end_time = ? WHERE event_id = ?",
			[
				event.calendar_id,
				event.name,
				event.location || null,
				event.description || null,
				event.notification || null,
				event.frequency || null,
				event.priority || null,
				event.start_time.toISOString(),
				event.end_time.toISOString(),
				event.event_id,
			]
		);
	} catch (error) {
		console.error("Error updating event:", error);
		throw error;
	}
};

// Delete an event from the local database
export const deleteEventFromDB = async (event_id: string): Promise<void> => {
	const db = await openDatabaseAsync("local.db");

	try {
		await db.runAsync("DELETE FROM events WHERE event_id = ?", event_id);
	} catch (error) {
		console.error("Error deleting event:", error);
		throw error;
	}
};

// --- API Requests ---

export const getEventsFromServer = async (): Promise<Event[]> => {
	const response = await server.get("/events");
	return response.data;
};

export const getEventsForCalendarFromServer = async (calendar_id: string): Promise<Event[]> => {
	const response = await server.get(`/events/${calendar_id}`);
	return response.data;
};

export const getEventFromServer = async (calendar_id: string, event_id: string): Promise<Event> => {
	const response = await server.get(`/events/${calendar_id}/${event_id}`);
	return response.data;
};

export const createEventOnServer = async (calendar_id: string, event: Omit<Event, "event_id">): Promise<Event> => {
	const response = await server.post(`/events/${calendar_id}`, event);
	return response.data;
};

export const updateEventOnServer = async (calendar_id: string, event: Event): Promise<Event> => {
	const response = await server.put(`/events/${calendar_id}/${event.event_id}`, event);
	return response.data;
};

export const deleteEventOnServer = async (calendar_id: string, event_id: string): Promise<void> => {
	await server.delete(`/events/${calendar_id}/${event_id}`);
};
