"use client";

import { DateTime } from "luxon";
import { SessionProvider } from "next-auth/react";
import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useQueryClient } from "react-query";
import DayView from "~/components/dayView";
import MonthView from "~/components/monthView";
import { SubscribedMessage } from "~/components/subscribedMessage";
import TopBar from "~/components/topBar";
import { Tabs, TabsContent } from "~/components/ui/tabs";
import WeekView from "~/components/weekView";
import { dbUser } from "~/db/schema/auth";
import useGetCalendars from "~/hooks/calendars/useGetCalendars";
import { CurrentViewContext, DayBeingViewedContext, EnabledCalendarIdsContext } from "~/hooks/contexts";
import { fetchEvents } from "~/hooks/events/useGetEvents";
import { useToday } from "~/hooks/useToday";

export default function ActualPage({ user }: { user: dbUser }) {
    const today = useToday();
    const lastDayViewed =
        (DateTime.fromISO(localStorage.getItem("lastDayViewed") as string) as DateTime<true>) || today;
    const lastViewOn = (localStorage.getItem("lastViewOn") as "month" | "week" | "day") || "month";
    const [dayBeingViewed, setDayBeingViewed] = useState<DateTime<true>>(user.startOnToday ? today : lastDayViewed);
    const [enabledCalendarIds, setEnabledCalendarIds] = useState<number[]>([]);
    const [previousMonthBeingViewed, setPreviousMonthBeingViewed] = useState(dayBeingViewed.month);
    const [currentView, setCurrentView] = useState<"month" | "week" | "day">(
        user.startOnPreviousView ? lastViewOn : "month",
    );
    const { data: calendars, isLoading: calendarsLoading } = useGetCalendars({});
    useEffect(() => {
        if (calendars) {
            setEnabledCalendarIds(calendars.map((calendar) => calendar.id));
        }
    }, [calendars]);

    const queryClient = useQueryClient();

    useEffect(() => {
        localStorage.setItem("lastDayViewed", dayBeingViewed.toISODate());
        if (dayBeingViewed.month == previousMonthBeingViewed) {
            return;
        }

        // prefetch the previous month's events
        const previousMonth = dayBeingViewed.minus({ month: 1 });
        const previousMonthPromises = Array(previousMonth.daysInMonth)
            .fill(null)
            .map((_, i) => {
                const day = previousMonth.startOf("day").set({ day: i + 1 });
                return queryClient.prefetchQuery(["events", day.month, day.day, day.year], () => fetchEvents(day));
            });

        // prefetch the next month's events
        const nextMonth = dayBeingViewed.plus({ month: 1 });
        const nextMonthPromises = Array(nextMonth.daysInMonth)
            .fill(null)
            .map((_, i) => {
                const day = nextMonth.startOf("day").set({ day: i + 1 });
                return queryClient.prefetchQuery(["events", day.month, day.day, day.year], () => fetchEvents(day));
            });

        Promise.all([...previousMonthPromises, ...nextMonthPromises]).catch((error) => {
            console.error("Error prefetching events:", error);
        });

        setPreviousMonthBeingViewed(dayBeingViewed.month);
    }, [dayBeingViewed, queryClient, previousMonthBeingViewed]);

    useEffect(() => {
        localStorage.setItem("lastViewOn", currentView);
    }, [currentView]);

    if (calendarsLoading) {
        // TODO better loading state for whole app
        return <h1>Loading</h1>;
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <SessionProvider>
                <CurrentViewContext.Provider value={{ value: currentView, setValue: setCurrentView }}>
                    <DayBeingViewedContext.Provider value={{ value: dayBeingViewed, setValue: setDayBeingViewed }}>
                        <EnabledCalendarIdsContext.Provider
                            value={{ value: enabledCalendarIds, setValue: setEnabledCalendarIds }}
                        >
                            <SubscribedMessage />
                            <Tabs
                                onValueChange={(newView) => {
                                    setCurrentView(newView as "month" | "week" | "day");
                                }}
                                defaultValue={currentView}
                            >
                                <TopBar />
                                <main>
                                    <TabsContent value="month">
                                        <MonthView />
                                    </TabsContent>
                                    <TabsContent value="week">
                                        <WeekView />
                                    </TabsContent>
                                    <TabsContent value="day">
                                        <DayView />
                                    </TabsContent>
                                </main>
                            </Tabs>
                        </EnabledCalendarIdsContext.Provider>
                    </DayBeingViewedContext.Provider>
                </CurrentViewContext.Provider>
            </SessionProvider>
        </DndProvider>
    );
}
