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

const event8: CalendarEvent = {
    id: "event8",
    interval: Interval.fromDateTimes(
        DateTime.fromObject({ hour: 15, minute: 45 }),
        DateTime.fromObject({ hour: 16, minute: 15 })
    ),
    name: "8",
    color: "#AA00FF", // Purple
    numConflicts: 1,
};

const event9: CalendarEvent = {
    id: "event9",
    interval: Interval.fromDateTimes(
        DateTime.fromObject({ hour: 16, minute: 15 }),
        DateTime.fromObject({ hour: 16, minute: 30 })
    ),
    name: "9",
    color: "#00AAFF", // Light Blue
    numConflicts: 1,
};

const event10: CalendarEvent = {
    id: "event10",
    interval: Interval.fromDateTimes(DateTime.fromObject({ hour: 16, minute: 30 }), DateTime.fromObject({ hour: 17 })),
    name: "10",
    color: "#FFAAFF", // Light Pink
    numConflicts: 2,
};

const event11: CalendarEvent = {
    id: "event11",
    interval: Interval.fromDateTimes(
        DateTime.fromObject({ hour: 15, minute: 45 }),
        DateTime.fromObject({ hour: 16, minute: 15 })
    ),
    name: "11",
    color: "#AAFF00", // Lime Green
    numConflicts: 1,
};

const event12: CalendarEvent = {
    id: "event12",
    interval: Interval.fromDateTimes(
        DateTime.fromObject({ hour: 16, minute: 15 }),
        DateTime.fromObject({ hour: 16, minute: 45 })
    ),
    name: "12",
    color: "#FF00AA", // Pink
    numConflicts: 1,
};

const event13: CalendarEvent = {
    id: "event13",
    interval: Interval.fromDateTimes(DateTime.fromObject({ hour: 16, minute: 30 }), DateTime.fromObject({ hour: 17 })),
    name: "1333333333333333333333333333333333333333333333333333333333333333",
    color: "#00FFAA", // Aqua
    numConflicts: 2,
};

const event14: CalendarEvent = {
    id: "event14",
    interval: Interval.fromDateTimes(DateTime.fromObject({ hour: 15, minute: 30 }), DateTime.fromObject({ hour: 20 })),
    name: "144444444444444444444444444",
    color: "#AAFFAA", // Light Green
    numConflicts: 2,
};

export const events: CalendarEvent[] = [
    event7,
    event8,
    event9,
    event10,
    event11,
    event12,
    event13,
    event14,
];

const interval = Interval.fromDateTimes(
    DateTime.fromObject({ hour: 14, minute: 30 }),
    DateTime.fromObject({ hour: 14, minute: 45 })
);

function getRandomColor(): string {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

const mevent1: CalendarEvent = {
    id: "event1",
    interval: Interval.fromDateTimes(
    DateTime.fromObject({ hour: 12, minute: 30 }),
    DateTime.fromObject({ hour: 16, minute: 45 })),
    name: "1",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent2: CalendarEvent = {
    id: "event2",
    interval: interval,
    name: "2",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent3: CalendarEvent = {
    id: "event3",
    interval: interval,
    name: "3",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent4: CalendarEvent = {
    id: "event4",
    interval: interval,
    name: "4",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent5: CalendarEvent = {
    id: "event5",
    interval: interval,
    name: "5",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent6: CalendarEvent = {
    id: "event6",
    interval: interval,
    name: "6",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent7: CalendarEvent = {
    id: "event7",
    interval: interval,
    name: "7",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent8: CalendarEvent = {
    id: "event8",
    interval: interval,
    name: "8",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent9: CalendarEvent = {
    id: "event9",
    interval: interval,
    name: "9",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent10: CalendarEvent = {
    id: "event10",
    interval: interval,
    name: "10",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent11: CalendarEvent = {
    id: "event11",
    interval: interval,
    name: "11",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent12: CalendarEvent = {
    id: "event12",
    interval: interval,
    name: "12",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent13: CalendarEvent = {
    id: "event13",
    interval: interval,
    name: "13",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent14: CalendarEvent = {
    id: "event14",
    interval: interval,
    name: "14",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent15: CalendarEvent = {
    id: "event15",
    interval: interval,
    name: "15",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent16: CalendarEvent = {
    id: "event16",
    interval: interval,
    name: "16",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent17: CalendarEvent = {
    id: "event17",
    interval: interval,
    name: "17",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent18: CalendarEvent = {
    id: "event18",
    interval: interval,
    name: "18",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent19: CalendarEvent = {
    id: "event19",
    interval: interval,
    name: "19",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent20: CalendarEvent = {
    id: "event20",
    interval: interval,
    name: "20",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent21: CalendarEvent = {
    id: "event21",
    interval: interval,
    name: "21",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent22: CalendarEvent = {
    id: "event22",
    interval: interval,
    name: "22",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent23: CalendarEvent = {
    id: "event23",
    interval: interval,
    name: "23",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent24: CalendarEvent = {
    id: "event24",
    interval: interval,
    name: "24",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent25: CalendarEvent = {
    id: "event25",
    interval: interval,
    name: "25",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent26: CalendarEvent = {
    id: "event26",
    interval: interval,
    name: "26",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent27: CalendarEvent = {
    id: "event27",
    interval: interval,
    name: "27",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent28: CalendarEvent = {
    id: "event28",
    interval: interval,
    name: "28",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent29: CalendarEvent = {
    id: "event29",
    interval: interval,
    name: "29",
    color: getRandomColor(),
    numConflicts: 0,
};

const mevent30: CalendarEvent = {
    id: "event30",
    interval: interval,
    name: "30",
    color: getRandomColor(),
    numConflicts: 0,
};

export const manyEvents: CalendarEvent[] = [
    mevent1,
    mevent2,
    mevent3,
    mevent4,
    mevent5,
    mevent6,
    mevent7,
    mevent8,
    mevent9,
    mevent10,
    mevent11,
    mevent12,
    mevent13,
    mevent14,
    mevent15,
    mevent16,
    mevent17,
    mevent18,
    mevent19,
    mevent20,
    mevent21,
    mevent22,
    mevent23,
    mevent24,
    mevent25,
    mevent26,
    mevent27,
    mevent28,
    mevent29,
    mevent30,
];