import { DateTime } from "luxon";
import { UseQueryOptions, useQuery } from "react-query";
import { dbCalendar } from "~/db/schema/main";
import { Calendar } from "~/lib/types";

export default function useGetCalendar(id: number, options?: UseQueryOptions<Calendar, { error: string }>) {
    return useQuery<Calendar, { error: string }>(["calendars", id], async () => {
        const response = await fetch(`/api/calendars/${id}`);

        const json = await response.json();

        if (json.error) {
            throw new Error(json.error);
        }

        const calendar = json as Calendar;

        return calendar;
    }, options);
}
