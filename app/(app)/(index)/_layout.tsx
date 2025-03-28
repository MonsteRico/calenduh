import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";

export default function MainCalendarLayout() {
	const { colorScheme } = useColorScheme()
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { flex: 1, backgroundColor: colorScheme === "dark" ? "#030711" : "white" },
			}}
		>
			<Stack.Screen name="updateEvent" options={{ presentation: "modal" }} />
			<Stack.Screen
				name="createEvent"
				options={{
					presentation: "modal",
				}}
			/>
			<Stack.Screen name="agenda" />
			<Stack.Screen
				name="updateCalendar"
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

			<Stack.Screen
				name="dayView"
				options={{
					presentation: "modal",
				}}
			/>

			<Stack.Screen
				name="weekView"
				options={{
					presentation: "modal",
				}}
			/>
		</Stack>
	);
}
