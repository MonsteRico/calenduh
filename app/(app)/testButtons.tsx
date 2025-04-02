import { Button } from "@/components/Button";
import { router } from "expo-router";
import { Text, View, ScrollView } from "react-native";
import { Checkbox } from "@/components/Checkbox";
import { Accordion } from "@/components/Accordion";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCalendars } from "@/hooks/calendar.hooks";
import { useSQLiteContext } from "expo-sqlite";
import * as Notifications from "expo-notifications"
import { getCalendarsFromDB } from "@/lib/calendar.helpers";
import { useIsConnected } from "@/hooks/useIsConnected";
import { useEnabledCalendarIds } from "@/hooks/useEnabledCalendarIds";
import { setEnabled } from "react-native/Libraries/Performance/Systrace";
import { useDbVersion } from "@/hooks/useDbVersion";
import { deleteEventsUntilFromDB, deleteEventsUntilNowOnServer } from "@/lib/event.helpers";
import { DateTime } from "luxon";

export default function TestButtons() {
	const isPresented = router.canGoBack();
	const queryClient = useQueryClient();
	const { data: calendars, isLoading } = useCalendars();
	const isConnected = useIsConnected();
	const db = useSQLiteContext();
	const dbVersion = useDbVersion()
	const { setEnabledCalendarIds } = useEnabledCalendarIds();
	return (
		<View className="flex-1 bg-background">
			<View className="items-left flex-row flex-wrap gap-4">
				<Button onPress={() => {setEnabledCalendarIds([])}}>Reset Enabled Ids</Button>

				<Button onPress={() => {}}>Update Calendar</Button>
				<Button onPress={() => {}}>Delete Calendar</Button>
				<Button
					onPress={() => {
						queryClient.invalidateQueries({ queryKey: ["calendars"] });
						queryClient.setQueryData(["calendars"], []);
					}}
				>
					Invalidate calendars
				</Button>
				<Button
					onPress={async () => {
						await db.execAsync(`PRAGMA user_version = 0`);
						await db.execAsync(`DROP TABLE IF EXISTS calendars`);
						await db.execAsync(`DROP TABLE IF EXISTS events`);
						await db.execAsync(`DROP TABLE IF EXISTS subscriptions`);
						await db.execAsync(`DROP TABLE IF EXISTS mutations`);
						await Notifications.cancelAllScheduledNotificationsAsync()
						console.log("DB RESET COMPLETELY, RELOAD THE APP");
					}}
				>
					Reset DB COMPLETELY
				</Button>
				<Text className="text-primary">DB Version: {dbVersion}</Text>
				<View className="items-left flex-row flex-wrap gap-4">
					<Button
						onPress={() => {
							console.log("isConnected", isConnected);
						}}
					>
						Check is connected
					</Button>
					<Text className="text-red-500">{isConnected ? "Connected" : "Not Connected"}</Text>
				</View>
			</View>
			{!isLoading && calendars && (
				<View className="items-left flex-row flex-wrap gap-4">
					{calendars?.map((calendar) => (
						<Button
							key={calendar.calendar_id}
							onPress={() => {
								console.log("calendar", calendar);
							}}
						>
							{calendar.title}
						</Button>
					))}
				</View>
			)}
		</View>
	);
}
