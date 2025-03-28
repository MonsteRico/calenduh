import { cn } from "@/lib/utils";
import { DateTime, Interval } from "luxon";
import React, { Fragment } from "react";
import { Dimensions, Platform, Pressable, Text, View } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { useCurrentViewedDay } from "@/hooks/useCurrentViewedDay";
import { router } from "expo-router";
import { TapGestureHandler } from "react-native-gesture-handler";
import { useEventsForDay, useEventsForInterval } from "@/hooks/event.hooks";
import { useEnabledCalendarIds } from "@/hooks/useEnabledCalendarIds";
import { useCalendar } from "@/hooks/calendar.hooks";
	import { useMemo } from "react";

function Month({ month, year }: { month: number; year: number }) {
    const screenWidth = Dimensions.get("window").width;
    const monthHeight = Platform.OS === "web" ? Dimensions.get("window").height - 150 : screenWidth * 0.9;

	const thisMonth = DateTime.fromObject({year, month}) as DateTime<true>

    const days = getDaysForMonth(thisMonth);

	const firstDayOfMonth = days[0].startOf("day")
	const lastDayOfMonth = days[days.length - 1].endOf("day")
	console.log(firstDayOfMonth, lastDayOfMonth)
	const {data:monthsEvents, isLoading} = useEventsForInterval(Interval.fromDateTimes(firstDayOfMonth, lastDayOfMonth) as Interval<true>);

	if (isLoading) {
		return (
			<View
				style={{
					width: screenWidth,
					height: monthHeight,
				}}
				className="my-auto flex flex-1 flex-col justify-center"
			>
				<Text className="text-blue-500">Loading...</Text>
			</View>
		);
	}

	if (!monthsEvents) {
		return (
			<View
				style={{
					width: screenWidth,
					height: monthHeight,
				}}
				className="my-auto flex flex-1 flex-col justify-center"
			>
				<Text className="text-red-500">This shouldn't happen. Uh oh.</Text>
			</View>
		);
	}

	return (
		<View
			style={{
				width: screenWidth,
				height: monthHeight,
			}}
			className="my-auto flex flex-1 flex-col justify-center"
		>
            <Text className="mt-4 text-xl font-bold text-primary text-center">{DateTime.fromObject({ year, month }).toFormat("MMMM yyyy")}</Text>
			<View className="mb-2 flex w-full flex-row justify-center text-center text-xl">
				<Text className="basis-1/7 w-full text-center text-primary">Sun</Text>
				<Text className="basis-1/7 w-full text-center text-primary">Mon</Text>
				<Text className="basis-1/7 w-full text-center text-primary">Tue</Text>
				<Text className="basis-1/7 w-full text-center text-primary">Wed</Text>
				<Text className="basis-1/7 w-full text-center text-primary">Thu</Text>
				<Text className="basis-1/7 w-full text-center text-primary">Fri</Text>
				<Text className="basis-1/7 w-full text-center text-primary">Sat</Text>
			</View>
			<View className="flex flex-1 flex-row flex-wrap justify-center">
				{days.map((day, i) => {
					return <Day key={i} day={day} currentMonth={month == day.month} bottomRow={Math.floor(i / 7) == 5} />;
				})}
			</View>
		</View>
	);
}

function getDaysForMonth(month: DateTime<true>) {
	const daysBeforeFirst = month.set({ day: 1 }).weekday;
	const daysAfterLast = 13 - month.set({ day: month.daysInMonth }).weekday;
	const daysInPreviousMonth = month.minus({ month: 1 }).daysInMonth;
	const daysInNextMonth = month.plus({ month: 1 }).daysInMonth;

	// make an array of all the days shown in the current view
	return Array.from({ length: daysInPreviousMonth }, (_, i) =>
		month
			.minus({ month: 1 })
			.startOf("day")
			.set({ day: i + 1 })
	)
		.slice(-daysBeforeFirst)
		.concat(Array.from({ length: month.daysInMonth }, (_, i) => month.startOf("day").set({ day: i + 1 })))
		.concat(
			Array.from({ length: daysInNextMonth }, (_, i) =>
				month
					.plus({ month: 1 })
					.startOf("day")
					.set({ day: i + 1 })
			).slice(0, daysAfterLast)
		)
		.slice(0, 42) as DateTime<true>[];
}

function Day({ day, currentMonth, bottomRow = false }: { day: DateTime<true>; currentMonth: boolean; bottomRow?: boolean }) {
	const dayNumber = day.day;
	const dayIsSaturday = day.weekday === 6;
	const isToday = day.hasSame(DateTime.now(), "day");

	const { dayBeingViewed, setDayBeingViewed } = useCurrentViewedDay();
	const { enabledCalendarIds } = useEnabledCalendarIds();

	const onDoubleTap = () => {
		router.navigate(`/createEvent?givenDate=${day.toISODate()}`);
	};

	const { data: events, isLoading } = useEventsForDay(day, { enabled: false });

	const calendarsForShownEvents = useMemo(() => {
		if (!events) {
			return [];
		}
		// Filter events based on enabled calendar IDs
		const shownEvents = events.filter((event) => enabledCalendarIds.includes(event.calendar_id));

		// Create a list of unique calendar IDs
		return shownEvents
			.map((event) => event.calendar_id)
			.reduce((acc, curr) => {
				if (!acc.includes(curr)) {
					acc.push(curr);
				}
				return acc;
			}, [] as string[]);
	}, [enabledCalendarIds, events]); // Memoize based on changes to enabledCalendarIds or events

	if (isLoading) {
		return <Text className="text-primary">A</Text>;
	}

	return (
		<TapGestureHandler numberOfTaps={2} onActivated={onDoubleTap}>
			<Pressable
				className={cn(
					"relative flex w-full basis-1/7 items-center justify-center border-l-4 border-t-4 border-muted text-2xl",
					dayIsSaturday && "border-r-4",
					bottomRow && "border-b-4"
				)}
				onPress={() => {
					console.log("Day pressed", day.toISODate());
					setDayBeingViewed(day);
					router.navigate('/weekView');
					//router.navigate('/dayView');
					//router.navigate(`/agenda`);
				}}
			>
				<Text
					className={cn(
						"text-lg",
						currentMonth ? "font-bold text-primary" : "text-muted-foreground",
						isToday && "text-green-500",
						dayBeingViewed.hasSame(day, "day") && "underline"
					)}
				>
					{dayNumber}
				</Text>
				<View className="flex flex-row items-center justify-center">
					{calendarsForShownEvents.map((calendarId) => (
						<EventDot key={calendarId} calendarId={calendarId} />
					))}
					{calendarsForShownEvents.length === 0 && <Entypo className={cn("invisible")} name="dot-single" size={24} />}
				</View>
			</Pressable>
		</TapGestureHandler>
	);
}

function EventDot({ calendarId }: { calendarId: string }) {
	const { data: calendar } = useCalendar(calendarId);
	if (!calendar) {
		return null;
	}
	return <Entypo name="dot-single" size={24} color={calendar.color} />;
}

export default Month;
