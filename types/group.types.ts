export interface Group {
	group_id: string;
    name: string;
    invite_code: string;
}

export interface UpdateGroup {
    group_id: string;
    name?: string;
}

export type GroupInstance = Group; // Alias for clarity

export type GroupUpsert = Omit<Group, "group_id"> & {
    group_id?: string; // Optional for new records
};