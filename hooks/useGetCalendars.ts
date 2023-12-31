import { DateTime } from "luxon";
import { UseQueryOptions, useQuery, useQueryClient } from "react-query";
import { dbCalendar } from "~/db/schema/main";
import { Calendar } from "~/lib/types";

export default function useGetCalendars(options?: UseQueryOptions<Calendar[], { error: string }>) {
    return useQuery<Calendar[], { error: string }>(["calendars"], async () => {
        const response = await fetch(`/api/calendars`);
        const dbCalendars = (await response.json()) as dbCalendar[];

        const calendars = dbCalendars.map((dbCalendar) => {
            return {
                id: dbCalendar.id,
                name: dbCalendar.name,
                color: dbCalendar.color,
                userId: dbCalendar.userId,
                isDefault: dbCalendar.isDefault,
            } as Calendar;
        });

        return calendars;
    });
}
