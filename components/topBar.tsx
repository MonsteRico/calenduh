"use client";
import { TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ThemeToggle } from "~/components/themeToggle";
import { useToday } from "~/hooks/useToday";
import { useContext, useState } from "react";
import { CurrentViewContext, DayBeingViewedContext, EnabledCalendarIdsContext } from "~/hooks/contexts";
import { Button } from "./ui/button";
import { useIsFetching, useQueryClient } from "react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight, faArrowsRotate, faChevronLeft, faChevronRight, faPlus } from "@fortawesome/free-solid-svg-icons";
import SideBar from "./sideBar";
import { Popover, PopoverTrigger } from "./ui/popover";
import CreateEvent from "./addEvent";
import UserButton from "./userButton";
import { DrawerPopover, DrawerPopoverTrigger } from "./responsiveDrawerPopover";

export default function TopBar() {
    return (
        <div className="sticky top-0 z-10 mx-5 flex flex-row justify-between bg-background py-4">
            <div className="flex flex-row gap-8">
                <SideBar />
                <DaySwitcher />
            </div>
            <TabsList>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>
            <div className="flex flex-row gap-4">
                <AddEventButton />
                <RefreshButton />
                <ThemeToggle />
                <UserButton />
            </div>
        </div>
    );
}

function DaySwitcher() {
    const { value: dayBeingViewed, setValue: setDayBeingViewed } = useContext(DayBeingViewedContext);
    const { value: currentView } = useContext(CurrentViewContext);
    const today = useToday();

    const next = () => {
        switch (currentView) {
            case "month":
                return dayBeingViewed.plus({ month: 1 });
            case "week":
                return dayBeingViewed.plus({ week: 1 });
            case "day":
                return dayBeingViewed.plus({ day: 1 });
        }
    }

    const prev = () => {
        switch (currentView) {
            case "month":
                return dayBeingViewed.minus({ month: 1 });
            case "week":
                return dayBeingViewed.minus({ week: 1 });
            case "day":
                return dayBeingViewed.minus({ day: 1 });
        }
    }


    return (
        <div className="flex flex-col">
            <div className="flex flex-row w-48 justify-between">
                <div
                    onClick={() => {
                        setDayBeingViewed(prev());
                    }}
                    className="cursor-pointer bg-foreground hover:bg-muted-foreground transition duration-300 w-6 rounded-full text-center text-primary-foreground"
                >
                    <FontAwesomeIcon icon={faAngleLeft} />
                </div>
                <h2 className="col-span-3 text-center">
                    {dayBeingViewed.monthLong} {dayBeingViewed.day}, {dayBeingViewed.year}
                </h2>
                <div
                    onClick={() => {
                        setDayBeingViewed(next());
                    }}
                    className="cursor-pointer bg-foreground hover:bg-muted-foreground transition duration-300 w-6 rounded-full text-center text-primary-foreground"
                >
                    <FontAwesomeIcon icon={faAngleRight} />
                </div>
            </div>
            <h2
                onClick={() => {
                    setDayBeingViewed(today);
                }}
                className="cursor-pointer text-sm text-muted-foreground mt-2 hover:text-white transition duration-300 text-center"
            >
                Today
            </h2>
        </div>
    );
}

function AddEventButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <DrawerPopover open={isOpen} onOpenChange={setIsOpen}>
            <DrawerPopoverTrigger className="mb-3">
                <Button variant="ghost">
                    <FontAwesomeIcon icon={faPlus} />
                </Button>
            </DrawerPopoverTrigger>
            <CreateEvent popoverOpen={isOpen} />
        </DrawerPopover>
    );
}

function RefreshButton() {
    const numFetching = useIsFetching();
    const queryClient = useQueryClient();
    return (
        <Button
            variant="ghost"
            onClick={() => {
                queryClient.refetchQueries(["events"]);
            }}
        >
            <FontAwesomeIcon className={numFetching > 0 ? "animate-spin" : ""} icon={faArrowsRotate} />
        </Button>
    );
}
