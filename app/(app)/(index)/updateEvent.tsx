import { Button } from "@/components/Button";
import { router } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity, Platform } from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import React, { useEffect, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { Input } from "@/components/Input";
import { useColorScheme } from "nativewind";
import { useLocalSearchParams } from "expo-router";
import { useMyCalendars } from "@/hooks/calendar.hooks";
import { Calendar } from "@/types/calendar.types";
import DateTimePicker from "@react-native-community/datetimepicker";
import { DateTime } from "luxon";
import Dropdown from "@/components/Dropdown";
import { useCreateEvent, useEvent, useUpdateEvent } from "@/hooks/event.hooks";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/authContext";
export default function UpdateEvent() {
	const { eventId, calendarId } = useLocalSearchParams<{ eventId: string; calendarId: string }>();
	const { user } = useSession();
	const today = DateTime.now();
	function minuteToNearest15MinuteInterval(minute: number) {
		return Math.round(minute / 15) * 15;
	}

	const { data: event, isLoading: eventIsLoading } = useEvent(calendarId, eventId);

	const { colorScheme } = useColorScheme();
	const isPresented = router.canGoBack();

	const [name, setName] = useState(""); //Text box
	const [startDate, setStartDate] = useState<DateTime>(); //DateTimePicker
	const [endDate, setEndDate] = useState<DateTime>(); //DateTimePicker
	const [location, setLocation] = useState(""); //Text box
	const [description, setDescription] = useState(""); //Text box
	const [notify, setNotif] = useState(""); //Text box
	const [eventCalendarId, setEventCalendarId] = useState(""); //Single Select List
	const [freq, setFrequency] = useState(""); //Single Select List

	const [showStartDatePicker, setShowStartDatePicker] = useState(false);
	const [showStartTimePicker, setShowStartTimePicker] = useState(false);
	const [showEndDatePicker, setShowEndDatePicker] = useState(false);
	const [showEndTimePicker, setShowEndTimePicker] = useState(false);

	//REPLACE WITH USER'S CALENDARS
	const { data: calendars, isLoading: calendarsIsLoading } = useMyCalendars();

	const { mutate: updateEvent, isPending } = useUpdateEvent({
		onSuccess: () => {
			router.back();
		},
	});

	useEffect(() => {
		if (event) {
			setName(event.name);
			setStartDate(event.start_time);
			setEndDate(event.end_time);
			setLocation(event.location);
			setDescription(event.description);
			setNotif(event.notification);
			setEventCalendarId(event.calendar_id);
			setFrequency(event.frequency);
		}
	}, [event]);

	const globColor = colorScheme == "light" ? "black" : "white";

	if (calendarsIsLoading || eventIsLoading || !user) {
		return <Text className="text-primary">Loading...</Text>;
	}

	if (!event) {
		return <Text className="text-primary">Event not found</Text>;
	}

	if (!calendars) {
		return <Text className="text-primary">Calendars not found</Text>;
	}

	if (!user) {
		return <Text className="text-primary">User not found</Text>;
	}

	if (!eventCalendarId || !name || !startDate || !endDate || !eventCalendarId) {
		return <Text className="text-primary">All fields are required</Text>;
	}

	return (
		<View className="flex-1 bg-background">
			<View className="m-2 flex-row items-center">
				{isPresented && (
					<Button
						onPress={() => {
							router.back();
						}}
						className="text-primary"
					>
						Cancel
					</Button>
				)}

				<Text className="items-center pl-5 text-3xl font-bold text-primary">Create Event</Text>
			</View>

			<View className="mt-5 flex flex-col gap-2 px-8">
				<Input label="Name:" className="text-primary" value={name} onChangeText={setName} placeholder="Event Name" />
				<Input
					className="text-primary"
					label="Location:"
					value={location}
					onChangeText={setLocation}
					placeholder="Location"
				/>

				<Input
					label="Description:"
					className="text-primary"
					value={description}
					onChangeText={setDescription}
					placeholder="Description"
					multiline={true}
					numberOfLines={4}
				/>

				<Input
					label="Notification:"
					className="text-primary"
					value={notify}
					onChangeText={setNotif}
					placeholder="Notification"
					maxLength={100}
				/>

				<View className="flex-col gap-2">
					<Text className="text-primary">Calendar:</Text>

					<Dropdown<Calendar>
						options={calendars}
						renderItem={(calendar) => {
							return (
								<View className="flex flex-row items-center gap-2">
									<View className="h-6 w-6 rounded-full" style={{ backgroundColor: calendar.color }} />
									<Text className="text-primary">{calendar.title}</Text>
								</View>
							);
						}}
						onSelect={(selectedCalendar) => {
							setEventCalendarId(selectedCalendar.calendar_id);
						}}
					/>
				</View>

				<View className="flex-row items-center gap-2">
					<Text className="pr-[3] text-primary">Start Time:</Text>
					{Platform.OS === "android" && (
						<TouchableOpacity
							className="flex flex-row items-center space-x-2 rounded-lg bg-gray-200 px-4 py-2"
							onPress={() => setShowStartDatePicker(true)}
						>
							<Text className="font-medium text-primary">{startDate.toLocaleString(DateTime.DATETIME_MED)}</Text>
						</TouchableOpacity>
					)}
					{(showStartDatePicker || Platform.OS === "ios") && (
						<DateTimePicker
							value={startDate.toJSDate()}
							mode={"date"}
							onChange={(e, selectedDate) => {
								if (selectedDate && e.type === "set") {
									const luxonDate = DateTime.fromJSDate(selectedDate);
									setStartDate(luxonDate);
									setShowStartTimePicker(true);
								}
								setShowStartDatePicker(false);
							}}
						/>
					)}
					{(showStartTimePicker || Platform.OS === "ios") && (
						<DateTimePicker
							value={startDate.toJSDate()}
							is24Hour={false}
							mode={"time"}
							onChange={(e, selectedDate) => {
								if (selectedDate && e.type === "set") {
									const luxonDate = DateTime.fromJSDate(selectedDate);
									setStartDate(luxonDate);
								}
								setShowStartTimePicker(false);
							}}
						/>
					)}
				</View>

				<View className="flex-row items-center gap-2">
					<Text className="pr-[9] text-primary">End Time:</Text>
					{Platform.OS === "android" && (
						<TouchableOpacity
							className="flex flex-row items-center space-x-2 rounded-lg bg-gray-200 px-4 py-2"
							onPress={() => setShowEndDatePicker(true)}
						>
							<Text className="font-medium text-primary">{endDate.toLocaleString(DateTime.DATETIME_MED)}</Text>
						</TouchableOpacity>
					)}
					{(showEndDatePicker || Platform.OS === "ios") && (
						<DateTimePicker
							value={endDate.toJSDate()}
							is24Hour={false}
							mode={"date"}
							onChange={(e, selectedDate) => {
								if (selectedDate && e.type === "set") {
									const luxonDate = DateTime.fromJSDate(selectedDate);
									setEndDate(luxonDate);
									setShowEndTimePicker(true);
								}
								setShowEndDatePicker(false);
							}}
						/>
					)}
					{(showEndTimePicker || Platform.OS == "ios") && (
						<DateTimePicker
							value={endDate.toJSDate()}
							is24Hour={false}
							mode={"time"}
							onChange={(e, selectedDate) => {
								if (selectedDate && e.type === "set") {
									const luxonDate = DateTime.fromJSDate(selectedDate);
									setEndDate(luxonDate);
								}
								setShowEndTimePicker(false);
							}}
						/>
					)}
				</View>

				{/* Get this to send event to db */}
				<Button
					className={cn(isPending && "opacity-50")}
					onPress={() => {
						if (isPending || !eventCalendarId || !name || !startDate || !endDate) {
							return;
						}
						updateEvent({
							updatedEvent: {
								event_id: eventId,
								name,
								start_time: startDate,
								end_time: endDate,
								calendar_id: eventCalendarId,
								location,
								description,
								notification: notify,
								frequency : freq,
								priority: 0,
							},
							calendar_id: eventCalendarId,
						});
					}}
				>
					Update Event
				</Button>
			</View>
		</View>
	);
}
