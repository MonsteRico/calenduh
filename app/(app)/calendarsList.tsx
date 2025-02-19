import { Button } from "@/components/Button";
import { router } from "expo-router";
import { Text, View, ScrollView } from "react-native";
import { Checkbox } from "@/components/Checkbox";
import { Accordion } from "@/components/Accordion";
import { useState } from "react";

interface example_calendar {
	name: string;
	color: string;
	id: string;
}

const calendars: example_calendar[] = [
	{ name: "Calendar1", color: "#0000FF", id: "a" },
	{ name: "Calendar2", color: "#d42245", id: "b" },
	{ name: "Calendar3", color: "#0a571e", id: "c" },
];

export default function CalendarsList({ toggleDrawer }: { toggleDrawer: () => void }) {
	const [editMode, setEditMode] = useState(false);
	const { enabledCalendarIds, setEnabledCalendarIds } = useEnabledCalendarIds();

	const editOnPress = () => {
		router.navigate("/calendarInfoView");
		setEditMode(false);
	};

	const toggleCalendar = (calendarId: string) => {
		if (enabledCalendarIds.includes(calendarId)) {
			setEnabledCalendarIds(enabledCalendarIds.filter((id) => id !== calendarId));
		} else {
			setEnabledCalendarIds([...enabledCalendarIds, calendarId]);
		}
	};

	return (
		<ScrollView className="mb-20 flex w-full flex-col gap-3">
			<Accordion title={"My Calendars"} defaultOpen className="mb-5 text-primary">
				<View className="flex h-auto flex-col gap-2">
					{calendars.map((calendar, i) => (
						<CalendarItem
							checked={enabledCalendarIds.includes(calendar.id)}
							key={calendar.name}
							calendarName={calendar.name}
							calendarColor={calendar.color}
							editMode={editMode}
							onPress={
								editMode
									? editOnPress
									: () => {
											toggleCalendar(calendar.id);
										}
							}
						/>
					))}
				</View>
			</Accordion>

			<Accordion title={"Group Calendars"} className="mb-5">
				<View className="flex h-auto flex-col gap-2">
					{calendars.map((calendar, i) => (
						<CalendarItem
							checked={enabledCalendarIds.includes(calendar.id)}
							key={calendar.name}
							calendarName={calendar.name}
							calendarColor={calendar.color}
							editMode={editMode}
							onPress={
								editMode
									? editOnPress
									: () => {
											toggleCalendar(calendar.id);
										}
							}
						/>
					))}
				</View>
			</Accordion>

			<Accordion title={"Other Calendars"}>
				<View className="flex h-auto flex-col gap-2">
					{calendars.map((calendar, i) => (
						<CalendarItem
							checked={enabledCalendarIds.includes(calendar.id)}
							key={calendar.name}
							calendarName={calendar.name}
							calendarColor={calendar.color}
							editMode={editMode}
							onPress={
								editMode
									? editOnPress
									: () => {
											toggleCalendar(calendar.id);
										}
							}
						/>
					))}
				</View>
			</Accordion>
			<Button
				labelClasses="text-secondary"
				onPress={() => {
					toggleDrawer();
					router.navigate("/createCalendar");
					setEditMode(false);
				}}
				className="mt-5"
			>
				Add Calendar
			</Button>

			<Button
				labelClasses="text-secondary"
				onPress={() => {
					setEditMode(!editMode);
				}}
				className="mt-5"
			>
				{editMode ? "Cancel" : "Edit Calendar"}
			</Button>
		</ScrollView>
	);
}

import {Pressable, TouchableOpacity, } from "react-native";
import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useEnabledCalendarIds } from "@/hooks/useEnabledCalendarIds";
interface CalendarItemProps extends React.ComponentPropsWithoutRef<typeof TouchableOpacity> {
	calendarName: string;
	calendarColor: string;
	onPress: () => void;
	checked: boolean; // parent checked doesn't propogate yet, TODO depending on how we store state information
	editMode: boolean;
}

function CalendarItem({
	calendarName: name,
	calendarColor: color,
	editMode = false,
	checked = false,
	onPress,
}: CalendarItemProps) {
	const [isChecked, setIsChecked] = useState(checked);
	return (
		<View>
			{editMode ? (
				<Pressable
					className="w-full flex-row items-center gap-3 self-start rounded-md bg-transparent py-2 active:bg-muted"
					onPress={onPress}
				>
					<FontAwesome name="pencil-square-o" size={24} style={{ color }} />
					<Text className="text-lg text-primary">{name}</Text>
				</Pressable>
			) : (
				<Pressable
					className="w-full flex-row items-center gap-3 self-start rounded-md bg-transparent py-2 active:bg-muted"
					onPress={() => {
						setIsChecked(!isChecked);
						onPress();
					}}
				>
					<Checkbox
						checked={isChecked}
						onCheck={setIsChecked}
						color={color}
						checkSymbol={false}
						checkboxClasses="border-2"
					/>
					<Text className="text-lg text-primary">{name}</Text>
				</Pressable>
			)}
		</View>
	);
}