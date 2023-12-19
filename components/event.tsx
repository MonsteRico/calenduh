import { DateTime, Interval } from "luxon";
import React, { use, useContext, useEffect, useState } from "react";
import { useToday } from "~/hooks/useToday";

import { DayBeingViewedContext, EnabledCalendarIdsContext } from "~/hooks/contexts";
import { cn, hexToRgb } from "~/lib/utils";
import { CalendarEvent } from "~/lib/types";
import { useQuery } from "react-query";
import useGetEvents from "~/hooks/useGetEvents";
import Color from "color";
import useGetCalendar from "~/hooks/useGetCalendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import useUpdateEvent from "~/hooks/useUpdateEvent";
import useDeleteEvent from "~/hooks/useDeleteEvent";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import useGetCalendars from "~/hooks/useGetCalendars";

export function Event({ event, allEvents }: { event: CalendarEvent; allEvents: CalendarEvent[] }) {
    const { data: calendar } = useGetCalendar(event.calendar.id);
    console.log(allEvents)
    const today = useToday();
    const { value: enabledCalendarIds } = useContext(EnabledCalendarIdsContext);

    if (!event.interval.start || !event.interval.end || !calendar) {
        return null;
    }

    const eventDay = event.interval.start.startOf("day");
    const eventIsToday = eventDay.hasSame(today, "day");

    const rgb = hexToRgb(calendar.color);

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

    const backgroundColorString = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b})` : calendar.color;
    const backgroundColor = Color(backgroundColorString);
    const borderColor = backgroundColor.darken(0.35);

    return (
        <Popover>
            <PopoverTrigger
                className="absolute w-full overflow-ellipsis cursor-pointer flex"
                style={{
                    top: `${top}rem`,
                    zIndex: 0,
                    height: `${height}rem`,
                    width: `${width}%`,
                    left: `${left}%`,
                    backgroundColor: backgroundColor.string(),
                    borderLeft: `8px solid ${borderColor.string()}`,
                    opacity: 1,
                }}
            >
                <h4 className="text-center text-sm break-words">
                    {event.title}, {event.numConflicts}
                </h4>
            </PopoverTrigger>
            <ViewEvent event={event} />
        </Popover>
    );
}

export function AllDayEvent({ event }: { event: CalendarEvent }) {
    const { data: calendar } = useGetCalendar(event.calendar.id);

    if (!calendar) {
        return null;
    }

    const rgb = hexToRgb(calendar.color);

    const backgroundColorString = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b})` : calendar.color;
    const backgroundColor = Color(backgroundColorString);
    const borderColor = backgroundColor.darken(0.35);
    return (
        <Popover>
            <PopoverTrigger>
                <h4
                    key={event.id}
                    style={{
                        backgroundColor: backgroundColor.string(),
                        borderLeft: `8px solid ${borderColor.string()}`,
                    }}
                    className="py-2 text-center text-xs"
                >
                    {event.title}
                </h4>
            </PopoverTrigger>
            <ViewEvent event={event} />
        </Popover>
    );
}

export function MonthEvent({ event }: { event: CalendarEvent }) {
    const { data: calendar } = useGetCalendar(event.calendar.id);

    if (!calendar) {
        return null;
    }

    return (
        <Popover>
            <PopoverTrigger>
                <div className="flex flex-row justify-between text-xs text-primary">
                    <div className="flex flex-row">
                        <div
                            style={{ backgroundColor: calendar.color }}
                            className="w-2 h-2 rounded-full mr-2 my-auto"
                        ></div>
                        <h2>{event.title}</h2>
                    </div>
                    <h2 className="text-gray-500">
                        {event.allDay ? "All Day" : event.interval.start?.toLocaleString(DateTime.TIME_SIMPLE)}
                    </h2>
                </div>
            </PopoverTrigger>
            <ViewEvent event={event} />
        </Popover>
    );
}

// Only for normal events, not recurring events
function ViewEvent({ event }: { event: CalendarEvent }) {
    const updateEvent = useUpdateEvent(event);
    const deleteEvent = useDeleteEvent(event);
    const { data: calendars } = useGetCalendars();

    if (!event.interval.start || !event.interval.end || !calendars) {
        return null;
    }
    return (
        <PopoverContent className="">
            <div className="flex flex-row justify-between">
                <h2 className="font-bold text-xl text-primary my-auto">{event.title}</h2>
                <Button variant={"link"} className="text-blue-500 my-auto">
                    Edit
                </Button>
            </div>
            <hr className="my-3"></hr>
            <div className="flex flex-col text-sm">
                <h3 className="text-muted-foreground">{event.interval.start.toLocaleString(DateTime.DATE_HUGE)}</h3>
                <h3 className="text-muted-foreground">{event.interval.toLocaleString(DateTime.TIME_SIMPLE)}</h3>
            </div>
            <hr className="my-3"></hr>

            <div className="flex flex-row justify-between">
                <Label className=" my-auto">Calendar</Label>
                <DropdownMenu>
                    <DropdownMenuTrigger className="text-sm flex flex-row text-muted-foreground">
                        <div
                            style={{ backgroundColor: event.calendar.color }}
                            className="w-3 h-3 rounded-full my-auto"
                        ></div>
                        <h3 className="text-ellipsis px-2 overflow-hidden">{event.calendar.name}</h3>
                        <FontAwesomeIcon icon={faCaretDown} className="my-auto" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {calendars.map((calendar) => {
                            return (
                                <DropdownMenuItem key={calendar.id} className="flex flex-row">
                                    <div
                                        style={{ backgroundColor: calendar.color }}
                                        className="w-3 h-3 rounded-full my-auto"
                                    ></div>
                                    <h3 className="text-ellipsis px-2 overflow-hidden">{calendar.name}</h3>
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <hr className="my-3"></hr>
            <Button variant="destructive" onClick={() => {
                deleteEvent.mutate();
                // TODO bubble burst animation would be cool
            }} className="w-full">
                Delete Event
            </Button>
        </PopoverContent>
    );
}
