"use client";
import { TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ThemeToggle } from "~/components/themeToggle";
import { useToday } from "~/hooks/useToday";
import { useContext, useState } from "react";
import { DayBeingViewedContext, EnabledCalendarIdsContext } from "~/hooks/contexts";
import { Button } from "./ui/button";
import { useIsFetching, useQueryClient } from "react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import SideBar from "./sideBar";
import { Popover, PopoverTrigger } from "./ui/popover";
import CreateEvent from "./addEvent";

export default function TopBar() {
    const today = useToday();
    const { value: dayBeingViewed, setValue: setDayBeingViewed } = useContext(DayBeingViewedContext);
    const { value: enabledCalendarIds, setValue: setEnabledCalendarIds } = useContext(EnabledCalendarIdsContext);

    return (
        <div className="sticky top-0 z-10 flex flex-row justify-center gap-8 bg-background py-4">
            <SideBar />
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
            <TabsList>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>
            <ThemeToggle />
            <RefreshButton />
                <AddEventButton />
        </div>
    );
}

function AddEventButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger>
                <Button variant="default">Add Event</Button>
            </PopoverTrigger>
            <CreateEvent popoverOpen={isOpen} />
        </Popover>
    );
}

function RefreshButton() {
    const numFetching = useIsFetching();
    const queryClient = useQueryClient();
    return <Button variant="ghost" onClick={() => {
        queryClient.refetchQueries(["events"])
    }}>
        <FontAwesomeIcon 
        className={numFetching > 0 ? "animate-spin" : ""}
        icon={faArrowsRotate} />
    </Button>;
}
