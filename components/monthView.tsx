import { DateTime } from "luxon";
import React, { useContext, useEffect, useState } from "react";
import { useToday } from "~/hooks/useToday";

import { DayBeingViewedContext, EnabledCalendarIdsContext } from "~/hooks/contexts";
import useGetEvents from "~/hooks/useGetEvents";
import { CalendarEvent } from "~/lib/types";
import { cn } from "~/lib/utils";
import { useQueries, useQuery } from "react-query";
import { dbCalendarEvent } from "~/lib/schema";
import { useGetMonthsEvents } from "~/hooks/useGetMonthsEvents";
import { MonthEvent } from "./event";

export default function MonthView() {
    const today = useToday();
    const { value: dayBeingViewed, setValue: setDayBeingViewed } = useContext(DayBeingViewedContext);

    const daysBeforeFirst = dayBeingViewed.set({ day: 1 }).weekday;
    const daysAfterLast = 13 - dayBeingViewed.set({ day: dayBeingViewed.daysInMonth }).weekday;
    const daysInPreviousMonth = dayBeingViewed.minus({ month: 1 }).daysInMonth;
    const daysInNextMonth = dayBeingViewed.plus({ month: 1 }).daysInMonth;

    // make an array of all the days shown in the current view
    const days = Array.from({ length: daysInPreviousMonth }, (_, i) =>
        dayBeingViewed
            .minus({ month: 1 })
            .startOf("day")
            .set({ day: i + 1 })
    )
        .slice(-daysBeforeFirst)
        .concat(
            Array.from({ length: dayBeingViewed.daysInMonth }, (_, i) =>
                dayBeingViewed.startOf("day").set({ day: i + 1 })
            )
        )
        .concat(
            Array.from({ length: daysInNextMonth }, (_, i) =>
                dayBeingViewed
                    .plus({ month: 1 })
                    .startOf("day")
                    .set({ day: i + 1 })
            ).slice(0, daysAfterLast)
        )
        .slice(0, 42);

    return (
        <section className="flex flex-col">
            <div className="mb-2 grid grid-cols-7 text-center text-xl">
                <h2 className="">Sunday</h2>
                <h2 className="">Monday</h2>
                <h2 className="">Tuesday</h2>
                <h2 className="">Wednesday</h2>
                <h2 className="">Thursday</h2>
                <h2 className="">Friday</h2>
                <h2 className="">Saturday</h2>
            </div>
            <div className="grid grid-cols-7 grid-rows-6">
                {days.map((day, i) => (
                    <Day bottomRow={Math.floor(i / 7) == 5} day={day} key={day.toISO()} />
                ))}
            </div>
        </section>
    );
}

function Day({ day, bottomRow = false }: { day: DateTime<true>; bottomRow?: boolean }) {
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
        console.log("setting my events with", enabledCalendarIds);
        if (events) {
            setMyEvents(events.filter((event) => enabledCalendarIds.includes(event.calendar.id)));
        }
    }, [events, enabledCalendarIds]);
    return (
        <div
            className={cn(
                "relative h-32 border-l-4 border-t-4 border-primary-foreground text-2xl",
                dayIsSaturday && "border-r-4",
                bottomRow && "border-b-4",
                isToday && "text-blue-800"
            )}
        >
            <h2
                className={cn(
                    "absolute left-4 top-2",
                    currentMonth ? "font-bold text-primary" : "text-muted-foreground"
                )}
            >
                {dayNumber}
            </h2>
            <div className="flex flex-col mt-8 p-2">
                {myEvents && myEvents.slice(0, 3).map((event) => <MonthEvent key={event.id} event={event} />)}
                {myEvents && myEvents.length > 3 && (
                    <h2 className="text-xs text-secondary">{myEvents.length - 3} more events...</h2>
                )}
            </div>
        </div>
    );
}
