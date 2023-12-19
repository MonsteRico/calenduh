import type { DateTime, Interval } from "luxon";
import { dbCalendarEvent } from "./schema";

export type CalendarEvent = Omit<dbCalendarEvent, "startMonth" | "startDay" 
| "startYear" | "endMonth" | "endDay" | "endYear" | "startTime" | "endTime" | "daysTurnedOff"
> & {
    interval: Interval<true>;
    calendar: Calendar;
    recurringEndDay?: DateTime<true> | null;
}

export type Calendar = {
    id: number;
    name: string;
    color: string;
    events?: CalendarEvent[];
};