import { DateTime, Interval } from "luxon";
import React, { use, useContext, useEffect, useState } from "react";
import { useToday } from "~/hooks/useToday";

import { DayBeingViewedContext, EnabledCalendarIdsContext } from "~/hooks/contexts";
import { cn, hexToRgb } from "~/lib/utils";
import { CalendarEvent } from "~/lib/types";
import { useQuery } from "react-query";
import useGetEvents from "~/hooks/useGetEvents";
import Color from "color";
import { AllDayEvent, Event } from "./event";

export default function WeekView() {
    const today = useToday();
    const { value: dayBeingViewed, setValue: setDayBeingViewed } = useContext(DayBeingViewedContext);

    const startOfWeek = dayBeingViewed.startOf("week").minus({ day: 1 });
    const days = Array.from({ length: 7 }, (_, i) => startOfWeek.plus({ day: i }));

    const fifteenMinChunks = Array.from({ length: 96 }, (_, i) => startOfWeek.plus({ minutes: i * 15 }));

    return (
        <div className="flex flex-col">
            <section className="sticky top-16 z-10 flex w-full flex-row">
                <div className={`flex w-24 items-end bg-background text-center text-muted-foreground`}>
                    <h2 className="my-auto mr-4 w-full text-right">All Day</h2>
                </div>
                <div className="grid w-full grid-cols-7 bg-background pt-1 ">
                    {days.map((day, i) => {
                        return <DayHeader key={i} i={i} day={day} />;
                    })}
                </div>
            </section>
            <section className="flex flex-row">
                <div className="grid-rows-96 grid">
                    {fifteenMinChunks.map((time, i) => {
                        if (time.minute == 0 && time.hour != 0) {
                            return (
                                <div className={`relative h-6 w-24 justify-end text-muted-foreground`} key={i}>
                                    <h2 className="absolute right-4 top-[-12px]">
                                        {time.toLocaleString(DateTime.TIME_SIMPLE)}
                                    </h2>
                                </div>
                            );
                        }
                        return <div className={`h-6 w-24 justify-end text-muted-foreground`} key={i}></div>;
                    })}
                </div>
                <div className="flex w-full flex-col">
                    <div className="grid grid-cols-7">
                        {days.map((day, i) => (
                            <DaysHours day={day} key={day.toISO()} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

function DayHeader({ i, day }: { i: number; day: DateTime<true> }) {
    const today = useToday();
    const dayNumber = day.day;
    const { value: dayBeingViewed } = useContext(DayBeingViewedContext);
    const currentMonth = dayBeingViewed.month == day.month;
    const dayIsSaturday = day.weekday === 6;
    const isToday = day.hasSame(today, "day");
    const { value: enabledCalendarIds } = useContext(EnabledCalendarIdsContext);
    const { data: events, isLoading } = useGetEvents(day);
    const [allDayEvents, setAllDayEvents] = useState<CalendarEvent[]>([]);

    useEffect(() => {
        if (events) {
            setAllDayEvents(
                events.filter((event) => enabledCalendarIds.includes(event.calendar.id)).filter((event) => event.allDay)
            );
        }
    }, [events, enabledCalendarIds]);

    return (
        <div key={i} className="flex flex-col">
            <div className="mb-2 flex flex-grow flex-row gap-3">
                <h2 className="text-center text-2xl">{day.day}</h2>
                <h2 className="my-auto text-center text-xl text-muted-foreground">{day.weekdayLong}</h2>
            </div>
            <div style={{ gridTemplateColumns: "1fr auto" }} className="h-16  grid grid-cols-2 grid-rows-2">
                {allDayEvents.map((event) => (
                    <AllDayEvent key={event.id} event={event} />
                ))}
            </div>
        </div>
    );
}

function DaysHours({ day, bottomRow = false }: { day: DateTime<true>; bottomRow?: boolean }) {
    const today = useToday();
    const dayNumber = day.day;
    const { value: dayBeingViewed } = useContext(DayBeingViewedContext);
    const currentMonth = dayBeingViewed.month == day.month;
    const dayIsSaturday = day.weekday === 6;
    const isToday = day.hasSame(today, "day");
    const { value: enabledCalendarIds } = useContext(EnabledCalendarIdsContext);
    const { data: events, isLoading } = useGetEvents(day);
    const [myEvents, setMyEvents] = useState<CalendarEvent[]>([]);

    useEffect(() => {
        if (events) {
            setMyEvents(
                events
                    .filter((event) => enabledCalendarIds.includes(event.calendar.id))
                    .filter((event) => !event.allDay)
            );
        }
    }, [events, enabledCalendarIds]);

    if (!events && isLoading) {
        return (
            <div
                className={`relative ${dayIsSaturday && "border-r-4"} ${bottomRow && "border-b-4"} ${
                    currentMonth ? "text-primary" : "font-bold text-muted"
                } ${isToday && "bg-blue-800 bg-opacity-50"}`}
            >
                {Array.from({ length: 96 }, (_, i) => {
                    return <FifteenMinBlock key={i} i={i} />;
                })}
            </div>
        );
    }

    return (
        <div
            className={`relative ${dayIsSaturday && "border-r-4"} ${bottomRow && "border-b-4"} ${
                currentMonth ? "text-primary" : "font-bold text-muted"
            } ${isToday && "bg-blue-800 bg-opacity-50"}`}
        >
            {Array.from({ length: 96 }, (_, i) => {
                const interval = Interval.fromDateTimes(
                    day.startOf("day").plus({ minutes: i * 15 }),
                    day.startOf("day").plus({ minutes: (i + 1) * 15 })
                );
                return <FifteenMinBlock key={i} i={i} />;
            })}
            {myEvents &&
                myEvents.map((event, i) => {
                    return <Event key={i} event={event} allEvents={myEvents} />;
                })}
        </div>
    );
}

function FifteenMinBlock({ i }: { i: number }) {
    return (
        <div
            className={cn(
                "h-6 text-muted-foreground",
                i % 4 == 0 ? "border-t-4" : i % 2 == 0 ? "border-t-2" : "border-t-1" // remove this to turn off the 15 minute lines
            )}
            key={i}
        ></div>
    );
}
