import { Button } from "@/components/Button";
import { router } from "expo-router";
import { Text, View, ScrollView } from "react-native";
import { Checkbox } from "@/components/Checkbox";
import { Accordion } from "@/components/Accordion";
import { useState } from "react";
import { CalendarItem } from "@/components/CalendarItem";

interface example_calendar {
	name: string;
	color: string;
}

const calendars: example_calendar[] = [
	{ name: "Calendar1", color: "#0000FF" },
	{ name: "Calendar2", color: "#d42245" },
	{ name: "Calendar3", color: "#0a571e" },
];

export default function CalendarsList({ toggleDrawer }: { toggleDrawer: () => void }) {
	const [editMode, setEditMode] = useState(false);

	const editOnPress = () => {
		router.navigate("/calendarInfoView");
	}

	return (
		<ScrollView className="flex w-full flex-col gap-3 mb-20">
				<Accordion title={"My Calendars"} defaultOpen className="mb-5 text-primary">
					<View className="flex flex-col gap-2 h-auto">
						{calendars.map((calendar, i) => (
							<CalendarItem key={calendar.name} calendarName={calendar.name} calendarColor={calendar.color} editMode={editMode} onPress={editOnPress} />
						))}
					</View>
				</Accordion>

				<Accordion title={"Group Calendars"} className="mb-5">
					<View className="flex flex-col gap-2 h-auto">
						{calendars.map((calendar, i) => (
							<CalendarItem key={calendar.name} calendarName={calendar.name} calendarColor={calendar.color} editMode={editMode} onPress={editOnPress}/>
						))}
					</View>
				</Accordion>

				<Accordion title={"Other Calendars"}>
					<View className="flex flex-col gap-2 h-auto">
						{calendars.map((calendar, i) => (
							<CalendarItem key={calendar.name} calendarName={calendar.name} calendarColor={calendar.color} editMode={editMode} onPress={editOnPress}/>
						))}
					</View>
				</Accordion>
				<Button
					labelClasses="text-secondary"
					onPress={() => {
						toggleDrawer();
						router.navigate("/createCalendar");
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
					Edit Calendar
				</Button>
		</ScrollView>
	);
}
