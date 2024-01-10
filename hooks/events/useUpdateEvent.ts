import { DateTime, Interval } from "luxon";
import { useMutation, useQueryClient } from "react-query";
import { Calendar, CalendarEvent } from "~/lib/types";

export default function useUpdateEvent(event: CalendarEvent) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            title,
            eventDay,
            startTime,
            endTime,
            recurringEndDay,
            calendarId,
            allDay,
            daysOfWeekString,
            repeatType,
            forceRefetch,
        }: {
            title?: string;
            eventDay?: DateTime<true>;
            recurringEndDay?: DateTime<true> | null;
            calendarId?: number;
            allDay?: boolean;
            daysOfWeekString?: string;
            repeatType?: "daily" | "weekly" | "monthly" | "yearly" | "none";
            forceRefetch?: boolean;
            startTime?: DateTime<true>;
            endTime?: DateTime<true>;
        }) => {
            if (
                !title &&
                !eventDay &&
                !calendarId &&
                allDay === undefined &&
                !daysOfWeekString &&
                !repeatType &&
                !(recurringEndDay == undefined) &&
                !startTime &&
                !endTime
            ) {
                return;
            }

            const res = await fetch(`/api/events/${event.id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    title,
                    calendarId,
                    allDay,
                    daysOfWeekString,
                    repeatType,
                    startDay: eventDay?.day,
                    startMonth: eventDay?.month,
                    startYear: eventDay?.year,
                    startTime: startTime?.toLocaleString(DateTime.TIME_24_SIMPLE),
                    endTime: endTime?.toLocaleString(DateTime.TIME_24_SIMPLE),
                    endDay: recurringEndDay?.day ?? null,
                    endMonth: recurringEndDay?.month ?? null,
                    endYear: recurringEndDay?.year ?? null,
                }),
            });
            return res.json();
        },
        // When mutate is called:
        onMutate: async (newEventData) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries("events");

            if (
                newEventData.repeatType != event.repeatType ||
                !newEventData.recurringEndDay?.hasSame(event.interval.end, "day") ||
                !newEventData.recurringEndDay?.hasSame(event.interval.end, "month") ||
                !newEventData.recurringEndDay?.hasSame(event.interval.end, "year") ||
                newEventData.forceRefetch
            ) {
                return;
            }

            const day = event.interval.start;
            const newDay = newEventData.eventDay;
            if (!day) {
                return;
            }

            // Snapshot the previous value
            const previousEventsForPrevDay = queryClient.getQueryData(["events", day.month, day.day, day.year]);

            // Optimistically update to the new value
            queryClient.setQueryData<CalendarEvent[]>(["events", day.month, day.day, day.year], (old) => {
                if (!old) {
                    return [];
                }
                if (!newEventData.eventDay?.hasSame(day, "day")) {
                    return old.filter((c) => c.id !== event.id);
                }
                return old.map((c) => {
                    if (c.id === event.id) {
                        console.log("updating event", c, newEventData);
                        return {
                            ...c,
                            ...newEventData,
                            daysOfWeek: newEventData.daysOfWeekString ?? c.daysOfWeek,
                        };
                    }
                    return c;
                });
            });

            let previousEventsForNewDay: CalendarEvent[] | undefined;

            if (newDay) {
                // Snapshot the previous value
                previousEventsForNewDay = queryClient.getQueryData(["events", newDay.month, newDay.day, newDay.year]);

                // Optimistically update to the new value
                queryClient.setQueryData<CalendarEvent[]>(["events", newDay.month, newDay.day, newDay.year], (old) => {
                    if (!old) {
                        return [];
                    }
                    if (!newEventData.eventDay?.hasSame(day, "day")) {
                        return old.filter((c) => c.id !== event.id);
                    }
                    return old.map((c) => {
                        if (c.id === event.id) {
                            return {
                                ...c,
                                ...newEventData,
                                daysOfWeek: newEventData.daysOfWeekString ?? c.daysOfWeek,
                            };
                        }
                        return c;
                    });
                });
            }

            queryClient.setQueryData<CalendarEvent>(["events", event.id], () => {
                return {
                    ...event,
                    ...newEventData,
                    daysOfWeek: newEventData.daysOfWeekString ?? event.daysOfWeek,
                };
            });

            // Return a context object with the snapshotted value
            return {
                previousEvents: previousEventsForPrevDay,
                day,
                previousEvent: event,
                newDay,
                previousEventsForNewDay,
            };
        },
        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (_err, _newCalendar, context) => {
            queryClient.setQueryData(
                ["events", context?.day?.month, context?.day?.day, context?.day?.year],
                context?.previousEvents
            );
            queryClient.setQueryData(["events", event.id], context?.previousEvent);
            if (context?.newDay) {
                queryClient.setQueryData(
                    ["events", context?.newDay?.month, context?.newDay?.day, context?.newDay?.year],
                    context?.previousEventsForNewDay
                );
            }
        },
        onSettled: (data, _error, _variables, context) => {
            queryClient.invalidateQueries(["events", context?.day?.month, context?.day?.day, context?.day?.year]);
            queryClient.invalidateQueries([
                "events",
                context?.newDay?.month,
                context?.newDay?.day,
                context?.newDay?.year,
            ]);
            queryClient.invalidateQueries(["events", event.id]);
            if (
                data.forceRefetch ||
                data.repeatType != event.repeatType ||
                !data.recurringEndDay?.hasSame(event.interval.end, "day") ||
                !data.recurringEndDay?.hasSame(event.interval.end, "month") ||
                !data.recurringEndDay?.hasSame(event.interval.end, "year")
            ) {
                console.log("invalidating quries");
                queryClient.invalidateQueries();
            }
        },
    });
}

function areArraysEqual(arr1: string[] | undefined, arr2: string[] | undefined) {
    if (!arr1 || !arr2) {
        return false;
    }
    if (arr1.length !== arr2.length) {
        return false;
    }
    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();
    return sortedArr1.every((a, i) => a === sortedArr2[i]);
}
