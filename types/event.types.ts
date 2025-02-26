import { DateTime } from "luxon";

export interface Event {
	event_id: string;
	user_id: string;
	calendar_id: string;
	name: string;
	location: string;
	description: string;
	notification: string;
	frequency: number;
	priority: number;
	start_time: DateTime;
	end_time: DateTime;
}

export interface UpdateEvent {
	event_id: string;
	calendar_id?: string
	name?: string;
	location?: string;
	description?: string;
	notification?: string;
	frequency?: number;
	priority?: number;
	start_time?: DateTime;
	end_time?: DateTime;
}

export type EventInstance = Event; // Alias for clarity

export type EventUpsert = Omit<Event, "event_id"> & {
	event_id?: string; // Optional for new records
};
