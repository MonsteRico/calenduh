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
import { useToast } from "./ui/use-toast";
export default function ViewEvent({
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
    const [eventDate, setEventDate] = useState<Date | undefined>(dayItsOn.toJSDate());
    const [myCalendar, setMyCalendar] = useState(event.calendar);
    const [repeatType, setRepeatType] = useState(event.repeatType);
    const [recurringEndDay, setRecurringEndDay] = useState<Date | undefined>(
        event.recurringEndDay ? event.recurringEndDay.toJSDate() : undefined
    );
    const [daysOfWeekString, setDaysOfWeekString] = useState(event.daysOfWeek);
    const [allDay, setAllDay] = useState(event.allDay);
    const [startAmPm, setStartAmPm] = useState(event.interval.start.hour >= 12 ? "pm" : "am");
    const [endAmPm, setEndAmPm] = useState(event.interval.end.hour >= 12 ? "pm" : "am");
    const [startTime, setStartTime] = useState(event.interval.start);
    const [endTime, setEndTime] = useState(event.interval.end);

    const { toast } = useToast();

    const { data: thisEvent } = useGetEvent(event.id);

    useEffect(() => {
        if (thisEvent) {
            setTitle(thisEvent.title);
            setEventDate(thisEvent.interval.start.toJSDate());
            setMyCalendar(thisEvent.calendar);
            setRepeatType(thisEvent.repeatType);
            setRecurringEndDay(thisEvent.recurringEndDay?.toJSDate());
            setDaysOfWeekString(thisEvent.daysOfWeek);
            setAllDay(thisEvent.allDay);
        }
    }, [thisEvent]);

    useEffect(() => {
        if (!popoverOpen) {
            setEditing(false);
            if (thisEvent) {
                setTitle(thisEvent.title);
                setEventDate(thisEvent.interval.start.toJSDate());
                setMyCalendar(thisEvent.calendar);
                setRepeatType(thisEvent.repeatType);
                setRecurringEndDay(thisEvent.recurringEndDay?.toJSDate());
                setDaysOfWeekString(thisEvent.daysOfWeek);
                setAllDay(thisEvent.allDay);
            }
        }
    }, [popoverOpen, thisEvent]);

    if (!event.interval.start || !event.interval.end || !calendars || !thisEvent) {
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

                                if (!eventDate) {
                                    toast({
                                        title: "Event date is required",
                                        description: "Please select a date for your event",
                                        variant: "destructive",
                                    });
                                    return;
                                }

                                if (!startTime.isValid || !endTime.isValid) {
                                    toast({
                                        title: "Invalid time",
                                        description: "Please enter a valid time",
                                        variant: "destructive",
                                    });
                                    return;
                                }

                                updateEvent.mutate({
                                    title,
                                    calendarId: myCalendar.id,
                                    repeatType,
                                    recurringEndDay: recurringEndDay
                                        ? (DateTime.fromJSDate(recurringEndDay) as DateTime<true>)
                                        : null,
                                    daysOfWeekString,
                                    allDay,
                                    eventDay: DateTime.fromJSDate(eventDate) as DateTime<true>,
                                    endTime,
                                    startTime,
                                });
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
                <hr className="my-3" />
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
                                setEventDate(newDate);
                            }}
                        />
                    </div>
                )}

                {!editing && (
                    <div className="flex flex-col text-sm">
                        {!allDay && (
                            <>
                                <h3 className="text-muted-foreground">{dayItsOn.toLocaleString(DateTime.DATE_HUGE)}</h3>
                                <h3 className="text-muted-foreground">
                                    {startTime.toLocaleString(DateTime.TIME_SIMPLE)} -{" "}
                                    {endTime.toLocaleString(DateTime.TIME_SIMPLE)}
                                </h3>
                            </>
                        )}
                        {allDay && <h3 className="text-muted-foreground">All Day Event</h3>}
                    </div>
                )}
                <hr className="my-3" />
                {
                    // Start Time
                }
                {editing && !allDay && (
                    <>
                        <div className="flex flex-row justify-between">
                            <Label className="my-auto">Start Time</Label>
                            <div className="flex flex-row">
                                <input
                                    className="w-8 text-center rounded"
                                    type="text"
                                    maxLength={2}
                                    pattern={"[0-9]{2}"}
                                    value={startTime.hour % 12 < 10 ? `0${startTime.hour % 12}` : startTime.hour % 12}
                                    onChange={(e) => {
                                        setStartTime(
                                            startTime.set({
                                                hour: parseInt(e.target.value) + (startAmPm === "pm" ? 12 : 0),
                                            })
                                        );
                                    }}
                                />
                                <span className="my-auto mx-2">:</span>
                                <input
                                    className="w-8 text-center rounded"
                                    type="text"
                                    maxLength={2}
                                    pattern={"[0-9]{2}"}
                                    value={startTime.minute < 10 ? `0${startTime.minute}` : startTime.minute}
                                    onChange={(e) => {
                                        setStartTime(startTime.set({ minute: parseInt(e.target.value) }));
                                    }}
                                />
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="text-sm flex flex-row text-muted-foreground">
                                        <h3 className="text-ellipsis px-2 overflow-hidden my-auto">
                                            {startAmPm.toUpperCase()}
                                        </h3>
                                        <FontAwesomeIcon icon={faCaretDown} className="my-auto" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setStartAmPm("am");
                                            }}
                                            className="flex flex-row"
                                        >
                                            AM
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setStartAmPm("pm");
                                            }}
                                            className="flex flex-row"
                                        >
                                            PM
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <hr className="my-3" />
                    </>
                )}

                {
                    // End Time
                }
                {editing && !allDay && (
                    <>
                        <div className="flex flex-row justify-between">
                            <Label className="my-auto">End Time</Label>
                            <div className="flex flex-row">
                                <input
                                    className="w-8 text-center rounded"
                                    type="text"
                                    maxLength={2}
                                    pattern={"[0-9]{2}"}
                                    value={endTime.hour % 12 < 10 ? `0${endTime.hour % 12}` : endTime.hour % 12}
                                    onChange={(e) => {
                                        setEndTime(
                                            endTime.set({
                                                hour: parseInt(e.target.value) + (endAmPm === "pm" ? 12 : 0),
                                            })
                                        );
                                    }}
                                />
                                <span className="my-auto mx-2">:</span>
                                <input
                                    className="w-8 text-center rounded"
                                    type="text"
                                    maxLength={2}
                                    pattern={"[0-9]{2}"}
                                    value={endTime.minute < 10 ? `0${endTime.minute}` : endTime.minute}
                                    onChange={(e) => {
                                        setEndTime(endTime.set({ minute: parseInt(e.target.value) }));
                                    }}
                                />
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="text-sm flex flex-row text-muted-foreground">
                                        <h3 className="text-ellipsis px-2 overflow-hidden my-auto">
                                            {endAmPm.toUpperCase()}
                                        </h3>
                                        <FontAwesomeIcon icon={faCaretDown} className="my-auto" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setEndAmPm("am");
                                            }}
                                            className="flex flex-row"
                                        >
                                            AM
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setEndAmPm("pm");
                                            }}
                                            className="flex flex-row"
                                        >
                                            PM
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <hr className="my-3" />
                    </>
                )}

                {
                    // All Day Toggle
                }
                {editing && (
                    <>
                        <div className="flex flex-row justify-between">
                            <Label className="my-auto">All Day Event</Label>
                            <Switch
                                checked={allDay}
                                onCheckedChange={() => {
                                    setAllDay(!allDay);
                                }}
                            />
                        </div>
                        <hr className="my-3" />
                    </>
                )}

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
                                            if (!editing) {
                                                updateEvent.mutate({
                                                    calendarId: calendar.id,
                                                });
                                            }
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
                <hr className="my-3" />
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
                                        setRecurringEndDay(undefined);
                                    }}
                                    className="flex flex-row"
                                >
                                    None
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setRepeatType("daily");
                                        setRecurringEndDay(undefined);
                                    }}
                                    className="flex flex-row"
                                >
                                    Daily
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setRepeatType("weekly");
                                        setRecurringEndDay(undefined);
                                    }}
                                    className="flex flex-row"
                                >
                                    Weekly
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setRepeatType("monthly");
                                        setRecurringEndDay(undefined);
                                    }}
                                    className="flex flex-row"
                                >
                                    Monthly
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setRepeatType("yearly");
                                        setRecurringEndDay(undefined);
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
                <hr className="my-3" />
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
                                        setRecurringEndDay(newDate);
                                    }}
                                />
                                <Button
                                    onClick={() => {
                                        setRecurringEndDay(undefined);
                                    }}
                                    variant={"link"}
                                    className=" my-auto"
                                >
                                    X
                                </Button>
                            </div>
                        </div><hr className="my-3" />
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
                        </div><hr className="my-3" />
                    </>
                )}

                {
                    // Days of Week
                }

                {repeatType == "weekly" && (
                    <>
                        <div>
                            <Label className="my-auto">Days of Week</Label>
                            <div className="flex flex-row my-3">
                                <div
                                    onClick={() => {
                                        if (!editing) {
                                            return;
                                        }
                                        const daysOfWeek = daysOfWeekString.split(",");
                                        if (daysOfWeek.includes("7")) {
                                            daysOfWeek.splice(daysOfWeek.indexOf("7"), 1);
                                        } else {
                                            daysOfWeek.push("7");
                                        }
                                        setDaysOfWeekString(daysOfWeek.join(","));
                                    }}
                                    className={cn(
                                        "w-8 h- rounded-full mr-2 cursor-default text-center my-auto bg-slate-800 border border-blue-500",
                                        editing && "cursor-pointer hover:bg-opacity-75",
                                        daysOfWeekString.split(",").includes("7") && "bg-blue-500"
                                    )}
                                >
                                    S
                                </div>
                                <div
                                    onClick={() => {
                                        if (!editing) {
                                            return;
                                        }
                                        const daysOfWeek = daysOfWeekString.split(",");
                                        if (daysOfWeek.includes("1")) {
                                            daysOfWeek.splice(daysOfWeek.indexOf("1"), 1);
                                        } else {
                                            daysOfWeek.push("1");
                                        }
                                        setDaysOfWeekString(daysOfWeek.join(","));
                                    }}
                                    className={cn(
                                        "w-8 h-7 rounded-full mr-2 cursor-default text-center my-auto bg-slate-800 border border-blue-500",
                                        editing && "cursor-pointer hover:bg-opacity-75",
                                        daysOfWeekString.split(",").includes("1") && "bg-blue-500"
                                    )}
                                >
                                    M
                                </div>
                                <div
                                    onClick={() => {
                                        if (!editing) {
                                            return;
                                        }
                                        const daysOfWeek = daysOfWeekString.split(",");
                                        if (daysOfWeek.includes("2")) {
                                            daysOfWeek.splice(daysOfWeek.indexOf("2"), 1);
                                        } else {
                                            daysOfWeek.push("2");
                                        }
                                        setDaysOfWeekString(daysOfWeek.join(","));
                                    }}
                                    className={cn(
                                        "w-8 h-7 rounded-full mr-2 cursor-default text-center my-auto bg-slate-800 border border-blue-500",
                                        editing && "cursor-pointer hover:bg-opacity-75",
                                        daysOfWeekString.split(",").includes("2") && "bg-blue-500"
                                    )}
                                >
                                    T
                                </div>
                                <div
                                    onClick={() => {
                                        if (!editing) {
                                            return;
                                        }
                                        const daysOfWeek = daysOfWeekString.split(",");
                                        if (daysOfWeek.includes("3")) {
                                            daysOfWeek.splice(daysOfWeek.indexOf("3"), 1);
                                        } else {
                                            daysOfWeek.push("3");
                                        }
                                        setDaysOfWeekString(daysOfWeek.join(","));
                                    }}
                                    className={cn(
                                        "w-8 h-7 rounded-full mr-2 cursor-default text-center my-auto bg-slate-800 border border-blue-500",
                                        editing && "cursor-pointer hover:bg-opacity-75",
                                        daysOfWeekString.split(",").includes("3") && "bg-blue-500"
                                    )}
                                >
                                    W
                                </div>
                                <div
                                    onClick={() => {
                                        if (!editing) {
                                            return;
                                        }
                                        const daysOfWeek = daysOfWeekString.split(",");
                                        if (daysOfWeek.includes("4")) {
                                            daysOfWeek.splice(daysOfWeek.indexOf("4"), 1);
                                        } else {
                                            daysOfWeek.push("4");
                                        }
                                        setDaysOfWeekString(daysOfWeek.join(","));
                                    }}
                                    className={cn(
                                        "w-8 h-7 rounded-full mr-2 cursor-default text-center my-auto bg-slate-800 border border-blue-500",
                                        editing && "cursor-pointer hover:bg-opacity-75",
                                        daysOfWeekString.split(",").includes("4") && "bg-blue-500"
                                    )}
                                >
                                    R
                                </div>
                                <div
                                    onClick={() => {
                                        if (!editing) {
                                            return;
                                        }
                                        const daysOfWeek = daysOfWeekString.split(",");
                                        if (daysOfWeek.includes("5")) {
                                            daysOfWeek.splice(daysOfWeek.indexOf("5"), 1);
                                        } else {
                                            daysOfWeek.push("5");
                                        }
                                        setDaysOfWeekString(daysOfWeek.join(","));
                                    }}
                                    className={cn(
                                        "w-8 h-7 rounded-full mr-2 cursor-default text-center my-auto bg-slate-800 border border-blue-500",
                                        editing && "cursor-pointer hover:bg-opacity-75",
                                        daysOfWeekString.split(",").includes("5") && "bg-blue-500"
                                    )}
                                >
                                    F
                                </div>
                                <div
                                    onClick={() => {
                                        if (!editing) {
                                            return;
                                        }
                                        const daysOfWeek = daysOfWeekString.split(",");
                                        if (daysOfWeek.includes("6")) {
                                            daysOfWeek.splice(daysOfWeek.indexOf("6"), 1);
                                        } else {
                                            daysOfWeek.push("6");
                                        }
                                        setDaysOfWeekString(daysOfWeek.join(","));
                                    }}
                                    className={cn(
                                        "w-8 h-7 rounded-full mr-2 cursor-default text-center my-auto bg-slate-800 border border-blue-500",
                                        editing && "cursor-pointer hover:bg-opacity-75",
                                        daysOfWeekString.split(",").includes("6") && "bg-blue-500"
                                    )}
                                >
                                    S
                                </div>
                            </div>
                        </div><hr className="my-3" />
                    </>
                )}

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
