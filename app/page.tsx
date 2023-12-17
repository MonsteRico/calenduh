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
import { fetchMonthsEvents, useGetMonthsEvents } from "~/hooks/useGetMonthsEvents";
import { useToday } from "~/hooks/useToday";

export default function Home() {
    const today = useToday();
    const [dayBeingViewed, setDayBeingViewed] = useState<DateTime<true>>(today);
    const [enabledCalendarIds, setEnabledCalendarIds] = useState<string[]>([]);

    const { data: calendars, isLoading: calendarsLoading } = useGetCalendars({});
    // const { data: monthsEvents, isLoading: eventsLoading } = useGetMonthsEvents(dayBeingViewed);

    useEffect(() => {
        if (calendars) {
            setEnabledCalendarIds(calendars.map((calendar) => calendar.id));
        }
    }, [calendars]);

    const queryClient = useQueryClient();
    // useEffect(() => {
    //     queryClient.prefetchQuery(
    //         ["events", dayBeingViewed.plus({ month: 1 }).month, dayBeingViewed.plus({ month: 1 }).year],
    //         async () => {
    //             await fetchMonthsEvents(dayBeingViewed.plus({ month: 1 }), queryClient);
    //             return "done";
    //         }
    //     );

    //     queryClient.prefetchQuery(
    //         ["events", dayBeingViewed.minus({ month: 1 }).month, dayBeingViewed.minus({ month: 1 }).year],
    //         async () => {
    //             await fetchMonthsEvents(dayBeingViewed.minus({ month: 1 }), queryClient);
    //             return "done";
    //         }
    //     );
    // }, [dayBeingViewed, queryClient]);

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
