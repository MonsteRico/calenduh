import { DateTime } from "luxon";
import { useContext, useEffect, useState } from "react";
import { useToday } from "~/hooks/useToday";

import { useDrop } from "react-dnd";
import { toast } from "sonner";
import { CurrentViewContext, DayBeingViewedContext, EnabledCalendarIdsContext } from "~/hooks/contexts";
import useGetEvents from "~/hooks/events/useGetEvents";
import useMoveEvent from "~/hooks/events/useMoveEvent";
import { useMediaQuery } from "~/hooks/useMediaQuery";
import { CalendarEvent } from "~/lib/types";
import { cn } from "~/lib/utils";
import CreateEvent from "./addEvent";
import { MonthEvent } from "./event";
import { DrawerPopover, DrawerPopoverTrigger } from "./responsiveDrawerPopover";

export function MonthView() {
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
    const moveEvent = useMoveEvent();
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        // The type (or types) to accept - strings or symbols
        accept: "MonthEvent",
        // Props to collect
        canDrop: (item: { event: CalendarEvent; day: DateTime<true> }, monitor) => {
            return !day.hasSame(item.day, "day");
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
        drop(item: { event: CalendarEvent; day: DateTime<true> }, monitor) {
            const didDrop = monitor.didDrop();
            if (didDrop) {
                return;
            }
            console.log("dropped", item, day);
            if (item.event.repeatType != "none") {
                toast.info("Cannot move repeating events yet");
                return;
            }
            moveEvent.mutate({
                event: item.event,
                newDay: day,
                newStartTime: item.event.interval.start,
                newEndTime: item.event.interval.end,
            });
        },
    }));

    const today = useToday();
    const dayNumber = day.day;
    const { value: dayBeingViewed } = useContext(DayBeingViewedContext);
    const currentMonth = dayBeingViewed.month == day.month;
    const dayIsSaturday = day.weekday === 6;
    const isToday = day.hasSame(today, "day");

    const { value: enabledCalendarIds } = useContext(EnabledCalendarIdsContext);
    const { data: events, isLoading } = useGetEvents(day);
    const [myEvents, setMyEvents] = useState<CalendarEvent[]>([]);

    const [createPopoverOpen, setCreatePopoverOpen] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");

    useEffect(() => {
        if (events) {
            setMyEvents(events.filter((event) => enabledCalendarIds.includes(event.calendar.id)));
        }
    }, [events, enabledCalendarIds]);
    return (
        <DrawerPopover open={createPopoverOpen} onOpenChange={setCreatePopoverOpen}>
            <DrawerPopoverTrigger
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                onDoubleClick={() => {
                    console.log("double click");
                    setCreatePopoverOpen(true);
                }}
                className="cursor-default"
            >
                <div
                    ref={drop}
                    className={cn(
                        "relative h-32 border-l-4 border-t-4 border-primary-foreground text-2xl",
                        dayIsSaturday && "border-r-4",
                        bottomRow && "border-b-4",
                        isOver && canDrop && "bg-primary-foreground"
                    )}
                >
                    <h2
                        className={cn(
                            "absolute left-4 top-2",
                            currentMonth ? "font-bold text-primary" : "text-muted-foreground",
                            isToday && "text-calendarAccent"
                        )}
                    >
                        {dayNumber}
                    </h2>
                    <div className="flex flex-col mt-8 p-2">
                        {myEvents &&
                            myEvents
                                .slice(0, 3)
                                .map((event) => <MonthEvent key={event.id} event={event} dayItsOn={day} />)}
                        {myEvents && myEvents.length > 3 && (
                            <h2 className="text-xs text-secondary">{myEvents.length - 3} more events...</h2>
                        )}
                    </div>
                </div>
            </DrawerPopoverTrigger>
            <CreateEvent day={day} popoverOpen={createPopoverOpen} onCreated={() => setCreatePopoverOpen(false)} />
        </DrawerPopover>
    );
}

