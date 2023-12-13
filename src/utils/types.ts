import type { Interval } from 'luxon';
export type CalendarEvent = {
    interval: Interval;
    name: string;
    color: string;
    numConflicts: number;
};
