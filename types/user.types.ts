import { DateTime } from "luxon";

export interface User {
    user_id: string;
    email: string;
    username: string;
    birthday: DateTime;
    name: string;
    // profile_picture: ?;
}

export interface UpdateUser {
    user_id: string;
    // email?: string; cannot edit email
    username?: string;
    birthday?: DateTime;
    name?: string;
    // profile_picture?: ?;
}

export type UserInstance = User;