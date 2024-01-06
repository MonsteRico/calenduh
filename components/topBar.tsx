"use client";
import { TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ThemeToggle } from "~/components/themeToggle";
import { useToday } from "~/hooks/useToday";
import { useContext, useEffect, useState } from "react";
import { CurrentViewContext, DayBeingViewedContext, EnabledCalendarIdsContext } from "~/hooks/contexts";
import { Button } from "./ui/button";
import { useIsFetching, useQueryClient } from "react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faAngleLeft,
    faAngleRight,
    faArrowsRotate,
    faChevronLeft,
    faChevronRight,
    faPlus,
    faUser,
} from "@fortawesome/free-solid-svg-icons";
import SideBar from "./sideBar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import CreateEvent from "./addEvent";
import UserButton from "./userButton";
import { DrawerPopover, DrawerPopoverContent, DrawerPopoverTrigger } from "./responsiveDrawerPopover";
import { Calendar } from "./ui/calendar";
import { DateTime } from "luxon";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";
import { CircleColorPicker } from "./circleColorPicker";

export default function TopBar() {
    useEffect(() => {
        // get the accent color from local storage, if it exists
        const storedColor = localStorage.getItem("accentColor");
        if (storedColor) {
            document.documentElement.style.setProperty("--calendar-accent", storedColor);
        } else {
            localStorage.setItem("accentColor", "#FAC805");
        }
    }, []);

    return (
        <div className="sticky top-0 z-10 mx-5 flex flex-row justify-between bg-background py-4">
            <div className="flex flex-row gap-8">
                <SideBar />
            </div>
            <div className="flex flex-row gap-4">
                <TabsList className="my-auto">
                    <TabsTrigger value="month">Month</TabsTrigger>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="day">Day</TabsTrigger>
                </TabsList>
                <DaySwitcher />
            </div>
            <div className="flex flex-row gap-4">
                <AddEventButton />
                <RefreshButton />
                <ThemeToggle />
                <UserPopover />
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
    };

    const prev = () => {
        switch (currentView) {
            case "month":
                return dayBeingViewed.minus({ month: 1 });
            case "week":
                return dayBeingViewed.minus({ week: 1 });
            case "day":
                return dayBeingViewed.minus({ day: 1 });
        }
    };

    const [calendarDate, setCalendarDate] = useState(dayBeingViewed.toJSDate());

    return (
        <div className="flex flex-col">
            <div className="flex flex-row w-48 justify-between my-auto">
                <div
                    onClick={() => {
                        setDayBeingViewed(prev());
                    }}
                    className="cursor-pointer bg-foreground hover:bg-muted-foreground transition duration-300 w-6 rounded-full text-center text-primary-foreground"
                >
                    <FontAwesomeIcon icon={faAngleLeft} />
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <h2 className="cursor-pointer text-muted-foreground hover:text-muted-foreground text-white transition duration-300 text-center">
                            <h2 className="col-span-3 text-center">
                                {dayBeingViewed.monthLong} {dayBeingViewed.day}, {dayBeingViewed.year}
                            </h2>
                        </h2>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={calendarDate}
                            defaultMonth={calendarDate}
                            onSelect={(newDate) => {
                                if (!newDate) return;
                                setDayBeingViewed(DateTime.fromJSDate(newDate) as DateTime<true>);
                                setCalendarDate(newDate);
                            }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

                <div
                    onClick={() => {
                        setDayBeingViewed(next());
                    }}
                    className="cursor-pointer bg-foreground hover:bg-muted-foreground transition duration-300 w-6 rounded-full text-center text-primary-foreground"
                >
                    <FontAwesomeIcon icon={faAngleRight} />
                </div>
            </div>
            {/* <h2
                onClick={() => {
                    setDayBeingViewed(today);
                }}
                className="cursor-pointer text-sm text-muted-foreground mt-2 hover:text-white transition duration-300 text-center"
            >
                Today
            </h2> */}
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

function UserPopover() {
    const { data: session } = useSession();

    if (!session) {
        return null;
    }

    const user = session.user;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                    <FontAwesomeIcon icon={faUser} />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-row gap-8">
                        {user.image ? (
                            <img src={user.image} className="w-12 h-12 rounded-full" />
                        ) : (
                            <FontAwesomeIcon className="w-8 h-8 rounded-full bg-yellow-300 text-black" icon={faUser} />
                        )}
                        <h2 className="text-left w-full my-auto text-xl ">{user.name}</h2>
                    </div>
                    <hr />
                    <ThemeSettings />
                    <Button
                        variant="default"
                        className="text-lg"
                        onClick={() => {
                            signOut();
                        }}
                    >
                        Sign Out
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

function ThemeSettings() {
    const [accentColor, setAccentColor] = useState("");
    const [open, setOpen] = useState(false);
    useEffect(() => {
        // get the accent color from local storage, if it exists
        const storedColor = localStorage.getItem("accentColor");
        if (storedColor) {
            setAccentColor(storedColor);
        } else {
            setAccentColor("#FAC805");
            localStorage.setItem("accentColor", "#FAC805");
        }
    }, []);
    useEffect(() => {
        if (!accentColor) return;
        if (accentColor == localStorage.getItem("accentColor")) return;

        // set the accent color in local storage
        localStorage.setItem("accentColor", accentColor);
        // update css variables
        document.documentElement.style.setProperty("--calendar-accent", accentColor);
    }, [accentColor]);


    return (
        <div className="flex flex-row gap-8">
            <ThemeToggle />
            <DrawerPopover open={open} onOpenChange={setOpen}>
                <DrawerPopoverTrigger>
                    <Button variant="outline">Change Accent Color</Button>
                </DrawerPopoverTrigger>
                <DrawerPopoverContent>
                    <CircleColorPicker
                        color={accentColor}
                        onChange={(newColor) => {
                            setAccentColor(newColor);
                        }}
                    />
                </DrawerPopoverContent>
            </DrawerPopover>
        </div>
    );
}
