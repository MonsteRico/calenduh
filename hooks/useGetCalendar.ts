import { DateTime } from "luxon";
import { UseQueryOptions, useQuery } from "react-query";
import { dbCalendar } from "~/lib/schema";
import { Calendar } from "~/lib/types";

export default function useGetCalendar(id:number, options?: UseQueryOptions<Calendar, { error: string }>) {
    return useQuery<Calendar, { error: string }>(["calendars", id], async () => {
        const response = await fetch(`/api/calendars/${id}}`);
        const calendar = (await response.json()) as Calendar;


        return calendar;
    });
}
