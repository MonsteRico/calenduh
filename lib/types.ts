import type { Interval } from "luxon";
export type CalendarEvent = {
    id: string;
    interval: Interval;
    name: string;
    color: string;
    numConflicts: number;
};
