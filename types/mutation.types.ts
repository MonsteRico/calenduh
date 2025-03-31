export interface Mutation {
    number: number
    mutation:  MutationTypes;
    timestamp: number;
    parameters: string;
    calendar_id?: string;
	event_id?: string;
	group_id?: string; //Maybe?
}

export type MutationTypes =
	| "CREATE_CALENDAR"
	| "UPDATE_CALENDAR"
	| "DELETE_CALENDAR"
	| "CREATE_EVENT"
	| "UPDATE_EVENT"
	| "DELETE_EVENT"
	| "CREATE_GROUP" //Again idk if this is needed
	| "UPDATE_GROUP"
	| "DELETE_GROUP";
