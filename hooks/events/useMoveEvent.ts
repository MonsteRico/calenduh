import { DateTime, Interval } from "luxon";
import { useMutation, useQueryClient } from "react-query";
import { Calendar, CalendarEvent } from "~/lib/types";

export default function useMoveEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            event,
            newDay,
            newStartTime,
            newEndTime,
        }: {
            event: CalendarEvent;
            newDay?: DateTime<true>;
            newStartTime?: DateTime<true>;
            newEndTime?: DateTime<true>;
        }) => {
            if (!(newDay || (newStartTime && newEndTime))) {
                return;
            }

            const res = await fetch(`/api/events/${event.id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    startDay: newDay?.day ?? event.interval.start.day,
                    startMonth: newDay?.month ?? event.interval.start.month,
                    startYear: newDay?.year ?? event.interval.start.year,
                    startTime:
                        newStartTime?.toLocaleString(DateTime.TIME_24_SIMPLE) ??
                        event.interval.start.toLocaleString(DateTime.TIME_24_SIMPLE),
                    endTime:
                        newEndTime?.toLocaleString(DateTime.TIME_24_SIMPLE) ??
                        event.interval.end.toLocaleString(DateTime.TIME_24_SIMPLE),
                }),
            });
            return res.json();
        },
        // When mutate is called:
        onMutate: async ({ event, newDay, newStartTime, newEndTime }) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries("events");

            const day = event.interval.start;

            // Snapshot the previous value
            const previousEventsForPrevDay = queryClient.getQueryData(["events", day.month, day.day, day.year]);

            // Optimistically update to the new value
            queryClient.setQueryData<CalendarEvent[]>(["events", day.month, day.day, day.year], (old) => {
                if (!old) {
                    return [];
                }
                if (!newDay?.hasSame(day, "day")) {
                    return old.filter((c) => c.id !== event.id);
                }
                return old.map((c) => {
                    if (c.id === event.id) {
                        c.interval.start.set({
                            day: newDay.day ?? event.interval.start.day,
                            month: newDay.month ?? event.interval.start.month,
                            year: newDay.year ?? event.interval.start.year,
                            hour: newStartTime?.hour ?? event.interval.start.hour,
                            minute: newStartTime?.minute ?? event.interval.start.minute,
                        });
                        c.interval.end.set({
                            day: newDay.day ?? event.interval.end.day,
                            month: newDay.month ?? event.interval.end.month,
                            year: newDay.year ?? event.interval.end.year,
                            hour: newEndTime?.hour ?? event.interval.end.hour,
                            minute: newEndTime?.minute ?? event.interval.end.minute,
                        });
                        return {
                            ...c,
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
                    return old.map((c) => {
                        if (c.id === event.id) {
                            c.interval.start.set({
                                day: newDay.day ?? event.interval.start.day,
                                month: newDay.month ?? event.interval.start.month,
                                year: newDay.year ?? event.interval.start.year,
                                hour: newStartTime?.hour ?? event.interval.start.hour,
                                minute: newStartTime?.minute ?? event.interval.start.minute,
                            });
                            c.interval.end.set({
                                day: newDay.day ?? event.interval.end.day,
                                month: newDay.month ?? event.interval.end.month,
                                year: newDay.year ?? event.interval.end.year,
                                hour: newEndTime?.hour ?? event.interval.end.hour,
                                minute: newEndTime?.minute ?? event.interval.end.minute,
                            });
                            return {
                                ...c,
                            };
                        }
                        return c;
                    });
                });
            }

            queryClient.setQueryData<CalendarEvent>(["events", event.id], () => {
                return {
                    ...event,
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
        onError: (_err, newData, context) => {
            queryClient.setQueryData(
                ["events", context?.day?.month, context?.day?.day, context?.day?.year],
                context?.previousEvents
            );
            queryClient.setQueryData(["events", newData.event.id], context?.previousEvent);
            if (context?.newDay) {
                queryClient.setQueryData(
                    ["events", context?.newDay?.month, context?.newDay?.day, context?.newDay?.year],
                    context?.previousEventsForNewDay
                );
            }
        },
        onSettled: (data, _error, variables, context) => {
            queryClient.invalidateQueries(["events", context?.day?.month, context?.day?.day, context?.day?.year]);
            queryClient.invalidateQueries([
                "events",
                context?.newDay?.month,
                context?.newDay?.day,
                context?.newDay?.year,
            ]);
            queryClient.invalidateQueries(["events", variables.event.id]);
        },
    });
}
