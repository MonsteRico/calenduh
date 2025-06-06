import { DateTime } from "luxon";

export interface Event {
	event_id: string;
	calendar_id: string;
	name: string;
	location: string;
	description: string;
	frequency: string | null;
	priority: number;
	start_time: DateTime;
	end_time: DateTime;
	first_notification: number | null;
	second_notification: number | null;
	firstNotificationId?: string;
	secondNotificationId?: string;
	all_day: boolean;
	img: string | null;
}

export interface UpdateEvent {
	event_id: string;
	calendar_id?: string;
	name?: string;
	location?: string;
	description?: string;
	frequency?: string | null;
	priority?: number;
	start_time?: DateTime;
	end_time?: DateTime;
	first_notification?: number | null;
	second_notification?: number | null;
	all_day?: boolean;
	img: string | null;
}

export type EventInstance = Event; // Alias for clarity

export type EventUpsert = Omit<Event, "event_id"> & {
	event_id?: string; // Optional for new records
};