export function MobileMonthView() {
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

    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    // the required distance between touchStart and touchEnd to be detected as a swipe
    const minSwipeDistance = 100;

    useEffect(() => {
        const onTouchStart = (e: TouchEvent) => {
            setTouchEnd(null); // otherwise the swipe is fired even with usual touch events
            setTouchStart(e.targetTouches[0].clientX);
        };

        const onTouchMove = (e: TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

        const onTouchEnd = () => {
            if (!touchStart || !touchEnd) return;
            let distance = touchStart - touchEnd;
            const isLeftSwipe = distance > minSwipeDistance;
            const isRightSwipe = distance < -minSwipeDistance;
            if (isRightSwipe) {
                setDayBeingViewed(dayBeingViewed.minus({ month: 1 }));
            }
            if (isLeftSwipe) {
                setDayBeingViewed(dayBeingViewed.plus({ month: 1 }));
            }
        };

        document.addEventListener("touchstart", onTouchStart);
        document.addEventListener("touchmove", onTouchMove);
        document.addEventListener("touchend", onTouchEnd);
        return () => {
            document.removeEventListener("touchstart", onTouchStart);
            document.removeEventListener("touchmove", onTouchMove);
            document.removeEventListener("touchend", onTouchEnd);
        };
    }, [touchStart, touchEnd, dayBeingViewed, setDayBeingViewed]);

    return (
        <section className="flex flex-col">
            <div className="mb-2 grid grid-cols-7 text-center text-xl">
                <h2 className="">S</h2>
                <h2 className="">M</h2>
                <h2 className="">T</h2>
                <h2 className="">W</h2>
                <h2 className="">R</h2>
                <h2 className="">F</h2>
                <h2 className="">S</h2>
            </div>
            <div className="grid grid-cols-7 grid-rows-6">
                {days.map((day, i) => (
                    <MobileDay bottomRow={Math.floor(i / 7) == 5} day={day} key={day.toISO()} />
                ))}
            </div>
        </section>
    );
}

function MobileDay({ day, bottomRow = false }: { day: DateTime<true>; bottomRow?: boolean }) {
    const today = useToday();
    const dayNumber = day.day;
    const { value: dayBeingViewed, setValue:setDayBeingViewed } = useContext(DayBeingViewedContext);
    const currentMonth = dayBeingViewed.month == day.month;
    const dayIsSaturday = day.weekday === 6;
    const isToday = day.hasSame(today, "day");
    const {value:currentView, setValue:setCurrentView} = useContext(CurrentViewContext);

    const { value: enabledCalendarIds } = useContext(EnabledCalendarIdsContext);
    const { data: events, isLoading } = useGetEvents(day);
    const [myEvents, setMyEvents] = useState<CalendarEvent[]>([]);

    const [createPopoverOpen, setCreatePopoverOpen] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");

    useEffect(() => {
        if (events) {
            setMyEvents(events.filter((event) => enabledCalendarIds.includes(event.calendar.id)));
        }
    }, [events, enabledCalendarIds]);
    return (
        <div
            className={cn(
                "relative border-l-4 border-t-4 p-2 flex-col border-primary-foreground text-2xl justify-center items-center flex text-center",
                dayIsSaturday && "border-r-4",
                bottomRow && "border-b-4"
            )}
            onClick={() => {
                setDayBeingViewed(day);
                if (currentView == "month") {
                    setCurrentView("day");
                } else {
                    setCurrentView("month");
                }
            }}
        >
            <h2
                className={cn(
                    currentMonth ? "font-bold text-primary" : "text-muted-foreground",
                    isToday && "text-calendarAccent"
                )}
            >
                {dayNumber}
            </h2>
            <div
                className={cn(
                    "w-2 h-2 rounded-full flex flex-col",
                    myEvents.length > 0 && currentMonth && "bg-primary",
                    myEvents.length > 0 && !currentMonth && "bg-muted-foreground"
                )}
            ></div>
        </div>
    );
}
