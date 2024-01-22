"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import useGetCalendar from "~/hooks/calendars/useGetCalendar";

export function SubscribedMessage() {
    const searchParams = useSearchParams();
    const subscribedCalendarId = parseInt(searchParams.get("subscribedTo") as string);
    const router = useRouter();
    const { data: calendar, error } = useGetCalendar(subscribedCalendarId, {
        onSuccess: (calendar) => {
            toast.success(`Subscribed to ${calendar.name}`);
        },
        onError: (error) => {
           // toast.error(`Error subscribing to calendar: ${error}`);
        },
        onSettled: () => {
            if (subscribedCalendarId) router.replace("/");
        },
        retry: false,
        refetchInterval: false,
        refetchIntervalInBackground: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
    });

    return null;
}
