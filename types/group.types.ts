export interface Group {
	group_id: string;
    name: string;
    invite_code: string;
    calendar_ids: string[] | null;
}

export interface UpdateGroup {
    group_id: string;
    name?: string;
    calendar_ids?: string[] | null;
}

export type GroupInstance = Group; // Alias for clarity

export type GroupUpsert = Omit<Group, "group_id"> & {
    group_id?: string; // Optional for new records
};