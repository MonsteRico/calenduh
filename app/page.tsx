import type { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { useQueryClient } from "react-query";
import MonthView from "~/components/monthView";
import TopBar from "~/components/topBar";
import { Tabs, TabsContent } from "~/components/ui/tabs";
import WeekView from "~/components/weekView";
import { CurrentViewContext, DayBeingViewedContext, EnabledCalendarIdsContext } from "~/hooks/contexts";
import useGetCalendars from "~/hooks/calendars/useGetCalendars";
import { fetchEvents } from "~/hooks/events/useGetEvents";
import { useToday } from "~/hooks/useToday";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SessionProvider, useSession } from "next-auth/react";
import DayView from "~/components/dayView";
import { redirect } from "next/navigation";
import getServerAuthSession from "~/lib/getServerAuthSession";
import ActualPage from "./actualPage";

export default async function Home() {
    const session = await getServerAuthSession();
    if (!session || !session.user) {
        // redirect to /api/auth/signin
        redirect("/api/auth/signin");
    }

    return (
        <ActualPage user={session.user} />
    )
}