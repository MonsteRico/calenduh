import { openDatabaseAsync } from "expo-sqlite";
import { Event, EventUpsert, UpdateEvent } from "@/types/event.types";
import server from "@/constants/serverAxiosClient";
import { useSession } from "@/hooks/authContext";
import { DateTime } from "luxon";
import { parse } from "path";
import { errorCatcher } from "./easyAxiosCatch";

// Get all events from the local database
export const getEventsFromDB = async (user_id: string): Promise<Event[]> => {
	const db = await openDatabaseAsync("local.db");

	try {
		const events = await db.getAllAsync<Event & { start_time: string; end_time: string }>(
			`
    SELECT events.* 
    FROM events
    JOIN calendars ON events.calendar_id = calendars.calendar_id
    WHERE calendars.user_id = ?
`,
			user_id
		);
		return events.map((item) => ({
			...item,
			start_time: DateTime.fromJSDate(new Date(item.start_time)),
			end_time: DateTime.fromJSDate(new Date(item.end_time)),
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
		const events = await db.getAllAsync<Event & { start_time: string; end_time: string }>(
			"SELECT * FROM events WHERE calendar_id = ?",
			calendar_id
		);
		return events.map((item) => ({
			...item,
			start_time: DateTime.fromJSDate(new Date(item.start_time)),
			end_time: DateTime.fromJSDate(new Date(item.end_time)),
		}));
	} catch (error) {
		console.error("Error fetching events for calendar:", error);
		throw error;
	}
};

// Get a single event from the local database
export const getEventFromDB = async (event_id: string): Promise<Event | undefined> => {
	const db = await openDatabaseAsync("local.db");

	try {
		const event = await db.getFirstAsync<Event & { start_time: string; end_time: string }>(
			"SELECT * FROM events WHERE event_id = ?",
			event_id
		);
		if (event) {
			return {
				...event,
				start_time: DateTime.fromJSDate(new Date(event.start_time)),
				end_time: DateTime.fromJSDate(new Date(event.end_time)),
			};
		}
		return undefined;
	} catch (error) {
		console.error("Error fetching event:", error);
		throw error;
	}
};

// Insert an event into the local database
export const insertEventIntoDB = async (event: EventUpsert, userId: string): Promise<void> => {
	const db = await openDatabaseAsync("local.db");

	try {
		await db.runAsync(
			"INSERT INTO events (event_id, calendar_id, name, location, description, first_notification, second_notification, frequency, priority, start_time, end_time, all_day) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			[
				event.event_id || "",
				event.calendar_id,
				event.name,
				event.location || null,
				event.description || null,
				event.first_notification || null,
				event.second_notification || null,
				event.frequency || null,
				event.priority || null,
				event.start_time.valueOf().toString(),
				event.end_time.valueOf().toString(),
				event.all_day,
			]
		);
	} catch (error) {
		console.log("Event was", event);
		console.error("Error inserting event:", error);
		throw error;
	}
};

// Up an event into the local database
export const upsertEventIntoDB = async (event: EventUpsert, userId: string): Promise<void> => {
	const db = await openDatabaseAsync("local.db");
	let eventInDB = false;

	if (event.event_id) {
		const eventFromDB = await getEventFromDB(event.event_id);
		if (eventFromDB) {
			eventInDB = true;
		}
	}

	try {
		if (eventInDB && event.event_id) {
			await updateEventInDB(event.event_id, event as UpdateEvent, userId);
		} else {
			await insertEventIntoDB(event, userId);
		}
	} catch (error) {
		console.error("Error upserting event:", error);
		throw error;
	}
};

// Update an event in the local database
export const updateEventInDB = async (eventId: string, event: UpdateEvent, userId: string): Promise<void> => {
	const db = await openDatabaseAsync("local.db");

	try {
		const existingEvent = await getEventFromDB(eventId);

		if (!existingEvent) {
			throw new Error("Event not found");
		}

		await db.runAsync(
			"UPDATE events SET calendar_id = ?, name = ?, location = ?, description = ?, first_notification = ?, second_notification = ?, frequency = ?, priority = ?, start_time = ?, end_time = ?, all_day = ?, event_id = ? WHERE event_id = ?",
			[
				event.calendar_id ?? existingEvent.calendar_id,
				event.name ?? existingEvent.name,
				event.location ?? existingEvent.location,
				event.description ?? existingEvent.description,
				event.first_notification ?? existingEvent.first_notification,
				event.second_notification ?? existingEvent.second_notification,
				event.frequency ?? existingEvent.frequency,
				event.priority ?? existingEvent.priority,
				event.start_time?.valueOf().toString() ?? existingEvent.start_time.valueOf().toString(),
				event.end_time?.valueOf().toString() ?? existingEvent.end_time.valueOf().toString(),
				event.all_day ?? existingEvent.all_day,
				event.event_id,
				eventId,
			]
		);
	} catch (error) {
		console.error("Error updating event:", error);
		throw error;
	}
};

export const updateEventNotificationIds = async (eventId: string, notificationIds: string[]): Promise<void> => {
	const db = await openDatabaseAsync("local.db");

	try {
		await db.runAsync("UPDATE events SET first_notification_id = ?, second_notification_id = ? WHERE event_id = ?", [
			notificationIds.at(0) ?? null,
			notificationIds.at(1) ?? null,
			eventId,
		]);
	} catch (error) {
		console.error("Error updating event notification ids:", error);
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
	const events = response.data as (Event & { start_time: string; end_time: string })[];
	return events.map((event: Event & { start_time: string; end_time: string }) => ({
		...event,
		start_time: DateTime.fromJSDate(new Date(event.start_time)),
		end_time: DateTime.fromJSDate(new Date(event.end_time)),
	}));
};

export const getEventsForCalendarFromServer = async (calendar_id: string): Promise<Event[]> => {
	const response = await server.get(`/events/${calendar_id}`);
	const events = response.data as (Event & { start_time: string; end_time: string })[];
	return events.map((event: Event & { start_time: string; end_time: string }) => ({
		...event,
		start_time: DateTime.fromJSDate(new Date(event.start_time)),
		end_time: DateTime.fromJSDate(new Date(event.end_time)),
	}));
};

export const getEventsForDayFromServer = async (startMs: number, endMs: number): Promise<Event[]> => {
	const response = await server.get(`/events/@me/?start=${startMs}&end=${endMs}`);
	const events = response.data as (Event & { start_time: string; end_time: string })[];
	if (!events) {
		return []
	}
	return events.map((event: Event & { start_time: string; end_time: string }) => ({
		...event,
		start_time: DateTime.fromJSDate(new Date(event.start_time)),
		end_time: DateTime.fromJSDate(new Date(event.end_time)),
	}));
};

export const getEventFromServer = async (calendar_id: string, event_id: string): Promise<Event> => {
	const response = await server.get(`/events/${calendar_id}/${event_id}`);
	const event = response.data as Event & { start_time: string; end_time: string };
	return {
		...event,
		start_time: DateTime.fromJSDate(new Date(event.start_time)),
		end_time: DateTime.fromJSDate(new Date(event.end_time)),
	};
};

export const createEventOnServer = async (calendar_id: string, event: EventUpsert): Promise<Event> => {
	const modifiedEvent = {
		...event,
		start_time: event.start_time.toUTC().toISO(),
		end_time: event.end_time.toUTC().toISO(),
	}
	console.log("Sending to server", modifiedEvent);
	const response = await server.post(`/events/${calendar_id}`, modifiedEvent).catch(errorCatcher);
	const createdEvent = response?.data as Event & { start_time: string; end_time: string };
	return {
		...createdEvent,
		start_time: DateTime.fromJSDate(new Date(createdEvent.start_time)),
		end_time: DateTime.fromJSDate(new Date(createdEvent.end_time)),
	};
};

export const updateEventOnServer = async (calendar_id: string, event: UpdateEvent): Promise<Event> => {
	let modifiedEvent;
	if (event.start_time && event.end_time) {
		modifiedEvent = {
			...event,
			start_time: event.start_time.toUTC().toISO(),
			end_time: event.end_time.toUTC().toISO(),
		};
	} else if (event.start_time) {
		modifiedEvent = {
			...event,
			start_time: event.start_time.toUTC().toISO(),
		};
	} else if (event.end_time) {
		modifiedEvent = {
			...event,
			end_time: event.end_time.toUTC().toISO(),
		};
	}
	console.log("Updating on server", modifiedEvent);
	const response = await server.put(`/events/${calendar_id}/${event.event_id}`, modifiedEvent);
	const updatedEvent = response.data as Event & { start_time: string; end_time: string };
	return {
		...updatedEvent,
		start_time: DateTime.fromJSDate(new Date(updatedEvent.start_time)),
		end_time: DateTime.fromJSDate(new Date(updatedEvent.end_time)),
	};
};

export const deleteEventOnServer = async (calendar_id: string, event_id: string): Promise<void> => {
	await server.delete(`/events/${calendar_id}/${event_id}`);
};
