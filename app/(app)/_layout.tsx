import { Text, View } from "react-native";
import { Redirect, Slot, Stack } from "expo-router";
import { useSession } from "@/hooks/authContext";
import { useColorScheme } from "nativewind";
import { cn } from "@/lib/utils";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { DayBeingViewedContext } from "@/hooks/useCurrentViewedDay";
import { DateTime } from "luxon";
import { EnabledCalendarIdsContext } from "@/hooks/useEnabledCalendarIds";

export default function AppLayout() {
	const { sessionId, isLoading } = useSession();
	const { colorScheme } = useColorScheme();

	const [dayBeingViewed, setDayBeingViewed] = useState(DateTime.now());
	const [enabledCalendarIds, setEnabledCalendarIds] = useState<string[]>([]);

	useEffect(() => {
		console.log("sessionId", sessionId);
	}, [sessionId]);

	// You can keep the splash screen open, or render a loading screen like we do here.
	if (isLoading) {
		return <Text style={{ color: "#fac806", fontSize: 45 }}>Loading...</Text>;
	}

	// Only require authentication within the (app) group's layout as users
	// need to be able to access the (auth) group and sign in again.
	if (!sessionId) {
		console.log("no sessionId");
		// On web, static rendering will stop here as the user is not authenticated
		// in the headless Node process that the pages are rendered in.
		return <Redirect href="/sign-in" />;
	}

	// This layout can be deferred because it's not the root layout.
	return (
		<DayBeingViewedContext.Provider
			value={{
				value: dayBeingViewed,
				setValue: setDayBeingViewed,
			}}
		>
			<EnabledCalendarIdsContext.Provider
				value={{
					value: enabledCalendarIds,
					setValue: setEnabledCalendarIds,
				}}
			>
				<Stack
					screenOptions={{
						headerShown: false,
						contentStyle: { flex: 1, backgroundColor: colorScheme === "dark" ? "#030711" : "white" },
					}}
				>
					<Stack.Screen name="index" />
					<Stack.Screen
						name="createEvent"
						options={{
							presentation: "modal",
						}}
					/>
					<Stack.Screen
						name="calendarsList"
						options={{
							presentation: "modal",
						}}
					/>
					<Stack.Screen
						name="calendarInfoView"
						options={{
							presentation: "modal",
						}}
					/>

					<Stack.Screen
						name="createCalendar"
						options={{
							presentation: "modal",
						}}
					/>
				</Stack>
			</EnabledCalendarIdsContext.Provider>
		</DayBeingViewedContext.Provider>
	);
}
