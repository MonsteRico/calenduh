import { DateTime } from "luxon";
import { useContext, useEffect, useState } from "react";
import { useToday } from "~/hooks/useToday";

import Color from "color";
import { useDrag } from "react-dnd";
import useGetCalendar from "~/hooks/calendars/useGetCalendar";
import { EnabledCalendarIdsContext } from "~/hooks/contexts";
import { useMediaQuery } from "~/hooks/useMediaQuery";
import { CalendarEvent } from "~/lib/types";
import { cn, hexToRgb } from "~/lib/utils";
import CreateEvent from "./addEvent";
import { DrawerPopover, DrawerPopoverTrigger } from "./responsiveDrawerPopover";
import { Popover, PopoverTrigger } from "./ui/popover";
import ViewEvent from "./viewEvent";

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
        <DrawerPopover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <DrawerPopoverTrigger
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
                <h4 className={cn("p-2 text-center text-xs", backgroundColor.isDark() ? "text-white" : "text-black")}>
                    {event.title}, {event.numConflicts}
                </h4>
            </DrawerPopoverTrigger>
            <ViewEvent event={event} dayItsOn={dayItsOn} popoverOpen={popoverOpen} />
        </DrawerPopover>
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
        <DrawerPopover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <DrawerPopoverTrigger>
                <h4
                    key={event.id}
                    style={{
                        backgroundColor: backgroundColor.string(),
                        borderLeft: `8px solid ${borderColor.string()}`,
                    }}
                    className={cn("py-2 text-center text-xs", backgroundColor.isDark() ? "text-white" : "text-black")}
                >
                    {event.title}
                </h4>
            </DrawerPopoverTrigger>
            <ViewEvent event={event} dayItsOn={dayItsOn} popoverOpen={popoverOpen} />
        </DrawerPopover>
    );
}

export function MonthEvent({ event, dayItsOn }: { event: CalendarEvent; dayItsOn: DateTime }) {
    const { data: calendar } = useGetCalendar(event.calendar.id);
    const [popoverOpen, setPopoverOpen] = useState(false);

    const [{ isDragging }, drag] = useDrag(() => ({
        // "type" is required. It is used by the "accept" specification of drop targets.
        type: "MonthEvent",
        // The collect function utilizes a "monitor" instance (see the Overview for what this is)
        // to pull important pieces of state from the DnD system.
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        item: {
            event: event,
            day: dayItsOn,
        },
    }));

    if (!calendar) {
        return null;
    }

    return (
        <DrawerPopover open={popoverOpen && !isDragging} onOpenChange={setPopoverOpen}>
            <DrawerPopoverTrigger>
                <div className={cn("flex flex-row justify-between text-xs text-primary", isDragging && "opacity-50")}>
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
            </DrawerPopoverTrigger>
            <ViewEvent event={event} dayItsOn={dayItsOn} popoverOpen={popoverOpen} />
        </DrawerPopover>
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
    const isDesktop = useMediaQuery("(min-width: 768px)");
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
        <DrawerPopover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <DrawerPopoverTrigger
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
                <h4 className={cn("py-2 text-center text-xs", backgroundColor.isDark() ? "text-white" : "text-black")}>
                    {event.title}, {event.numConflicts}
                </h4>
            </DrawerPopoverTrigger>
            <CreateEvent onCreated={onCreated} defaultEvent={event} day={dayItsOn} popoverOpen={popoverOpen} />
        </DrawerPopover>
    );
}
