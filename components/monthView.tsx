import type { DateTime } from "luxon";
import React, { useContext } from "react";
import { useToday } from "~/hooks/useToday";

import { DayBeingViewedContext } from "~/hooks/contexts";
import useGetEvents from "~/hooks/useGetEvents";
import { CalendarEvent } from "~/lib/types";

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
            .set({ day: i + 1 }),
    )
        .slice(-daysBeforeFirst)
        .concat(
            Array.from({ length: dayBeingViewed.daysInMonth }, (_, i) =>
                dayBeingViewed.startOf("day").set({ day: i + 1 }),
            ),
        )
        .concat(
            Array.from({ length: daysInNextMonth }, (_, i) =>
                dayBeingViewed
                    .plus({ month: 1 })
                    .startOf("day")
                    .set({ day: i + 1 }),
            ).slice(0, daysAfterLast),
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

    const {data:events} = useGetEvents(day, [1]);
    return (
        <div
            className={`relative h-32 border-l-4 border-t-4 border-primary-foreground text-3xl ${
                dayIsSaturday && "border-r-4"
            } ${bottomRow && "border-b-4"} ${currentMonth ? "font-bold text-primary" : "text-muted-foreground"} ${
                isToday && "bg-blue-800"
            }`}
        >
            <h2 className="absolute left-4 top-2">{dayNumber}</h2>
            <div className="flex flex-col">{events && events.map((event) => <MonthEvent key={event.id} event={event} />)}</div>
        </div>
    );
}

function MonthEvent({ event }: { event: CalendarEvent }) {
    return (
        <div className="bg-primary-foreground rounded-md">
            <h2 className="text-sm">{event.name}</h2>
        </div>
    );
}