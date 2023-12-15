import { DateTime, Interval } from "luxon";
import type { CalendarEvent } from "./types";

const event1: CalendarEvent = {
    id: "event1",
    interval: Interval.fromDateTimes(DateTime.fromObject({ hour: 8 }), DateTime.fromObject({ hour: 9 })),
    name: "1",
    color: "#FF0000", // Red
    numConflicts: 0,
};

const event2: CalendarEvent = {
    id: "event2",
    interval: Interval.fromDateTimes(DateTime.fromObject({ hour: 10 }), DateTime.fromObject({ hour: 10, minute: 15 })),
    name: "2",
    color: "#00FF00", // Green
    numConflicts: 0,
};

Interval.fromISO("2021-01-01T08:00:00.000-05:00/2021-01-01T09:00:00.000-05:00");

const event3: CalendarEvent = {
    id: "event3",
    interval: Interval.fromDateTimes(DateTime.fromObject({ hour: 11, minute: 30 }), DateTime.fromObject({ hour: 12 })),
    name: "3",
    color: "#0000FF", // Blue
    numConflicts: 0,
};

const event4: CalendarEvent = {
    id: "event4",
    interval: Interval.fromDateTimes(DateTime.fromObject({ hour: 13 }), DateTime.fromObject({ hour: 14 })),
    name: "4",
    color: "#FFFF00", // Yellow
    numConflicts: 0,
};

const event5: CalendarEvent = {
    id: "event5",
    interval: Interval.fromDateTimes(DateTime.fromObject({ hour: 14 }), DateTime.fromObject({ hour: 14, minute: 30 })),
    name: "5",
    color: "#FF00FF", // Magenta
    numConflicts: 0,
};

const event6: CalendarEvent = {
    id: "event6",
    interval: Interval.fromDateTimes(
        DateTime.fromObject({ hour: 14, minute: 30 }),
        DateTime.fromObject({ hour: 14, minute: 45 })
    ),
    name: "6",
    color: "#00FFFF", // Cyan
    numConflicts: 0,
};

const event7: CalendarEvent = {
    id: "event7",
    interval: Interval.fromDateTimes(
        DateTime.fromObject({ hour: 14, minute: 45 }),
        DateTime.fromObject({ hour: 15, minute: 45 })
    ),
    name: "7",
    color: "#FFAA00", // Orange
    numConflicts: 0,
};


export const events: CalendarEvent[] = [
    event1,
    event2,
    event3,
    event4,
    event5,
    event6,
    event7,
];
