import type { Interval } from "luxon";
import { dbCalendarEvent } from "./schema";

export type CalendarEvent = Omit<dbCalendarEvent, "startMonth" | "startDay" 
| "startYear" | "endMonth" | "endDay" | "endYear" | "startTime" | "endTime" | "daysTurnedOff"
> & {
    interval: Interval<true>;
    calendar: Calendar;
}

export type Calendar = {
    id: number;
    name: string;
    color: string;
    events?: CalendarEvent[];
};