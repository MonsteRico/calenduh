import * as React from "react";

import { useMediaQuery } from "~/hooks/useMediaQuery";

import { PopoverTriggerProps } from "@radix-ui/react-popover";
import { Drawer, DrawerContent, DrawerTrigger } from "~/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

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

export const DrawerPopoverTrigger = React.forwardRef(function DrawerPopoverTrigger(
    { children, ...props }: { children: React.ReactNode } & PopoverTriggerProps,
    ref: React.ForwardedRef<HTMLButtonElement>
) {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (isDesktop) {
        return (
            <PopoverTrigger ref={ref} {...props}>
                {children}
            </PopoverTrigger>
        );
    }

    return (
        <DrawerTrigger ref={ref} {...props}>
            {children}
        </DrawerTrigger>
    );
});

export function DrawerPopoverContent({ children }: { children: React.ReactNode }) {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (isDesktop) {
        return <PopoverContent>{children}</PopoverContent>;
    }

    return <DrawerContent className="p-5">{children}</DrawerContent>;
}
