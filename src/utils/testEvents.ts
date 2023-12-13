import { DateTime, Interval } from "luxon";
import type { CalendarEvent } from "./types";

const event1: CalendarEvent = {
    interval: Interval.fromDateTimes(
        DateTime.fromObject({ hour: 8 }),
        DateTime.fromObject({ hour: 9 }),
    ),
    name: "testEvent1",
    color: "#FF0000", // Red
    numConflicts: 0,
};

const event2: CalendarEvent = {
    interval: Interval.fromDateTimes(
        DateTime.fromObject({ hour: 10 }),
        DateTime.fromObject({ hour: 10, minute: 15 }),
    ),
    name: "testEvent2",
    color: "#00FF00", // Green
    numConflicts: 0,
};

const event3: CalendarEvent = {
    interval: Interval.fromDateTimes(
        DateTime.fromObject({ hour: 11, minute: 30 }),
        DateTime.fromObject({ hour: 12 }),
    ),
    name: "testEvent3",
    color: "#0000FF", // Blue
    numConflicts: 0,
};

const event4: CalendarEvent = {
    interval: Interval.fromDateTimes(
        DateTime.fromObject({ hour: 13 }),
        DateTime.fromObject({ hour: 14 }),
    ),
    name: "testEvent4",
    color: "#FFFF00", // Yellow
    numConflicts: 0,
};

const event5: CalendarEvent = {
    interval: Interval.fromDateTimes(
        DateTime.fromObject({ hour: 14 }),
        DateTime.fromObject({ hour: 14, minute: 30 }),
    ),
    name: "testEvent5",
    color: "#FF00FF", // Magenta
    numConflicts: 0,
};

const event6: CalendarEvent = {
    interval: Interval.fromDateTimes(
        DateTime.fromObject({ hour: 14, minute: 30 }),
        DateTime.fromObject({ hour: 14, minute: 45 }),
    ),
    name: "testEvent6",
    color: "#00FFFF", // Cyan
    numConflicts: 0,
};

const event7: CalendarEvent = {
    interval: Interval.fromDateTimes(
        DateTime.fromObject({ hour: 14, minute: 45 }),
        DateTime.fromObject({ hour: 15, minute: 45 }),
    ),
    name: "testEvent7",
    color: "#FFAA00", // Orange
    numConflicts: 0,
};

const event8: CalendarEvent = {
    interval: Interval.fromDateTimes(
        DateTime.fromObject({ hour: 15, minute: 45 }),
        DateTime.fromObject({ hour: 16, minute: 15 }),
    ),
    name: "testEvent8",
    color: "#AA00FF", // Purple
    numConflicts: 1,
};

const event9: CalendarEvent = {
    interval: Interval.fromDateTimes(
        DateTime.fromObject({ hour: 16, minute: 15 }),
        DateTime.fromObject({ hour: 16, minute: 30 }),
    ),
    name: "testEvent9",
    color: "#00AAFF", // Light Blue
    numConflicts: 1,
};

const event10: CalendarEvent = {
    interval: Interval.fromDateTimes(
        DateTime.fromObject({ hour: 16, minute: 30 }),
        DateTime.fromObject({ hour: 17 }),
    ),
    name: "testEvent10",
    color: "#FFAAFF", // Light Pink
    numConflicts: 2,
};

const event11: CalendarEvent = {
    interval: Interval.fromDateTimes(
        DateTime.fromObject({ hour: 15, minute: 45 }),
        DateTime.fromObject({ hour: 16, minute: 15 }),
    ),
    name: "testEvent11",
    color: "#AAFF00", // Lime Green
    numConflicts: 1,
};

const event12: CalendarEvent = {
    interval: Interval.fromDateTimes(
        DateTime.fromObject({ hour: 16, minute: 15 }),
        DateTime.fromObject({ hour: 16, minute: 30 }),
    ),
    name: "testEvent12",
    color: "#FF00AA", // Pink
    numConflicts: 1,
};

const event13: CalendarEvent = {
    interval: Interval.fromDateTimes(
        DateTime.fromObject({ hour: 16, minute: 30 }),
        DateTime.fromObject({ hour: 17 }),
    ),
    name: "testEvent13",
    color: "#00FFAA", // Aqua
    numConflicts: 2,
};

const event14: CalendarEvent = {
  interval: Interval.fromDateTimes(
    DateTime.fromObject({ hour: 16, minute: 30 }),
    DateTime.fromObject({ hour: 17 }),
  ),
  name: "testEvent14",
  color: "#AAFFAA", // Light Green
  numConflicts: 2,
};

export const events: CalendarEvent[] = [
    event1,
    event2,
    event3,
    event4,
    event5,
    event6,
    event7,
    event8,
    event9,
    event10,
    event11,
    event12,
    event13,
    event14,
];
