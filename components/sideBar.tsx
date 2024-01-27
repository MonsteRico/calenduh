import { faBars, faEllipsis, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import { useQueryClient } from "react-query";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import useCreateCalendar from "~/hooks/calendars/useCreateCalendar";
import useDeleteCalendar from "~/hooks/calendars/useDeleteCalendar";
import useGetCalendars from "~/hooks/calendars/useGetCalendars";
import useUpdateCalendar from "~/hooks/calendars/useUpdateCalendar";
import { EnabledCalendarIdsContext } from "~/hooks/contexts";
import { useDebounce } from "~/hooks/useDebounce";
import { Calendar } from "~/lib/types";
import { CircleColorPicker } from "./circleColorPicker";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function SideBar({}) {
    const { data: calendars } = useGetCalendars();

    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    // the required distance between touchStart and touchEnd to be detected as a swipe
    const minSwipeDistance = 100;

    const onTouchStart = (e: TouchEvent) => {
        setTouchEnd(null); // otherwise the swipe is fired even with usual touch events
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        if (isLeftSwipe && sheetOpen) {setSheetOpen(false);}
        else if (isRightSwipe && !sheetOpen) {setSheetOpen(true);}
        setTouchStart(null);
        setTouchEnd(null);
    };

    document.addEventListener("touchstart", onTouchStart);
    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);

    return (
        <Sheet onOpenChange={setSheetOpen} open={sheetOpen}>
            <SheetTrigger>
                <FontAwesomeIcon icon={faBars} />
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle>Calendars</SheetTitle>
                    <SheetDescription>All your calendars and stuff and things.</SheetDescription>
                    <div className="gap-2 flex flex-col">
                        {calendars
                            ?.filter((calendar) => !calendar.subscribed)
                            .sort((a, b) => (a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1))
                            .map((calendar) => (
                                <CalendarItem key={calendar.id} calendar={calendar} />
                            ))}
                        <h2>Subscribed Calendars</h2>
                        {calendars
                            ?.filter((calendar) => calendar.subscribed)
                            .sort((a, b) => (a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1))
                            .map((calendar) => (
                                <CalendarItem key={calendar.id} calendar={calendar} />
                            ))}
                        <AddCalendar />
                    </div>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    );
}

