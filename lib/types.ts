export interface User {
	user_id: string;
	email: string;
	username: string;
	name: string | undefined;
	birthday: string | undefined;
}

export interface Session {
	id: string;
	user_id: string;
	type: string; // Enum maybe?
	access_token: string;
	refresh_token: string;
	expires_on: Number; // int64
}
