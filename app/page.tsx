"use client";

import type { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { useQueryClient } from "react-query";
import MonthView from "~/components/monthView";
import TopBar from "~/components/topBar";
import { Tabs, TabsContent } from "~/components/ui/tabs";
import WeekView from "~/components/weekView";
import { DayBeingViewedContext, EnabledCalendarIdsContext } from "~/hooks/contexts";
import useGetCalendars from "~/hooks/useGetCalendars";
import { fetchEvents } from "~/hooks/useGetEvents";
import { useToday } from "~/hooks/useToday";

export default function Home() {
    const today = useToday();
    const [dayBeingViewed, setDayBeingViewed] = useState<DateTime<true>>(today);
    const [enabledCalendarIds, setEnabledCalendarIds] = useState<number[]>([]);
    const [previousMonthBeingViewed, setPreviousMonthBeingViewed] = useState(dayBeingViewed.month);

    const { data: calendars, isLoading: calendarsLoading } = useGetCalendars({});

    useEffect(() => {
        if (calendars) {
            setEnabledCalendarIds(calendars.map((calendar) => calendar.id));
        }
    }, [calendars]);

    const queryClient = useQueryClient();
    useEffect(() => {
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

    if (enabledCalendarIds.length == 0) {
        // TODO better loading state for whole app
        return <h1>Loading</h1>;
    }

    return (
        <DayBeingViewedContext.Provider value={{ value: dayBeingViewed, setValue: setDayBeingViewed }}>
            <EnabledCalendarIdsContext.Provider value={{ value: enabledCalendarIds, setValue: setEnabledCalendarIds }}>
                <Tabs defaultValue="month">
                    <TopBar />
                    <main>
                        <TabsContent value="month">
                            <MonthView />
                        </TabsContent>
                        <TabsContent value="week">
                            <WeekView />
                        </TabsContent>
                        <TabsContent value="day">
                            <h1>Day</h1>
                        </TabsContent>
                    </main>
                </Tabs>
            </EnabledCalendarIdsContext.Provider>
        </DayBeingViewedContext.Provider>
    );
}
