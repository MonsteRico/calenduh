import { DateTime } from "luxon";
import { UseQueryOptions, useQuery, useQueryClient } from "react-query";
import { dbCalendar } from "~/db/schema/main";
import { Calendar } from "~/lib/types";

export default function useGetCalendars(options?: UseQueryOptions<Calendar[], { error: string }>) {
    return useQuery<Calendar[], { error: string }>(["calendars"], async () => {
        const response = await fetch(`/api/calendars`);
        const {myCalendars, subscribedCalendars} = (await response.json()) as {myCalendars: Calendar[], subscribedCalendars: Calendar[]};

        const calendars = myCalendars.map((dbCalendar) => {
            return {
                id: dbCalendar.id,
                name: dbCalendar.name,
                color: dbCalendar.color,
                userId: dbCalendar.userId,
                isDefault: dbCalendar.isDefault,
                subscribeCode: dbCalendar.subscribeCode,
                subscribed: false,
            } as Calendar;
        });

        const subscribed = subscribedCalendars.map((dbCalendar) => {
            return {
                id: dbCalendar.id,
                name: dbCalendar.name,
                color: dbCalendar.color,
                userId: dbCalendar.userId,
                isDefault: dbCalendar.isDefault,
                subscribeCode: dbCalendar.subscribeCode,
                subscribed: true,
            } as Calendar;
        });

        return [...calendars, ...subscribed];
    });
}
