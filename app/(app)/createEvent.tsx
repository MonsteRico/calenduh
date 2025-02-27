import { Button } from "@/components/Button";
import { router } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import React, { useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { Input } from "@/components/Input";
import { useColorScheme } from "nativewind";
import { useLocalSearchParams } from "expo-router";
import { useMyCalendars } from "@/hooks/calendar.hooks";
import { Calendar } from "@/types/calendar.types";
import DateTimePicker from "@react-native-community/datetimepicker";
import { DateTime } from "luxon";
import Dropdown from "@/components/Dropdown";
export default function CreateEvent() {
	const today = DateTime.now();
	function minuteToNearest15MinuteInterval(minute: number) {
		return Math.round(minute / 15) * 15;
	}
	const { givenDate } = useLocalSearchParams<{ givenDate: string }>();
	let eventDay = givenDate != null ? DateTime.fromISO(givenDate as string) : today;
	eventDay = eventDay.set({ hour: today.hour, minute: minuteToNearest15MinuteInterval(today.minute) });

	const { colorScheme } = useColorScheme();
	const isPresented = router.canGoBack();

	const [name, setName] = useState(""); //Text box
	const [startDate, setStartDate] = useState(eventDay != null ? eventDay : today); //DateTimePicker
	const [endDate, setEndDate] = useState(eventDay.plus({ hours: 1 })); //DateTimePicker
	const [location, setLocation] = useState(""); //Text box
	const [description, setDescription] = useState(""); //Text box
	const [notify, setNotif] = useState(""); //Text box
	const [eventCalendarId, setEventCalendarId] = useState<string>(""); //Single Select List
	const [freq, setFrequency] = useState(""); //Single Select List

	const [showStartDatePicker, setShowStartDatePicker] = useState(false);
	const [showStartTimePicker, setShowStartTimePicker] = useState(false);
	const [showEndDatePicker, setShowEndDatePicker] = useState(false);
	const [showEndTimePicker, setShowEndTimePicker] = useState(false);


	//REPLACE WITH USER'S CALENDARS
	const { data: calendars, isLoading } = useMyCalendars();

	const globColor = colorScheme == "light" ? "black" : "white";

	if (isLoading || !calendars) {
		return <Text className="text-primary">Loading...</Text>;
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
					<Text className='text-primary pr-[3]'>Start Time:</Text>
					<TouchableOpacity
						className='bg-gray-200 px-4 py-2 rounded-lg flex flex-row items-center space-x-2'
						onPress={() => setShowStartDatePicker(true)}
					>
						<Text className='text-primary font-medium'>{startDate.toLocaleString(DateTime.DATETIME_MED)}</Text>
					</TouchableOpacity>
					{showStartDatePicker && (
						<DateTimePicker
							value={startDate.toJSDate()}
							mode={"date"}
							onChange={(e, selectedDate) => {
								if (selectedDate) {
									const luxonDate = DateTime.fromJSDate(selectedDate);
									setStartDate(luxonDate);
									setShowStartTimePicker(true);
								}
								setShowStartDatePicker(false);
							}}
						/>
					)}
					{showStartTimePicker && (
						<DateTimePicker
							value={startDate.toJSDate()}
							is24Hour={false}
							mode={"time"}
							onChange={(e, selectedDate) => {
								if (selectedDate) {
									const luxonDate = DateTime.fromJSDate(selectedDate);
									setStartDate(luxonDate);
								}
								setShowStartTimePicker(false);
							}}
						/>
					)}
				</View>

				<View className="flex-row items-center gap-2">
					<Text className="text-primary pr-[9]">End Time:</Text>
					<TouchableOpacity
						className='bg-gray-200 px-4 py-2 rounded-lg flex flex-row items-center space-x-2'
						onPress={() => setShowEndDatePicker(true)}
					>
						<Text className='text-primary font-medium'>{endDate.toLocaleString(DateTime.DATETIME_MED)}</Text>
					</TouchableOpacity>
					{showEndDatePicker && (
						<DateTimePicker
							value={endDate.toJSDate()}
							is24Hour={false}
							mode={"date"}
							onChange={(e, selectedDate) => {
								if (selectedDate) {
									const luxonDate = DateTime.fromJSDate(selectedDate);
									setEndDate(luxonDate);
									setShowEndTimePicker(true);
								}
								setShowEndDatePicker(false);
							}}
						/>
					)}
					{showEndTimePicker && (
						<DateTimePicker
							value={endDate.toJSDate()}
							is24Hour={false}
							mode={"time"}
							onChange={(e, selectedDate) => {
								if (selectedDate) {
									const luxonDate = DateTime.fromJSDate(selectedDate);
									setEndDate(luxonDate);
								}
								setShowEndTimePicker(false);
							}}
						/>
					)}
				</View>

				{/* Get this to send event to db */}
				<Button>Create Event</Button>
			</View>
		</View>
	);
} 