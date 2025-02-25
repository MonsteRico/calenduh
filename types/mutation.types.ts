export interface Mutation {
    number: number
    mutation:  MutationTypes;
    timestamp: number;
    parameters: string;
    calendar_id?: string;
}

export type MutationTypes =
	| "CREATE_CALENDAR"
	| "UPDATE_CALENDAR"
	| "DELETE_CALENDAR"
	| "CREATE_EVENT"
	| "UPDATE_EVENT"
	| "DELETE_EVENT";
