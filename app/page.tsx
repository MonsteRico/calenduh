"use client";

import type { DateTime } from "luxon";
import { useState } from "react";
import MonthView from "~/components/monthView";
import TopBar from "~/components/topBar";
import { Tabs, TabsContent } from "~/components/ui/tabs";
import WeekView from "~/components/weekView";
import { DayBeingViewedContext } from "~/hooks/contexts";
import { useToday } from "~/hooks/useToday";

export default function Home() {
  const today = useToday();
  const [dayBeingViewed, setDayBeingViewed] = useState<DateTime<true>>(today);

  return (
    <DayBeingViewedContext.Provider
      value={{ value: dayBeingViewed, setValue: setDayBeingViewed }}
    >
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
    </DayBeingViewedContext.Provider>
  );
}
