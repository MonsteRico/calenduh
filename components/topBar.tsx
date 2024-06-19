"use client";
import {
    faAngleLeft,
    faAngleRight,
    faArrowsRotate,
    faCaretDown,
    faPlus,
    faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DateTime } from "luxon";
import { useContext, useEffect, useState } from "react";
import { useIsFetching, useQueryClient } from "react-query";
import { ThemeToggle } from "~/components/themeToggle";
import { TabsList, TabsTrigger } from "~/components/ui/tabs";
import useGetCalendars from "~/hooks/calendars/useGetCalendars";
import { CurrentViewContext, DayBeingViewedContext } from "~/hooks/contexts";
import { useToday } from "~/hooks/useToday";
import useUpdateAccentColor from "~/hooks/userPreferences/useUpdateAccentColor";
import useUpdateDefaultCalendar from "~/hooks/userPreferences/useUpdateDefaultCalendar";
import useUpdateStartOnPreviousView from "~/hooks/userPreferences/useUpdateStartOnPreviousView";
import useUpdateStartOnToday from "~/hooks/userPreferences/useUpdateStartOnToday";
import type { Calendar as CalendarType } from "~/lib/types";
import CreateEvent from "./addEvent";
import { CircleColorPicker } from "./circleColorPicker";
import { DrawerPopover, DrawerPopoverContent, DrawerPopoverTrigger } from "./responsiveDrawerPopover";
import SideBar from "./sideBar";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Switch } from "./ui/switch";
import { useMediaQuery } from "~/hooks/useMediaQuery";
import { cn } from "~/lib/utils";

