import type { Interval } from "luxon";
export type CalendarEvent = {
    id: string;
    interval: Interval;
    name: string;
    numConflicts?: number;
    calendar: Calendar;
};

export type Calendar = {
    id: string;
    name: string;
    color: string;
    events?: CalendarEvent[];
};