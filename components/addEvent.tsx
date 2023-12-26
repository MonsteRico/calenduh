import { DateTime, Interval } from "luxon";
import React, { use, useContext, useEffect, useMemo, useState } from "react";
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
import { toast, useToast } from "./ui/use-toast";
import useCreateEvent from "~/hooks/useCreateEvent";
import TimePicker from "react-time-picker";
import { start } from "repl";

const genericEvent = {
    id: -1,
    title: "New Event",
    interval: Interval.fromDateTimes(
        DateTime.local().set({ hour: DateTime.now().hour, minute: 0 }),
        DateTime.local().set({ hour: DateTime.now().hour, minute: 0 }).plus({ hour: 1 })
    ) as Interval<true>,
    allDay: false,
    calendar: {
        id: -1,
        name: "",
        color: "",
    },
    repeatType: "none" as "none" | "daily" | "weekly" | "monthly" | "yearly",
    recurringEndDay: undefined,
    daysOfWeek: "",
    calendarId: -1,
    numConflicts: 0,
};

export default function CreateEvent({
    defaultEvent = genericEvent,
    popoverOpen,
    day,
    onCreated,
}: {
    defaultEvent?: CalendarEvent;
    popoverOpen: boolean;
    day?: DateTime;
    onCreated?: () => void;
}) {
    const today = useToday();

    const { data: calendars } = useGetCalendars();
    const createEvent = useCreateEvent();
    const [title, setTitle] = useState(defaultEvent.title);
    const [eventDate, setEventDate] = useState<Date | undefined>(day?.toJSDate() ?? today.toJSDate());
    const [myCalendar, setMyCalendar] = useState(defaultEvent.calendar);
    const [repeatType, setRepeatType] = useState(defaultEvent.repeatType);
    const [recurringEndDay, setRecurringEndDay] = useState<Date | undefined>(
        defaultEvent.recurringEndDay ? defaultEvent.recurringEndDay.toJSDate() : undefined
    );
    const [daysOfWeekString, setDaysOfWeekString] = useState(defaultEvent.daysOfWeek);
    const [allDay, setAllDay] = useState(defaultEvent.allDay);
    const [startTimeString, setStartTimeString] = useState(
        defaultEvent.interval.start.toLocaleString(DateTime.TIME_24_SIMPLE)
    );
    const [endTimeString, setEndTimeString] = useState(
        defaultEvent.interval.end.toLocaleString(DateTime.TIME_24_SIMPLE)
    );
    const [startTime, setStartTime] = useState(defaultEvent.interval.start);
    const [endTime, setEndTime] = useState(defaultEvent.interval.end);

    useEffect(() => {
        setStartTimeString(startTime.toLocaleString(DateTime.TIME_24_SIMPLE));
        setEndTimeString(endTime.toLocaleString(DateTime.TIME_24_SIMPLE));
    }, [startTime, endTime]);

    useEffect(() => {
        if (!popoverOpen) {
            setTitle(defaultEvent.title);
            setEventDate(day?.toJSDate() ?? defaultEvent.interval.start.toJSDate());
            setMyCalendar(defaultEvent.calendar);
            setRepeatType(defaultEvent.repeatType);
            setRecurringEndDay(defaultEvent.recurringEndDay?.toJSDate());
            setDaysOfWeekString(defaultEvent.daysOfWeek);
            setAllDay(defaultEvent.allDay);
            setStartTime(defaultEvent.interval.start);
            setEndTime(defaultEvent.interval.end);
            setStartTimeString(defaultEvent.interval.start.toLocaleString(DateTime.TIME_24_SIMPLE));
            setEndTimeString(defaultEvent.interval.end.toLocaleString(DateTime.TIME_24_SIMPLE));
        }
    }, [popoverOpen, defaultEvent]);

    if (!defaultEvent.interval.start || !defaultEvent.interval.end || !calendars) {
        return null;
    }

    return (
        <>
            <PopoverContent>
                {
                    // Title
                }
                <div className="flex flex-row justify-between">
                    <input
                        className="text-xl w-full font-bold text-primary my-auto bg-transparent border-b-2 border-primary outline-none"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <hr className="my-3" />
                {
                    // Event Date
                }
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

                <hr className="my-3" />
                {
                    // Start Time
                }
                {!allDay && (
                    <>
                        <div className="flex flex-row justify-between">
                            <Label className="my-auto">Start Time</Label>
                            <TimePicker
                                className="w-full"
                                onChange={(e) => {
                                    const time = e as string;
                                    setStartTimeString(time);
                                    setStartTime(
                                        startTime.set({
                                            hour: parseInt(time.split(":")[0]),
                                            minute: parseInt(time.split(":")[1]),
                                        })
                                    );
                                }}
                                onInvalidChange={() => {
                                    toast({
                                        title: "Invalid time",
                                        description: "Please enter a valid time",
                                        variant: "destructive",
                                    });
                                }}
                                value={startTimeString + ":00"}
                            />
                        </div>
                        <hr className="my-3" />
                    </>
                )}

                {
                    // End Time
                }
                {!allDay && (
                    <>
                        <div className="flex flex-row justify-between">
                            <Label className="my-auto">End Time</Label>
                            <TimePicker
                                className="w-full"
                                onChange={(e) => {
                                    let time = e as string;
                                    if (time == "00:00") {
                                        time = "24:00";
                                    }
                                    setEndTimeString(time);
                                    setEndTime(
                                        endTime.set({
                                            hour: parseInt(time.split(":")[0]),
                                            minute: parseInt(time.split(":")[1]),
                                        })
                                    );
                                }}
                                onInvalidChange={() => {
                                    toast({
                                        title: "Invalid time",
                                        description: "Please enter a valid time",
                                        variant: "destructive",
                                    });
                                }}
                                value={endTimeString + ":00"}
                            />
                        </div>
                        <hr className="my-3" />
                    </>
                )}

                {
                    // All Day Toggle
                }

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

                <hr className="my-3" />
                {
                    // Recurring End Date
                }

                {repeatType != "none" && (
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
                        </div>
                        <hr className="my-3" />
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
                                        const daysOfWeek = daysOfWeekString.split(",");
                                        if (daysOfWeek.includes("7")) {
                                            daysOfWeek.splice(daysOfWeek.indexOf("7"), 1);
                                        } else {
                                            daysOfWeek.push("7");
                                        }
                                        setDaysOfWeekString(daysOfWeek.join(","));
                                    }}
                                    className={cn(
                                        "w-8 h-7 rounded-full mr-2 text-center my-auto bg-slate-800 border border-blue-500 cursor-pointer hover:bg-opacity-75",
                                        daysOfWeekString.split(",").includes("7") && "bg-blue-500"
                                    )}
                                >
                                    S
                                </div>
                                <div
                                    onClick={() => {
                                        const daysOfWeek = daysOfWeekString.split(",");
                                        if (daysOfWeek.includes("1")) {
                                            daysOfWeek.splice(daysOfWeek.indexOf("1"), 1);
                                        } else {
                                            daysOfWeek.push("1");
                                        }
                                        setDaysOfWeekString(daysOfWeek.join(","));
                                    }}
                                    className={cn(
                                        "w-8 h-7 rounded-full mr-2 text-center my-auto bg-slate-800 border border-blue-500 cursor-pointer hover:bg-opacity-75",
                                        daysOfWeekString.split(",").includes("1") && "bg-blue-500"
                                    )}
                                >
                                    M
                                </div>
                                <div
                                    onClick={() => {
                                        const daysOfWeek = daysOfWeekString.split(",");
                                        if (daysOfWeek.includes("2")) {
                                            daysOfWeek.splice(daysOfWeek.indexOf("2"), 1);
                                        } else {
                                            daysOfWeek.push("2");
                                        }
                                        setDaysOfWeekString(daysOfWeek.join(","));
                                    }}
                                    className={cn(
                                        "w-8 h-7 rounded-full mr-2 text-center my-auto bg-slate-800 border border-blue-500 cursor-pointer hover:bg-opacity-75",
                                        daysOfWeekString.split(",").includes("2") && "bg-blue-500"
                                    )}
                                >
                                    T
                                </div>
                                <div
                                    onClick={() => {
                                        const daysOfWeek = daysOfWeekString.split(",");
                                        if (daysOfWeek.includes("3")) {
                                            daysOfWeek.splice(daysOfWeek.indexOf("3"), 1);
                                        } else {
                                            daysOfWeek.push("3");
                                        }
                                        setDaysOfWeekString(daysOfWeek.join(","));
                                    }}
                                    className={cn(
                                        "w-8 h-7 rounded-full mr-2 text-center my-auto bg-slate-800 border border-blue-500 cursor-pointer hover:bg-opacity-75",
                                        daysOfWeekString.split(",").includes("3") && "bg-blue-500"
                                    )}
                                >
                                    W
                                </div>
                                <div
                                    onClick={() => {
                                        const daysOfWeek = daysOfWeekString.split(",");
                                        if (daysOfWeek.includes("4")) {
                                            daysOfWeek.splice(daysOfWeek.indexOf("4"), 1);
                                        } else {
                                            daysOfWeek.push("4");
                                        }
                                        setDaysOfWeekString(daysOfWeek.join(","));
                                    }}
                                    className={cn(
                                        "w-8 h-7 rounded-full mr-2 text-center my-auto bg-slate-800 border border-blue-500 cursor-pointer hover:bg-opacity-75",
                                        daysOfWeekString.split(",").includes("4") && "bg-blue-500"
                                    )}
                                >
                                    R
                                </div>
                                <div
                                    onClick={() => {
                                        const daysOfWeek = daysOfWeekString.split(",");
                                        if (daysOfWeek.includes("5")) {
                                            daysOfWeek.splice(daysOfWeek.indexOf("5"), 1);
                                        } else {
                                            daysOfWeek.push("5");
                                        }
                                        setDaysOfWeekString(daysOfWeek.join(","));
                                    }}
                                    className={cn(
                                        "w-8 h-7 rounded-full mr-2 text-center my-auto bg-slate-800 border border-blue-500 cursor-pointer hover:bg-opacity-75",
                                        daysOfWeekString.split(",").includes("5") && "bg-blue-500"
                                    )}
                                >
                                    F
                                </div>
                                <div
                                    onClick={() => {
                                        const daysOfWeek = daysOfWeekString.split(",");
                                        if (daysOfWeek.includes("6")) {
                                            daysOfWeek.splice(daysOfWeek.indexOf("6"), 1);
                                        } else {
                                            daysOfWeek.push("6");
                                        }
                                        setDaysOfWeekString(daysOfWeek.join(","));
                                    }}
                                    className={cn(
                                        "w-8 h-7 rounded-full mr-2 text-center my-auto bg-slate-800 border border-blue-500 cursor-pointer hover:bg-opacity-75",
                                        daysOfWeekString.split(",").includes("6") && "bg-blue-500"
                                    )}
                                >
                                    S
                                </div>
                            </div>
                        </div>
                        <hr className="my-3" />
                    </>
                )}

                {
                    // Create Event
                }

                <Button
                    onClick={() => {
                        if (!eventDate) {
                            toast({
                                variant: "destructive",
                                title: "Error",
                                description: "Please select an event date",
                            });
                            return;
                        }

                        if (!startTime || !endTime) {
                            toast({
                                variant: "destructive",
                                title: "Error",
                                description: "Please select start and end times",
                            });
                            return;
                        }

                        if (startTime > endTime) {
                            toast({
                                variant: "destructive",
                                title: "Error",
                                description: "Start time must be before end time",
                            });
                            return;
                        }

                        if (repeatType == "weekly" && daysOfWeekString == "") {
                            toast({
                                variant: "destructive",
                                title: "Error",
                                description: "Please select at least one day of the week",
                            });
                            return;
                        }

                        if (myCalendar == defaultEvent.calendar) {
                            toast({
                                variant: "destructive",
                                title: "Error",
                                description: "Please select a calendar",
                            });
                            return;
                        }

                        createEvent.mutate({
                            title,
                            allDay,
                            calendarId: myCalendar.id,
                            repeatType,
                            recurringEndDay: recurringEndDay
                                ? (DateTime.fromJSDate(recurringEndDay).set({
                                      hour: 23,
                                      minute: 59,
                                      second: 59,
                                  }) as DateTime<true>)
                                : null,
                            daysOfWeekString,
                            endTime,
                            eventDay: DateTime.fromJSDate(eventDate).set({
                                hour: 0,
                                minute: 0,
                                second: 0,
                            }) as DateTime<true>,
                            startTime,
                        });
                        onCreated?.();
                    }}
                    className="w-full"
                >
                    Create Event
                </Button>
            </PopoverContent>
        </>
    );
}
