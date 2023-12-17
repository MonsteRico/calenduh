import { DateTime, Interval } from "luxon";
import React, { use, useContext, useEffect, useState } from "react";
import { useToday } from "~/hooks/useToday";

import { DayBeingViewedContext, EnabledCalendarIdsContext } from "~/hooks/contexts";
import { cn, hexToRgb } from "~/lib/utils";
import { CalendarEvent } from "~/lib/types";
import { useQuery } from "react-query";
import useGetEvents from "~/hooks/useGetEvents";
import Color from "color";

export function Event({ event, allEvents }: { event: CalendarEvent; allEvents: CalendarEvent[] }) {
    const today = useToday();
    const { value: enabledCalendarIds } = useContext(EnabledCalendarIdsContext);

    if (!event.interval.start || !event.interval.end) {
        return null;
    }
    const eventDay = event.interval.start.startOf("day");
    const eventIsToday = eventDay.hasSame(today, "day");

    const rgb = hexToRgb(event.calendar.color);

    const currentEventIndex = allEvents.findIndex((e) => e.id === event.id);

    const top = (event.interval.start.diff(eventDay.startOf("day")).as("minutes") / 15) * 1.5;
    const height = (event.interval.end.diff(event.interval.start).as("minutes") / 15) * 1.5;

    // Step 1: Filter allEvents to only include events that overlap with the current event
    const overlappingEvents = allEvents
        .filter((e) => enabledCalendarIds.includes(e.calendar.id))
        .filter((e) => e.interval.overlaps(event.interval));

    // include into overlappingEvents any events that overlap with events in overlappingEvents. Don't include duplicates
    overlappingEvents.forEach((overlappingEvent, i) => {
        const otherOverlappingEvents = allEvents
            .filter((e) => enabledCalendarIds.includes(e.calendar.id))
            .filter((e) => e.interval.overlaps(overlappingEvent.interval));
        otherOverlappingEvents.forEach((otherEvent) => {
            if (!overlappingEvents.includes(otherEvent) && otherEvent.id !== event.id) {
                overlappingEvents.push(otherEvent);
            }
        });
    });

    // Step 2: Sort the overlapping events by their start time
    overlappingEvents.sort((a, b) => {
        if (!a.interval.start || !b.interval.start) {
            return 0;
        }
        return a.interval.start.toMillis() - b.interval.start.toMillis();
    });

    // update numConflicts for each event
    overlappingEvents.forEach((event, i) => {
        let numConflicts = 0;
        overlappingEvents.forEach((otherEvent, j) => {
            if (i === j) {
                return;
            }
            if (event.interval.overlaps(otherEvent.interval)) {
                numConflicts++;
            }
        });
        event.numConflicts = numConflicts;
    });

    // Step 3: Find the index of the current event in the sorted array of overlapping events
    const currentEventIndexAmongConflicts = overlappingEvents.findIndex((e) => e.id === event.id);

    // set numConflictsForWidth to the maximum number of conflicts among all overlapping events
    const numConflictsForWidth = overlappingEvents.reduce((acc, e) => {
        return Math.max(acc, e.numConflicts as number);
    }, 0);

    // Now you can use currentEventIndexAmongConflicts to calculate the left property
    const left = (currentEventIndexAmongConflicts / overlappingEvents.length) * 100;
    const width = (1 / (numConflictsForWidth + 1)) * 100;

    const backgroundColorString = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b})` : event.calendar.color;
    const backgroundColor = Color(backgroundColorString);
    const borderColor = backgroundColor.darken(0.35);
    return (
        <div
            className="absolute w-full overflow-hidden"
            style={{
                top: `${top}rem`,
                height: `${height}rem`,
                width: `${width}%`,
                left: `${left}%`,
                backgroundColor: backgroundColor.string(),
                borderLeft: `8px solid ${borderColor.string()}`,
                opacity: 1,
            }}
        >
            <h4 className="text-center text-sm break-words">
                {event.name}, {event.numConflicts}
            </h4>
        </div>
    );
}

export function AllDayEvent({ event }: { event: CalendarEvent }) {
    const rgb = hexToRgb(event.calendar.color);

    const backgroundColorString = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b})` : event.calendar.color;
    const backgroundColor = Color(backgroundColorString);
    const borderColor = backgroundColor.darken(0.35);
    return (
        <h4
            key={event.id}
            style={{ backgroundColor: backgroundColor.string(), borderLeft: `8px solid ${borderColor.string()}` }}
            className="py-2 text-center text-xs"
        >
            {event.name}
        </h4>
    );
}

export function MonthEvent({ event }: { event: CalendarEvent }) {
    return (
        <div className="flex flex-row justify-between text-xs text-primary">
            <div className="flex flex-row">
                <div
                    style={{ backgroundColor: event.calendar.color }}
                    className="w-2 h-2 rounded-full mr-2 my-auto"
                ></div>
                <h2>{event.name}</h2>
            </div>
            <h2 className="text-gray-500">
                {event.allDay ? "All Day" : event.interval.start?.toLocaleString(DateTime.TIME_SIMPLE)}
            </h2>
        </div>
    );
}