export default function TopBar() {
    // const user = useUser();
    const { value: currentView, setValue: setCurrentView } = useContext(CurrentViewContext);
    // useEffect(() => {
    //     if (!user) return;
    //     document.documentElement.style.setProperty("--calendar-accent", user.accent_color);
    // }, [user]);

    const isDesktop = useMediaQuery("(min-width: 768px)");

    return (
        <>
            <div className="sticky top-0 z-10 px-5 flex flex-row justify-between bg-background py-4">
                <div className="flex flex-row gap-8">
                    <SideBar />
                </div>
                <div className="flex flex-row gap-4">
                    {isDesktop && (
                        <TabsList className="my-auto">
                            <TabsTrigger value="month">Month</TabsTrigger>
                            <TabsTrigger value="week">Week</TabsTrigger>
                            <TabsTrigger value="day">Day</TabsTrigger>
                        </TabsList>
                    )}
                    {isDesktop && <DaySwitcher />}
                </div>
                <div className={cn("flex flex-row gap-4", !isDesktop && "gap-1")}>
                    <RefreshButton />
                    <AddEventButton />
                    <UserPopover />
                </div>
            </div>
            {!isDesktop && (
                <div className="flex justify-center items-center pb-2">
                    {currentView == "day" && <Button onClick={() => {
                        setCurrentView("month");
                    }} className="absolute left-3">BACK</Button>}
                    <DaySwitcher />
                </div>
            )}
        </>
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

    useEffect(() => {
        setCalendarDate(dayBeingViewed.toJSDate());
    }, [dayBeingViewed]);

    const [open, setOpen] = useState(false);

    return (
        <div className="flex flex-col">
            <div className="flex flex-row w-52 min-w-[208px] justify-between my-auto">
                <div
                    onClick={() => {
                        setDayBeingViewed(prev());
                    }}
                    className="cursor-pointer bg-foreground hover:bg-muted-foreground transition duration-300 w-6 rounded-full text-center text-primary-foreground"
                >
                    <FontAwesomeIcon icon={faAngleLeft} />
                </div>
                <Popover open={open} onOpenChange={setOpen}>
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
                                setOpen(false);
                            }}
                            initialFocus
                        />
                        <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => {
                                setDayBeingViewed(today);
                                setOpen(false);
                            }}
                        >
                            Today
                        </Button>
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
    // const { isLoaded, isSignedIn, user } = useUser();
    // const [startOnToday, setStartOnToday] = useState<boolean>();
    // const [startOnPreviousView, setStartOnPreviousView] = useState<boolean>();
    // const updateStartOnToday = useUpdateStartOnToday();
    // const updateStartOnPreviousView = useUpdateStartOnPreviousView();
    // const updateDefaultCalendar = useUpdateDefaultCalendar();
    // const { data: calendars } = useGetCalendars();
    // const [myCalendar, setMyCalendar] = useState<CalendarType>();
    // useEffect(() => {
    //     if (!isLoaded || !calendars || !user) return;
    //     setStartOnToday(user.startOnToday);
    //     setStartOnPreviousView(user.startOnPreviousView);
    //     const defaultCalendar = calendars.find((calendar) => calendar.id == user.defaultCalendarId);
    //     if (!defaultCalendar) return;
    //     setMyCalendar(defaultCalendar);
    // }, [isLoaded, user]);

    // if (!session || !calendars) {
    //     return (
    //         <Button variant="outline" size="icon">
    //             <FontAwesomeIcon icon={faUser} />
    //         </Button>
    //     );
    // }

    // const user = session.user;

    return (null
        // <Popover>
        //     <PopoverTrigger asChild>
        //         <Button variant="outline" size="icon">
        //             <FontAwesomeIcon icon={faUser} />
        //         </Button>
        //     </PopoverTrigger>
        //     <PopoverContent align="end">
        //         <div className="flex flex-col gap-4">
        //             <div className="flex flex-row gap-8">
        //                 {user.image ? (
        //                     <img src={user.image} className="w-12 h-12 rounded-full" />
        //                 ) : (
        //                     <FontAwesomeIcon className="w-8 h-8 rounded-full bg-yellow-300 text-black" icon={faUser} />
        //                 )}
        //                 <h2 className="text-left w-full my-auto text-xl ">{user.name}</h2>
        //             </div>
        //             <hr />
        //             <ThemeSettings />
        //             <hr />
        //             <div className="flex flex-row justify-between">
        //                 <Label className="my-auto">Open on Today?</Label>
        //                 <Switch
        //                     checked={startOnToday}
        //                     onCheckedChange={() => {
        //                         setStartOnToday(!startOnToday);
        //                         updateStartOnToday.mutate({ startOnToday: !startOnToday });
        //                     }}
        //                 />
        //             </div>
        //             <hr />
        //             <div className="flex flex-row justify-between">
        //                 <Label className="my-auto">Open on Previous View?</Label>
        //                 <Switch
        //                     checked={startOnPreviousView}
        //                     onCheckedChange={() => {
        //                         setStartOnPreviousView(!startOnPreviousView);
        //                         updateStartOnPreviousView.mutate({ startOnPreviousView: !startOnPreviousView });
        //                     }}
        //                 />
        //             </div>
        //             <hr />
        //             <div className="flex flex-row justify-between">
        //                 <Label className="my-auto">Calendar</Label>
        //                 <DropdownMenu>
        //                     <DropdownMenuTrigger className="text-sm flex flex-row text-muted-foreground">
        //                         <div
        //                             style={{ backgroundColor: myCalendar?.color }}
        //                             className="w-3 h-3 rounded-full my-auto"
        //                         ></div>
        //                         <h3 className="text-ellipsis px-2 overflow-hidden">{myCalendar?.name}</h3>
        //                         <FontAwesomeIcon icon={faCaretDown} className="my-auto" />
        //                     </DropdownMenuTrigger>
        //                     <DropdownMenuContent>
        //                         {calendars
        //                             .filter((calendar) => !calendar.subscribed)
        //                             .map((calendar) => {
        //                                 if (calendar.isDefault) return null;
        //                                 return (
        //                                     <DropdownMenuItem
        //                                         onClick={() => {
        //                                             setMyCalendar(calendar);
        //                                             updateDefaultCalendar.mutate({ newDefaultCalendar: calendar });
        //                                         }}
        //                                         key={calendar.id}
        //                                         className="flex flex-row"
        //                                     >
        //                                         <div
        //                                             style={{ backgroundColor: calendar.color }}
        //                                             className="w-3 h-3 rounded-full my-auto"
        //                                         ></div>
        //                                         <h3 className="text-ellipsis px-2 overflow-hidden">{calendar.name}</h3>
        //                                     </DropdownMenuItem>
        //                                 );
        //                             })}
        //                     </DropdownMenuContent>
        //                 </DropdownMenu>
        //             </div>
        //             <hr />
        //             <Button
        //                 variant="default"
        //                 className="text-lg"
        //                 onClick={() => {
        //                     signOut();
        //                 }}
        //             >
        //                 Sign Out
        //             </Button>
        //         </div>
        //     </PopoverContent>
        // </Popover>
    );
}

function ThemeSettings() {
    // const [accentColor, setAccentColor] = useState("");
    // const [open, setOpen] = useState(false);
    // const updateAccentColor = useUpdateAccentColor();
    // const user = useUser();
    // useEffect(() => {
    //     if (!user) return;
    //     setAccentColor(user.accent_color);
    // }, [user]);

    // useEffect(() => {
    //     if (!accentColor || !user) return;
    //     if (accentColor == user.accent_color) return;
    //     // set the accent color in database
    //     updateAccentColor.mutate({ newColor: accentColor });
    //     // update css variables
    //     document.documentElement.style.setProperty("--calendar-accent", accentColor);
    // }, [accentColor]);

    return (null
        // <div className="flex flex-row gap-8">
        //     <ThemeToggle />
        //     <DrawerPopover open={open} onOpenChange={setOpen}>
        //         <DrawerPopoverTrigger>
        //             <Button variant="outline">Change Accent Color</Button>
        //         </DrawerPopoverTrigger>
        //         <DrawerPopoverContent>
        //             <CircleColorPicker
        //                 color={accentColor}
        //                 onChange={(newColor) => {
        //                     setAccentColor(newColor);
        //                 }}
        //             />
        //         </DrawerPopoverContent>
        //     </DrawerPopover>
        // </div>
    );
}
