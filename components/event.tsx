import { DateTime, Interval } from "luxon";
import React, { use, useContext, useEffect, useState } from "react";
import { useToday } from "~/hooks/useToday";

import { DayBeingViewedContext, EnabledCalendarIdsContext } from "~/hooks/contexts";
import { capitalize, cn, hexToRgb } from "~/lib/utils";
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./ui/alert-dialog";
import { useDebounce } from "~/hooks/useDebounce";
import { DatePicker } from "./ui/date-picker";
import useGetEvent from "~/hooks/useGetEvent";
import { Switch } from "./ui/switch";
import { Input } from "./ui/input";
import ViewEvent from "./viewEvent";
import CreateEvent from "./addEvent";

export function Event({
    event,
    allEvents,
    dayItsOn,
}: {
    event: CalendarEvent;
    allEvents: CalendarEvent[];
    dayItsOn: DateTime;
}) {
    const { data: calendar } = useGetCalendar(event.calendar.id);
    const today = useToday();
    const { value: enabledCalendarIds } = useContext(EnabledCalendarIdsContext);
    const [popoverOpen, setPopoverOpen] = useState(false);

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
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
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
            <ViewEvent event={event} dayItsOn={dayItsOn} popoverOpen={popoverOpen} />
        </Popover>
    );
}

export function AllDayEvent({ event, dayItsOn }: { event: CalendarEvent; dayItsOn: DateTime }) {
    const { data: calendar } = useGetCalendar(event.calendar.id);
    const [popoverOpen, setPopoverOpen] = useState(false);

    if (!calendar) {
        return null;
    }

    const rgb = hexToRgb(calendar.color);

    const backgroundColorString = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b})` : calendar.color;
    const backgroundColor = Color(backgroundColorString);
    const borderColor = backgroundColor.darken(0.35);
    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
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
            <ViewEvent event={event} dayItsOn={dayItsOn} popoverOpen={popoverOpen} />
        </Popover>
    );
}

export function MonthEvent({ event, dayItsOn }: { event: CalendarEvent; dayItsOn: DateTime }) {
    const { data: calendar } = useGetCalendar(event.calendar.id);
    const [popoverOpen, setPopoverOpen] = useState(false);

    if (!calendar) {
        return null;
    }

    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
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
            <ViewEvent event={event} dayItsOn={dayItsOn} popoverOpen={popoverOpen} />
        </Popover>
    );
}

export function NewEvent({
    event,
    allEvents,
    dayItsOn,
    dragging,
    onCreated,
}: {
    event: CalendarEvent;
    allEvents: CalendarEvent[];
    dayItsOn: DateTime;
    dragging: boolean;
    onCreated: () => void;
}) {
    const { data: calendar } = useGetCalendar(event.calendar.id);
    const today = useToday();
    const { value: enabledCalendarIds } = useContext(EnabledCalendarIdsContext);
    const [popoverOpen, setPopoverOpen] = useState(!dragging);

    useEffect(() => {
        setPopoverOpen(!dragging);
    }, [dragging]);

    if (!event.interval.start || !event.interval.end || !calendar) {
        return null;
    }

    const eventDay = event.interval.start.startOf("day");

    const rgb = hexToRgb(calendar.color);


    const top = (event.interval.start.diff(eventDay.startOf("day")).as("minutes") / 15) * 1.5;
    const height = (event.interval.end.diff(event.interval.start).as("minutes") / 15) * 1.5;


    const backgroundColorString = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b})` : calendar.color;
    const backgroundColor = Color(backgroundColorString);
    const borderColor = backgroundColor.darken(0.35);

    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger
                className="absolute w-full overflow-ellipsis cursor-pointer flex"
                style={{
                    top: `${top}rem`,
                    zIndex: 5,
                    height: `${height}rem`,
                    width: `100%`,
                    backgroundColor: backgroundColor.string(),
                    borderLeft: `8px solid ${borderColor.string()}`,
                    opacity: 1,
                }}
            >
                <h4 className="text-center text-sm break-words">
                    {event.title}, {event.numConflicts}
                </h4>
            </PopoverTrigger>
            <CreateEvent onCreated={onCreated} defaultEvent={event} day={dayItsOn} popoverOpen={popoverOpen} />
        </Popover>
    );
}