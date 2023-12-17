import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SideBar({}) {
    return (
        <Sheet>
            <SheetTrigger>
                <FontAwesomeIcon icon={faBars} />
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle>Calendars</SheetTitle>
                    <SheetDescription>All your calendars and stuff and things.</SheetDescription>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    );
}
