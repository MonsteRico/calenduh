"use client";
import { TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ThemeToggle } from "~/components/themeToggle";
import { useToday } from "~/hooks/useToday";
import { useContext } from "react";
import { DayBeingViewedContext, EnabledCalendarIdsContext } from "~/hooks/contexts";
import { Button } from "./ui/button";

export default function TopBar() {
    const today = useToday();
    const { value: dayBeingViewed, setValue: setDayBeingViewed } = useContext(DayBeingViewedContext);
    const {value: enabledCalendarIds, setValue: setEnabledCalendarIds} = useContext(EnabledCalendarIdsContext);

    return (
        <div className="sticky top-0 z-10 flex flex-row justify-center gap-8 bg-background py-4">
            <h2
                onClick={() => {
                    setDayBeingViewed(dayBeingViewed.minus({ month: 1 }));
                }}
                className="cursor-pointer"
            >
                {"<"}
            </h2>
            <h2>
                {dayBeingViewed.monthLong} {dayBeingViewed.year}
            </h2>
            <h2
                onClick={() => {
                    setDayBeingViewed(dayBeingViewed.plus({ month: 1 }));
                }}
                className="cursor-pointer"
            >
                {">"}
            </h2>
            <h2
                onClick={() => {
                    setDayBeingViewed(today);
                }}
                className="cursor-pointer underline"
            >
                Today
            </h2>
            <Button
                onClick={() => {
                    setEnabledCalendarIds(["1"]);
                }}
            >
                Disable second calendar
            </Button>
            <TabsList>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>
            <ThemeToggle />
        </div>
    );
}
