import type { DateTime, Interval } from "luxon";
import { dbCalendarEvent } from "../db/schema/main";
import { User } from "next-auth";

export type CalendarEvent = Omit<
    dbCalendarEvent,
    | "startMonth"
    | "startDay"
    | "startYear"
    | "endMonth"
    | "endDay"
    | "endYear"
    | "startTime"
    | "endTime"
    | "daysTurnedOff"
> & {
    interval: Interval<true>;
    calendar: Calendar;
    recurringEndDay?: DateTime<true> | null;
};

export type Calendar = {
    id: number;
    name: string;
    color: string;
    userId: string;
    isDefault: boolean;
    subscribeCode: string;
    subscribed?: boolean;
    user?: User;
    events?: CalendarEvent[];
};

export type UserPreferences = {
    accentColor: string;
    startOnToday: boolean;
    startOnPreviousView: boolean;
    defaultCalendarId: number;
};
