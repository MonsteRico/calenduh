import { DateTime, Interval } from "luxon";
import React, { use, useContext, useEffect, useState } from "react";
import { useToday } from "~/hooks/useToday";

import { DayBeingViewedContext } from "~/hooks/contexts";
import { cn, hexToRgb } from "~/lib/utils";
import { manyEvents as events } from "~/lib/testEvents";
import { CalendarEvent } from "~/lib/types";

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
                    <h2 className="mb-1 mr-4 w-full text-right">All Day</h2>
                </div>
                <div className="grid w-full grid-cols-7 bg-background pt-1 ">
                    {days.map((day, i) => {
                        return (
                            <div key={i} className="flex flex-col">
                                <div className="mb-2 flex flex-grow flex-row gap-3">
                                    <h2 className="text-center text-2xl">{day.day}</h2>
                                    <h2 className="my-auto text-center text-xl text-muted-foreground">
                                        {day.weekdayLong}
                                    </h2>
                                </div>
                                <div className="h-8">
                                    <h4 className="py-2 text-center text-sm">An All-Day Event</h4>
                                </div>
                            </div>
                        );
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

function DaysHours({ day, bottomRow = false }: { day: DateTime<true>; bottomRow?: boolean }) {
    const today = useToday();
    const dayNumber = day.day;
    const { value: dayBeingViewed } = useContext(DayBeingViewedContext);
    const currentMonth = dayBeingViewed.month == day.month;
    const dayIsSaturday = day.weekday === 6;
    const isToday = day.hasSame(today, "day");

    const myEvents = events.filter((event) => {
        return event.interval.overlaps(Interval.fromDateTimes(day.startOf("day"), day.endOf("day")));
    });
    // sort myEvents by start time
    myEvents.sort((a, b) => {
        if (!a.interval.start || !b.interval.start) {
            return 0;
        }
        return a.interval.start.toMillis() - b.interval.start.toMillis();
    });

    // update numConflicts for each event
    myEvents.forEach((event, i) => {
        let numConflicts = 0;
        myEvents.forEach((otherEvent, j) => {
            if (i === j) {
                return;
            }
            if (event.interval.overlaps(otherEvent.interval)) {
                numConflicts++;
            }
        });
        event.numConflicts = numConflicts;
    });

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
                return <FifteenMinBlock key={i} i={i} interval={interval} />;
            })}
            {myEvents.map((event, i) => {
                return <Event key={i} event={event} allEvents={myEvents} />;
            })}
        </div>
    );
}

function Event({ event, allEvents }: { event: CalendarEvent; allEvents: CalendarEvent[] }) {
    const today = useToday();

    if (!event.interval.start || !event.interval.end) {
        return null;
    }
    const eventDay = event.interval.start.startOf("day");
    const eventIsToday = eventDay.hasSame(today, "day");

    const rgb = hexToRgb(event.color);

    const currentEventIndex = allEvents.findIndex((e) => e.id === event.id);

    const top = (event.interval.start.diff(eventDay.startOf("day")).as("minutes") / 15) * 1.5;
    const height = (event.interval.end.diff(event.interval.start).as("minutes") / 15) * 1.5;

    // Step 1: Filter allEvents to only include events that overlap with the current event
    const overlappingEvents = allEvents.filter((e) => e.interval.overlaps(event.interval));

    // include into overlappingEvents any events that overlap with events in overlappingEvents. Don't include duplicates
    overlappingEvents.forEach((overlappingEvent, i) => {
        const otherOverlappingEvents = allEvents.filter((e) => e.interval.overlaps(overlappingEvent.interval));
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

    // Step 3: Find the index of the current event in the sorted array of overlapping events
    const currentEventIndexAmongConflicts = overlappingEvents.findIndex((e) => e.id === event.id);

    // set numConflictsForWidth to the maximum number of conflicts among all overlapping events
    const numConflictsForWidth = overlappingEvents.reduce((acc, e) => {
        return Math.max(acc, e.numConflicts);
    }, 0);

    // Now you can use currentEventIndexAmongConflicts to calculate the left property
    const left = (currentEventIndexAmongConflicts / overlappingEvents.length) * 100;
    const width = (1 / (numConflictsForWidth + 1)) * 100;

    const backgroundColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${eventIsToday ? 0.75 : 0.5})` : event.color;
    return (
        <div
            className="absolute w-full bg-red-500 bg-opacity-50 overflow-hidden"
            style={{
                top: `${top}rem`,
                height: `${height}rem`,
                width: `${width}%`,
                left: `${left}%`,
                backgroundColor,
                borderLeft: `6px solid ${event.color}`,
            }}
        >
            <h4 className="text-center text-sm break-all">{event.name}</h4>
        </div>
    );
}

function FifteenMinBlock({ interval, i }: { interval: Interval; i: number }) {
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