function CalendarItem({ calendar }: { calendar: Calendar }) {
    const { value: enabledCalendarIds, setValue: setEnabledCalendarIds } = useContext(EnabledCalendarIdsContext);
    const enabled = enabledCalendarIds.includes(calendar.id);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    return (
        <>
            <div className="w-full hover:bg-muted rounded p-2 justify-between flex flex-row cursor-pointer  transition-colors duration-300">
                <div
                    onMouseDown={(e) => {
                        if (!editDialogOpen && !deleteAlertOpen) {
                            if (!calendar.isDefault) {
                                if (enabled) {
                                    setEnabledCalendarIds(enabledCalendarIds.filter((id) => id !== calendar.id));
                                } else {
                                    setEnabledCalendarIds([...enabledCalendarIds, calendar.id]);
                                }
                            }
                        }
                    }}
                    className="flex flex-row gap-4 w-full"
                >
                    {!calendar.isDefault ? (
                        <Checkbox
                            className="my-auto"
                            style={{
                                backgroundColor: enabled ? calendar.color : "transparent",
                                borderColor: calendar.color,
                                opacity: 1,
                                cursor: "pointer",
                            }}
                            checked={enabled}
                            disabled
                        />
                    ) : (
                        <p style={{ color: calendar.color }} className="opacity-75 text-sm my-auto">
                            Default
                        </p>
                    )}
                    <h2>{calendar.name}</h2>
                </div>{" "}
                {!calendar.subscribed && (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="my-auto px-1 rounded z-10 hover:bg-muted-foreground cursor-pointer  transition-colors duration-300">
                            <FontAwesomeIcon icon={faEllipsis} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log("clicked too");
                            }}
                        >
                            <DropdownMenuItem
                                onClick={(e) => {
                                    setEditDialogOpen(true);
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                className="cursor-pointer"
                            >
                                Edit Calendar
                            </DropdownMenuItem>{" "}
                            {!calendar.isDefault && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            navigator.clipboard.writeText(
                                                `${window.location.origin}/api/calendars/subscribe/${calendar.subscribeCode}`
                                            );
                                            toast.success("Copied subscribe link to clipboard");
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        className="cursor-pointer"
                                    >
                                        Copy Subscribe Link
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setDeleteAlertOpen(true);
                                        }}
                                        className="text-red-500 hover:text-red-700 cursor-pointer transition-all duration-300"
                                    >
                                        Delete <FontAwesomeIcon icon={faTrash} className="ml-2" />
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
                {!calendar.isDefault && (
                    <DeleteCalendarAlert
                        deleteAlertOpen={deleteAlertOpen}
                        setDeleteAlertOpen={setDeleteAlertOpen}
                        calendar={calendar}
                    />
                )}
            </div>
            <EditCalendar setOpen={setEditDialogOpen} open={editDialogOpen} calendar={calendar} />
        </>
    );
}

function DeleteCalendarAlert({
    calendar,
    setDeleteAlertOpen,
    deleteAlertOpen,
}: {
    calendar: Calendar;
    setDeleteAlertOpen: (open: boolean) => void;
    deleteAlertOpen: boolean;
}) {
    const deleteCalendar = useDeleteCalendar(calendar);
    return (
        <>
            <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
                <AlertDialogContent
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. All events in this calendar will be deleted, and anyone else
                            subscribed to this calendar will no longer be able to see it.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => {
                                setDeleteAlertOpen(false);
                            }}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                deleteCalendar.mutate();
                                setDeleteAlertOpen(false);
                            }}
                            className="bg-red-500 hover:bg-red-800 transition-all duration-300"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function EditCalendar({
    calendar,
    setOpen,
    open,
}: {
    calendar: Calendar;
    setOpen: (open: boolean) => void;
    open: boolean;
}) {
    const [editedName, setEditedName] = useState<string>(calendar.name);
    const [color, setColor] = useState<string>(calendar.color);
    const debouncedValue = useDebounce<string>(editedName, 500);
    const queryClient = useQueryClient();
    const updateCalendar = useUpdateCalendar(calendar);

    useEffect(() => {
        if (debouncedValue !== calendar.name) {
            updateCalendar.mutate({ name: debouncedValue });
        }
    }, [debouncedValue]);

    useEffect(() => {
        if (open == false) {
            setEditedName(calendar.name);
            setColor(calendar.color);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit {editedName}</DialogTitle>
                    <DialogDescription className="flex flex-col gap-4">
                        <div className="flex flex-row gap-4">
                            <Label htmlFor="name">Name</Label>
                            {!calendar.isDefault ? (
                                <Input
                                    type="text"
                                    id="name"
                                    placeholder="Calendar Name"
                                    value={editedName}
                                    onChange={(e) => {
                                        setEditedName(e.target.value);
                                    }}
                                />
                            ) : (
                                <Label>Default Calendar</Label>
                            )}
                        </div>
                        <div className="flex flex-row gap-4">
                            <Label htmlFor="color">Color</Label>
                            <CircleColorPicker
                                color={color}
                                onChange={(newColor) => {
                                    setColor(newColor);
                                    updateCalendar.mutate({ color: newColor });
                                }}
                            />
                        </div>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}

function AddCalendar() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [color, setColor] = useState("#000000");
    const queryClient = useQueryClient();
    const mutation = useCreateCalendar();

    useEffect(() => {
        if (mutation.isSuccess) {
            queryClient.invalidateQueries("calendars");
            setOpen(false);
        }
    }, [mutation.isSuccess]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <div
                onMouseDown={(e) => {
                    e.stopPropagation();
                }}
            >
                <DialogTrigger
                    className="w-full border-2 border-primary-foreground rounded p-2 hover:bg-muted-foreground cursor-pointer transition-colors duration-300"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        setOpen(true);
                    }}
                >
                    Add Calendar +
                </DialogTrigger>
            </div>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Calendar</DialogTitle>
                    <DialogDescription className="flex flex-col gap-4">
                        <div className="flex flex-row gap-4">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                type="text"
                                id="name"
                                placeholder="Calendar Name"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                }}
                            />
                        </div>
                        <div className="flex flex-row gap-4">
                            <Label htmlFor="color">Color</Label>
                            <CircleColorPicker
                                color={color}
                                onChange={(newColor) => {
                                    setColor(newColor);
                                }}
                            />
                        </div>
                        <Button
                            onClick={() => {
                                mutation.mutate({
                                    name,
                                    color,
                                });
                            }}
                        >
                            Add
                        </Button>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
