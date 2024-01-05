import * as React from "react";

import { cn } from "~/lib/utils";
import { useMediaQuery } from "~/hooks/useMediaQuery";
import { Button } from "~/components/ui/button";

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "~/components/ui/drawer";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { PopoverTriggerProps } from "@radix-ui/react-popover";

export function DrawerPopover({
    open,
    onOpenChange,
    children,
}: {
    open: boolean;
    children: React.ReactNode;
    onOpenChange: (open: boolean) => void;
}) {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (isDesktop) {
        return (
            <Popover open={open} onOpenChange={onOpenChange}>
                {children}
            </Popover>
        );
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            {children}
        </Drawer>
    );
}

export function DrawerPopoverTrigger({ children, ...props }: { children: React.ReactNode } & PopoverTriggerProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (isDesktop) {
        return <PopoverTrigger {...props}>{children}</PopoverTrigger>;
    }

    return <DrawerTrigger {...props}>{children}</DrawerTrigger>;
}

export function DrawerPopoverContent({ children }: { children: React.ReactNode }) {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (isDesktop) {
        return <PopoverContent>{children}</PopoverContent>;
    }

    return <DrawerContent className="p-5">{children}</DrawerContent>;
}