import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import { faBars, faEllipsis, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useGetCalendars from "~/hooks/useGetCalendars";
import { Calendar } from "~/lib/types";
import { useContext, useEffect, useRef, useState } from "react";
import { EnabledCalendarIdsContext } from "~/hooks/contexts";
import { Checkbox } from "./ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useMutation, useQueryClient } from "react-query";
import { useDebounce } from "~/hooks/useDebounce";
import useUpdateCalendar from "~/hooks/useUpdateCalendar";
import { Button } from "./ui/button";
import useDeleteCalendar from "~/hooks/useDeleteCalendar";
import useCreateCalendar from "~/hooks/useCreateCalendar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

export default function SideBar({}) {
    const { data: calendars } = useGetCalendars();

    return (
        <Sheet>
            <SheetTrigger>
                <FontAwesomeIcon icon={faBars} />
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle>Calendars</SheetTitle>
                    <SheetDescription>All your calendars and stuff and things.</SheetDescription>
                    <div className="gap-2 flex flex-col">
                        {calendars?.map((calendar) => (
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
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    console.log(calendar);
    return (
        <div
            onMouseDown={(e) => {
                if (!dialogOpen) {
                    if (enabled) {
                        setEnabledCalendarIds(enabledCalendarIds.filter((id) => id !== calendar.id));
                    } else {
                        setEnabledCalendarIds([...enabledCalendarIds, calendar.id]);
                    }
                }
            }}
            className="w-full hover:bg-muted rounded p-2 justify-between flex flex-row cursor-pointer  transition-colors duration-300"
        >
            <div className="flex flex-row gap-4">
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
                <h2>{calendar.name}</h2>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger className="my-auto px-1 rounded z-10 hover:bg-muted-foreground cursor-pointer  transition-colors duration-300">
                    <FontAwesomeIcon icon={faEllipsis} />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    onClick={(e) => {
                        e.stopPropagation();
                        setDialogOpen(true);
                    }}
                >
                    <DropdownMenuItem className="cursor-pointer">
                        <EditCalendar setDialogOpen={setDialogOpen} calendar={calendar} />
                    </DropdownMenuItem>
                    {!calendar.isDefault && (
                        <>
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
            {!calendar.isDefault && (
                <DeleteCalendarAlert
                    deleteAlertOpen={deleteAlertOpen}
                    setDeleteAlertOpen={setDeleteAlertOpen}
                    setDialogOpen={setDialogOpen}
                    calendar={calendar}
                />
            )}
        </div>
    );
}

function DeleteCalendarAlert({
    calendar,
    setDialogOpen,
    setDeleteAlertOpen,
    deleteAlertOpen,
}: {
    calendar: Calendar;
    setDialogOpen: (open: boolean) => void;
    setDeleteAlertOpen: (open: boolean) => void;
    deleteAlertOpen: boolean;
}) {
    const deleteCalendar = useDeleteCalendar(calendar);
    return (
        <>
            <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
                <AlertDialogContent>
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
                                setDialogOpen(false);
                            }}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                deleteCalendar.mutate();
                                setDialogOpen(false);
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

function EditCalendar({ calendar, setDialogOpen }: { calendar: Calendar; setDialogOpen: (open: boolean) => void }) {
    const [editedName, setEditedName] = useState<string>(calendar.name);
    const [color, setColor] = useState<string>(calendar.color);
    const [open, setOpen] = useState(false);
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
            setDialogOpen(false);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <div
                onMouseDown={(e) => {
                    e.stopPropagation();
                }}
            >
                <DialogTrigger
                    className=""
                    onMouseDown={(e) => {
                        e.preventDefault();
                        setOpen(true);
                    }}
                >
                    Edit Calendar
                </DialogTrigger>
            </div>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit {editedName}</DialogTitle>
                    <DialogDescription className="flex flex-col gap-4">
                        <div className="flex flex-row gap-4">
                            <Label htmlFor="name">Name</Label>
                            {!calendar.isDefault ? <Input
                                type="text"
                                id="name"
                                placeholder="Calendar Name"
                                value={editedName}
                                onChange={(e) => {
                                    setEditedName(e.target.value);
                                }}
                            /> : <Label>Default Calendar</Label>}
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

// TODO pick a better color palette
const colors = [
    "#FF5733",
    "#C70039",
    "#900C3F",
    "#581845",
    "#1C2833",
    "#17202A",
    "#F4D03F",
    "#F7DC6F",
    "#52BE80",
    "#48C9B0",
];

function CircleColorPicker({ color, onChange }: { color: string; onChange: (newColor: string) => void }) {
    return (
        <div style={{ backgroundColor: color }} className="flex flex-row flex-wrap gap-2 rounded border p-2">
            {colors.map((colorHex) => (
                <div
                    key={colorHex}
                    onClick={() => {
                        onChange(colorHex);
                    }}
                    style={{ backgroundColor: colorHex }}
                    className={`w-10 h-10 rounded-full cursor-pointer`}
                ></div>
            ))}
            <Input
                style={{ borderWidth: "4px", borderColor: color }}
                type="text"
                value={color}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
