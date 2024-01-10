import { DateTime } from "luxon";
import { UseQueryOptions, useQuery } from "react-query";
import eventsConverter from "~/lib/eventsConverter";
import { dbCalendar, dbCalendarEvent } from "~/db/schema/main";
import { Calendar, CalendarEvent, UserPreferences } from "~/lib/types";
import { useUser } from "../useUser";

export default function useGetUserPreferences(options?: UseQueryOptions<UserPreferences, { error: string }>) {
    const user = useUser();
    return useQuery<UserPreferences, { error: string }>(
        ["preferences", user?.id],
        async () => {
            const response = await fetch(`/api/me/preferences`);
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            return data as UserPreferences;
        },
        options
    );
}
