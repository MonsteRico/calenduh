import { Button } from "@/components/Button";
import { router } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity, Platform, Switch } from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import React, { useEffect, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { Input } from "@/components/Input";
import { useColorScheme } from "nativewind";
import { useLocalSearchParams } from "expo-router";
import { useMyCalendars } from "@/hooks/calendar.hooks";
import { Calendar } from "@/types/calendar.types";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { DateTime } from "luxon";
import Dropdown from "@/components/Dropdown";
import { useCreateEvent } from "@/hooks/event.hooks";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/authContext";
import { NotificationTimes } from "@/constants/notificationTimes";
import { DismissKeyboardView } from "@/components/DismissKeyboardView";
import Storage from "expo-sqlite/kv-store";
import RecurrenceSelector from "@/components/RecurrenceSelector";
import { ScrollView } from "react-native-gesture-handler";

export default function CreateEvent() {
	const { user } = useSession();
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
	const [firstNotification, setFirstNotification] = useState<number | null>(
		NotificationTimes.FIFTEEN_MINUTES_MS
	);
	const [secondNotification, setSecondNotification] = useState<number | null>(
		NotificationTimes.NONE
	);
	const [eventCalendarId, setEventCalendarId] = useState<string>(""); //Single Select List
	const [frequency, setFrequency] = useState<null | string>(null);
	const [priority, setPriority] = useState<number>(0); //Single Select List
	const [isAllDay, setIsAllDay] = useState(false);

	const [showStartDatePicker, setShowStartDatePicker] = useState(false);
	const [showStartTimePicker, setShowStartTimePicker] = useState(false);
	const [showEndDatePicker, setShowEndDatePicker] = useState(false);
	const [showEndTimePicker, setShowEndTimePicker] = useState(false);

	useEffect(() => {
		const loadNotificationSettings = async () => {
			try {
				const savedFirst = await Storage.getItem("firstNotification");
				const savedSecond = await Storage.getItem("secondNotification");

				if (savedFirst !== null) {
					setFirstNotification(savedFirst === "null" ? null : Number(savedFirst));
				}
				if (savedSecond !== null) {
					setSecondNotification(savedSecond === "null" ? null : Number(savedSecond));
				}
			} catch (error) {
				if (process.env.SHOW_LOGS == 'true') {
					console.error("Error loading notification settings:", error);
				}
				setFirstNotification(NotificationTimes.FIFTEEN_MINUTES_MS);
				setSecondNotification(null);
			}
		};

		loadNotificationSettings();
	}, []);

	useEffect(() => {
		if (!user || !user.default_calendar_id) return;
		setEventCalendarId(user.default_calendar_id);
	}, [user]);

	//REPLACE WITH USER'S CALENDARS
	const { data: calendars, isLoading } = useMyCalendars();

	const { mutate: createEvent, isPending } = useCreateEvent({
		onSuccess: () => {
			router.back();
		},
	});

	const globColor = colorScheme == "light" ? "black" : "white";

	if (isLoading || !calendars || !user) {
		return <Text className="text-primary">Loading...</Text>;
	}

	const PLACEHOLDER_DATE = DateTime.fromObject({ year: 1899, month: 1, day: 1 });

	const toggleAllDay = (value: boolean) => {
		setIsAllDay(value);
		if (value) {
			// store as 1899 year so we know it is an all day event
			// workaround until i can store null in database
			// setStartDate(PLACEHOLDER_DATE);
			// setEndDate(PLACEHOLDER_DATE);

			setStartDate((prev) => prev.startOf("day"));
			setEndDate(startDate.endOf("day"));
		} else {
			var currTime = DateTime.now();
			setStartDate((prev) => prev.set({ hour: currTime.hour, minute: currTime.minute}));
			setEndDate((prev) => prev.set({ hour: currTime.hour, minute: currTime.minute }).plus({ hour: 1 }));
		}
	};


	
	const onStartDateSet = (e: DateTimePickerEvent, selectedDate: Date) => {
		if (selectedDate && e.type === "set" && isAllDay) {
			const luxonDate = DateTime.fromJSDate(selectedDate);
			setStartDate(luxonDate.startOf("day"));
			setEndDate(luxonDate.endOf("day"));
		} else if (selectedDate && e.type === "set" && endDate === today.plus({ hours: 1 })) {
			const luxonDate = DateTime.fromJSDate(selectedDate);
			setStartDate(luxonDate);
			setEndDate(luxonDate.plus({ hours: 1 }));
		} else if (selectedDate && e.type === "set") {
			const luxonDate = DateTime.fromJSDate(selectedDate);
			setStartDate(luxonDate);
		}
	};

	return (
		<DismissKeyboardView className="flex-1 bg-background">
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

			<ScrollView className="mt-5 flex flex-col gap-2 px-8">
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

				<NotificationDropdown
					handleSelect={(item: { label: string; value: number | null }) => {
						setFirstNotification(item.value);
					}}
					defaultValue={firstNotification}
				/>

				<NotificationDropdown
					handleSelect={(item: { label: string; value: number | null }) => {
						setSecondNotification(item.value);
					}}
					defaultValue={secondNotification}
				/>

				<View className="flex-col gap-2">
					<Text className="text-primary">Calendar:</Text>

					<Dropdown<Calendar>
						options={calendars}
						defaultValue={
							user.default_calendar_id
								? calendars.find((cal) => cal.calendar_id === user.default_calendar_id)
								: undefined
						}
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
					<Text className="pr-[9] text-primary">All Day</Text>
					<Switch value={isAllDay} onValueChange={(value) => toggleAllDay(value)} />
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
									if (selectedDate) {
										onStartDateSet(e, selectedDate);
									}
								}
								setShowStartDatePicker(false);
							}}
						/>
					)}
					{!isAllDay && (showStartTimePicker || Platform.OS === "ios") && (
						<DateTimePicker
							value={startDate.toJSDate()}
							is24Hour={false}
							mode={"time"}
							onChange={(e, selectedDate) => {
								if (selectedDate) {
									onStartDateSet(e, selectedDate);
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
							disabled={isAllDay}
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
					{!isAllDay && (showEndTimePicker || Platform.OS == "ios") && (
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

				<RecurrenceSelector
					onRecurrenceChange={(recurrenceValue) => {
						setFrequency(recurrenceValue);
						console.log(recurrenceValue);
					}}
					start_time={startDate}
				/>

				<PrioDropdown
					handleSelect={(item: { label: string; value: number }) => {
						setPriority(item.value);
					}}
					defaultValue={priority}
				/>
			</ScrollView>
			{/* Get this to send event to db */}
			<View className="mb-4 flex flex-row items-center justify-center">
				<Button
					className={cn(isPending && "opacity-50")}
					onPress={() => {
						if (isPending || !eventCalendarId || !name || !startDate || !endDate) {
							return;
						}
						createEvent({
							newEvent: {
								name,
								start_time: startDate,
								end_time: endDate,
								calendar_id: eventCalendarId,
								location: location,
								first_notification: firstNotification,
								second_notification: secondNotification,
								description: description,
								frequency: frequency,
								priority: priority,
								all_day: isAllDay,
							},
							calendar_id: eventCalendarId,
						});
					}}
				>
					Create Event
				</Button>
			</View>
		</DismissKeyboardView>
	);
}

const NotificationDropdown = ({
	handleSelect,
	defaultValue,
}: {
	handleSelect: (
		item:
			| {
					label: string;
					value: number;
			  }
			| {
					label: string;
					value: null;
			  }
	) => void;
	defaultValue?: number | null | undefined;
}) => {
	const options = [
		{ label: "Time of event", value: NotificationTimes.TIME_OF_EVENT },
		{ label: "15 minutes before", value: NotificationTimes.FIFTEEN_MINUTES_MS },
		{ label: "30 minutes before", value: NotificationTimes.THIRTY_MINUTES_MS },
		{ label: "1 hour before", value: NotificationTimes.ONE_HOUR_MS },
		{ label: "1 day before", value: NotificationTimes.ONE_DAY_MS },
		{ label: "None", value: NotificationTimes.NONE },
	];

	const renderItem = (item: (typeof options)[number]) => <Text className="text-primary">{item.label}</Text>;

	return (
		<View>
			<Dropdown
				options={options}
				defaultValue={options.find((option) => option.value === defaultValue)}
				renderItem={renderItem}
				onSelect={handleSelect}
				label="Notification Time"
			/>
		</View>
	);
};

const PrioDropdown = ({
	handleSelect,
	defaultValue,
}: {
	handleSelect: (item: { label: string; value: number }) => void;
	defaultValue?: number | null | undefined;
}) => {
	const options = [
		{ label: "None", value: 0 },
		{ label: "Low", value: 1 },
		{ label: "Medium", value: 2 },
		{ label: "High", value: 3 },
	];

	const renderItem = (item: (typeof options)[number]) => <Text className="text-primary">{item.label}</Text>;

	return (
		<View>
			<Dropdown
				options={options}
				defaultValue={options.find((option) => option.value === defaultValue)}
				renderItem={renderItem}
				onSelect={handleSelect}
				label="Priority"
			/>
		</View>
	);
};
