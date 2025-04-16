import { DateTime } from "luxon";

export interface User {
	user_id: string;
	email: string;
	username: string;
	name: string | undefined;
	birthday: string | undefined;
	default_calendar_id: string | undefined;
	profile_picture: string | undefined;
	is_24_hour: boolean;
}

export interface Session {
	id: string;
	user_id: string;
	type: string; // Enum maybe?
	access_token: string;
	refresh_token: string;
	expires_on: Number; // int64
}


export interface UpdateUser {
    user_id: string;
    username?: string;
    birthday?: string;
    name?: string;
    default_calendar_id?: string;
    profile_picture?: string;
	is_24_hour?: boolean;
}

export type UserInstance = User;