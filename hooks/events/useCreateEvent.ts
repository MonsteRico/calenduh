import { DateTime, Interval } from "luxon";
import { useMutation, useQueryClient } from "react-query";
import { Calendar, CalendarEvent } from "~/lib/types";

export default function useCreateEvent() {
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
        }: {
            title: string;
            eventDay: DateTime<true>;
            recurringEndDay: DateTime<true> | null;
            calendarId: number;
            allDay: boolean;
            daysOfWeekString: string;
            repeatType: "daily" | "weekly" | "monthly" | "yearly" | "none";
            startTime: DateTime<true>;
            endTime: DateTime<true>;
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

            const res = await fetch(`/api/events`, {
                method: "POST",
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

            const day = DateTime.fromObject({
                day: newEventData.eventDay.day,
                month: newEventData.eventDay.month,
                year: newEventData.eventDay.year,
            });

            // Snapshot the previous value
            const previousEventsForPrevDay = queryClient.getQueryData(["events", day.month, day.day, day.year]);

            // Optimistically update to the new value
            queryClient.setQueryData<CalendarEvent[]>(["events", day.month, day.day, day.year], (old) => {
                if (!old) {
                    return [];
                }
                return [
                    ...old,
                    {
                        daysOfWeek: newEventData.daysOfWeekString ?? "",
                        id: Math.floor(Math.random() * 1000),
                        interval: Interval.fromDateTimes(
                            DateTime.fromObject({
                                day: newEventData.eventDay.day,
                                month: newEventData.eventDay.month,
                                year: newEventData.eventDay.year,
                                hour: newEventData.startTime.hour,
                                minute: newEventData.startTime.minute,
                            }),
                            DateTime.fromObject({
                                day: newEventData.eventDay.day,
                                month: newEventData.eventDay.month,
                                year: newEventData.eventDay.year,
                                hour: newEventData.endTime.hour,
                                minute: newEventData.endTime.minute,
                            })
                        ) as Interval<true>,
                        allDay: newEventData.allDay,
                        calendarId: newEventData.calendarId,
                        numConflicts: 0,
                        repeatType: newEventData.repeatType,
                        title: newEventData.title,
                        recurringEndDay: newEventData.recurringEndDay,
                        calendar: {} as Calendar,
                        userId: "",
                    },
                ];
            });

            // Return a context object with the snapshotted value
            return {
                previousEvents: previousEventsForPrevDay,
                day,
            };
        },
        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (_err, _newCalendar, context) => {
            queryClient.setQueryData(
                ["events", context?.day?.month, context?.day?.day, context?.day?.year],
                context?.previousEvents
            );
        },
        onSettled: (data, _error, _variables, context) => {
            queryClient.invalidateQueries(["events", context?.day?.month, context?.day?.day, context?.day?.year]);
            if (data.repeatType != "none") {
                console.log("invalidating quries");
                queryClient.invalidateQueries();
            }
        },
    });
}
