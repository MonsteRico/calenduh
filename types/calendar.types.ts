export interface Calendar {
	calendar_id: string;
	user_id: string | null;
	group_id: string | null;
	color: string;
	title: string;
	is_public: boolean;
}

export type CalendarInstance = Calendar; // Alias for clarity

export type CalendarUpsert = Omit<Calendar, "calendar_id"> & {
	calendar_id?: string; // Optional for new records
};
