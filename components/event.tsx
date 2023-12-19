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

// Only for normal events, not recurring events
function ViewEvent({
    event,
    dayItsOn,
    popoverOpen,
}: {
    event: CalendarEvent;
    dayItsOn: DateTime;
    popoverOpen?: boolean;
}) {
    const updateEvent = useUpdateEvent(event);
    const deleteEvent = useDeleteEvent(event);
    const { data: calendars } = useGetCalendars();
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);

    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(event.title);
    const debouncedTitle = useDebounce(title, 500);
    const [eventDate, setEventDate] = useState<Date | undefined>(dayItsOn.toJSDate());
    const [myCalendar, setMyCalendar] = useState(event.calendar);
    const [repeatType, setRepeatType] = useState(event.repeatType);
    const [recurringEndDay, setRecurringEndDay] = useState<Date | undefined>(
        event.recurringEndDay ? event.recurringEndDay.toJSDate() : undefined
    );

    useEffect(() => {
        if (debouncedTitle !== event.title) {
            console.log("updating title");
            updateEvent.mutate({ title: debouncedTitle });
        }
    }, [debouncedTitle]);

    useEffect(() => {
        if (!popoverOpen) {
            setEditing(false);
        }
    }, [popoverOpen]);

    if (!event.interval.start || !event.interval.end || !calendars) {
        return null;
    }
    return (
        <>
            <PopoverContent className="">
                {
                    // Title
                }
                {editing && (
                    <div className="flex flex-row justify-between">
                        <input
                            className="text-xl w-full font-bold text-primary my-auto bg-transparent border-b-2 border-primary outline-none"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <Button
                            onClick={() => {
                                setEditing(false);
                            }}
                            variant={"link"}
                            className="text-blue-500 my-auto"
                        >
                            Done
                        </Button>
                    </div>
                )}

                {!editing && (
                    <div className="flex flex-row justify-between">
                        <h2 className="font-bold text-xl text-primary my-auto">{event.title}</h2>
                        <Button
                            onClick={() => {
                                setEditing(true);
                            }}
                            variant={"link"}
                            className="text-blue-500 my-auto"
                        >
                            Edit
                        </Button>
                    </div>
                )}

                <hr className="my-3"></hr>

                {
                    // Event Date
                }
                {editing && (
                    <div className="flex flex-row justify-between">
                        <Label className=" my-auto">Event Date</Label>
                        <DatePicker
                            date={eventDate}
                            setDate={(newDate) => {
                                if (!newDate) {
                                    return;
                                }
                                updateEvent.mutate({
                                    eventDay: DateTime.fromJSDate(newDate).set({
                                        hour: event.interval.start.hour,
                                        minute: event.interval.start.minute,
                                        second: event.interval.start.second,
                                        millisecond: event.interval.start.millisecond,
                                    }) as DateTime<true>,
                                });
                                setEventDate(newDate);
                            }}
                        />
                    </div>
                )}

                {!editing && (
                    <div className="flex flex-col text-sm">
                        <h3 className="text-muted-foreground">{dayItsOn.toLocaleString(DateTime.DATE_HUGE)}</h3>
                        <h3 className="text-muted-foreground">
                            {event.interval.start.toLocaleString(DateTime.TIME_SIMPLE)} -{" "}
                            {event.interval.end.toLocaleString(DateTime.TIME_SIMPLE)}
                        </h3>
                    </div>
                )}

                <hr className="my-3"></hr>

                {
                    // Calendar
                }

                <div className="flex flex-row justify-between">
                    <Label className="my-auto">Calendar</Label>
                    <DropdownMenu>
                        <DropdownMenuTrigger className="text-sm flex flex-row text-muted-foreground">
                            <div
                                style={{ backgroundColor: myCalendar.color }}
                                className="w-3 h-3 rounded-full my-auto"
                            ></div>
                            <h3 className="text-ellipsis px-2 overflow-hidden">{myCalendar.name}</h3>
                            <FontAwesomeIcon icon={faCaretDown} className="my-auto" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {calendars.map((calendar) => {
                                return (
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setMyCalendar(calendar);
                                            updateEvent.mutate({ calendarId: calendar.id });
                                        }}
                                        key={calendar.id}
                                        className="flex flex-row"
                                    >
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

                {
                    // Repeat Type
                }

                {editing && (
                    <div className="flex flex-row justify-between">
                        <Label className=" my-auto">Repeat Type</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="text-sm flex flex-row text-muted-foreground">
                                <h3 className="text-ellipsis px-2 overflow-hidden">{capitalize(repeatType)}</h3>
                                <FontAwesomeIcon icon={faCaretDown} className="my-auto" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setRepeatType("none");
                                        setRecurringEndDay;
                                        updateEvent.mutate({ repeatType: "none", recurringEndDay: null });
                                    }}
                                    className="flex flex-row"
                                >
                                    None
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setRepeatType("daily");
                                        setRecurringEndDay;
                                        updateEvent.mutate({ repeatType: "daily", recurringEndDay: null });
                                    }}
                                    className="flex flex-row"
                                >
                                    Daily
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setRepeatType("weekly");
                                        setRecurringEndDay;
                                        updateEvent.mutate({ repeatType: "weekly", recurringEndDay: null });
                                    }}
                                    className="flex flex-row"
                                >
                                    Weekly
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setRepeatType("monthly");
                                        setRecurringEndDay;
                                        updateEvent.mutate({ repeatType: "monthly", recurringEndDay: null });
                                    }}
                                    className="flex flex-row"
                                >
                                    Monthly
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setRepeatType("yearly");
                                        setRecurringEndDay;
                                        updateEvent.mutate({ repeatType: "yearly", recurringEndDay: null });
                                    }}
                                    className="flex flex-row"
                                >
                                    Yearly
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}

                {!editing && (
                    <div className="flex flex-row justify-between">
                        <Label className=" my-auto">Repeat Type</Label>
                        <h3 className="text-sm text-muted-foreground">{capitalize(event.repeatType)}</h3>
                    </div>
                )}

                <hr className="my-3"></hr>

                {
                    // Recurring End Date
                }

                {editing && repeatType != "none" && (
                    <>
                        <div className="flex flex-row">
                            <Label className="my-auto">Recurring End Date</Label>
                            <div className="flex flex-row w-full">
                                <DatePicker
                                    date={recurringEndDay}
                                    setDate={(newDate) => {
                                        if (!newDate) {
                                            return;
                                        }
                                        updateEvent.mutate({
                                            recurringEndDay: DateTime.fromJSDate(newDate).set({
                                                hour: event.interval.start.hour,
                                                minute: event.interval.start.minute,
                                                second: event.interval.start.second,
                                                millisecond: event.interval.start.millisecond,
                                            }) as DateTime<true>,
                                        });
                                        setRecurringEndDay(newDate);
                                    }}
                                />
                                <Button
                                    onClick={() => {
                                        setRecurringEndDay(undefined);
                                        updateEvent.mutate({ recurringEndDay: null });
                                    }}
                                    variant={"link"}
                                    className=" my-auto"
                                >
                                    X
                                </Button>
                            </div>
                        </div>{" "}
                        <hr className="my-3"></hr>
                    </>
                )}

                {!editing && repeatType != "none" && (
                    <>
                        <div className="flex flex-row text-sm justify-between">
                            <Label className="my-auto">Recurring End Date</Label>
                            <h3 className="text-muted-foreground">
                                {event.recurringEndDay
                                    ? event.recurringEndDay.toLocaleString(DateTime.DATE_HUGE)
                                    : "Forever"}
                            </h3>
                        </div>
                        <hr className="my-3"></hr>
                    </>
                )}

                {
                    // TODO, days of week, all day toggle, start time, end time
                }

                {
                    // Delete Event
                }

                <Button
                    variant="destructive"
                    onClick={() => {
                        if (event.repeatType === "none") {
                            deleteEvent.mutate({});
                        } else {
                            setDeleteAlertOpen(true);
                        }
                        // TODO bubble burst animation would be cool
                    }}
                    className="w-full"
                >
                    Delete Event
                </Button>
            </PopoverContent>
            <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete all instances of event or just this one?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            onClick={() => {
                                deleteEvent.mutate({ date: dayItsOn });
                                setDeleteAlertOpen(false);
                            }}
                            className="bg-red-500 hover:bg-red-800 transition-all duration-300"
                        >
                            Delete Only This Instance
                        </AlertDialogAction>
                        <AlertDialogAction
                            onClick={() => {
                                deleteEvent.mutate({});
                                setDeleteAlertOpen(false);
                            }}
                            className="bg-red-500 hover:bg-red-800 transition-all duration-300"
                        >
                            Delete All Instances
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
