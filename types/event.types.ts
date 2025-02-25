export interface Event {
	event_id: string;
	calendar_id: string;
	name: string;
	location: string | null;
	description: string | null;
	notification: string | null;
	frequency: number | null;
	priority: number | null;
	start_time: Date;
	end_time: Date;
}

export type EventInstance = Event; // Alias for clarity

export type EventUpsert = Omit<Event, "event_id"> & {
	event_id?: string; // Optional for new records
};
