import { Button } from "@/components/Button";
import { router } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity, Platform, Switch, ActivityIndicator } from "react-native";
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
import { useCreateEvent, useEvent, useUpdateEvent, useEventImage } from "@/hooks/event.hooks";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/authContext";
import { NotificationTimes } from "@/constants/notificationTimes";
import { DismissKeyboardView } from "@/components/DismissKeyboardView";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import RecurrenceSelector from "@/components/RecurrenceSelector";

import { Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { updateEventInDB } from "@/lib/event.helpers";

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
	const [firstNotification, setFirstNotification] = useState<number | null>(NotificationTimes.FIFTEEN_MINUTES_MS); //Text box
	const [secondNotification, setSecondNotification] = useState<number | null>(null); //Text box
	const [eventCalendarId, setEventCalendarId] = useState(""); //Single Select List
	const [priority, setPriority] = useState<number>(0);
	const [isAllDay, setIsAllDay] = useState(false);
	const [frequency, setFrequency] = useState<string | null>(null);
	const [img, setImg] = useState<string | null>(null);
	const [tempImageUri, setTempImageUri] = useState<string | null>(null);
	const [showStartDatePicker, setShowStartDatePicker] = useState(false);
	const [showStartTimePicker, setShowStartTimePicker] = useState(false);
	const [showEndDatePicker, setShowEndDatePicker] = useState(false);
	const [showEndTimePicker, setShowEndTimePicker] = useState(false);
	const [is24Hour, setIs24Hour] = useState(false);

	useEffect(() => {
		if (user) {
			setIs24Hour(user.is_24_hour);
		}
	}, [user]);

	//REPLACE WITH USER'S CALENDARS
	const { data: calendars, isLoading: calendarsIsLoading } = useMyCalendars();

	const { mutate: updateEvent, isPending } = useUpdateEvent({
		// onSuccess: () => {
		// 	router.back();
		// },
	});

	useEffect(() => {
		if (event) {
			setName(event.name);
			setStartDate(event.start_time);
			setEndDate(event.end_time);
			setLocation(event.location);
			setDescription(event.description);
			setFirstNotification(event.first_notification);
			setSecondNotification(event.second_notification);
			setEventCalendarId(event.calendar_id);
			setFrequency(event.frequency);
			setPriority(event.priority);
			setIsAllDay(event.all_day);
			setImg(event.img);
		}
	}, [event]);

	const {
		uploadPicture,
		deletePicture,
		pickImage,
		eventImageUrl
	} = useEventImage();

	const handlePickImage = async () => {
		try {
			const uri = await pickImage();
			setTempImageUri(uri);
			
			const uploadResult = await uploadPicture.mutateAsync(uri);
			const imageKey = uploadResult.filename || uploadResult.key;
			console.log("Uploaded image key:", imageKey);
			
			// update db
			if (!user) throw new Error("User not authenticated");
			await updateEventInDB(eventId, { event_id: eventId, img: imageKey }, user.user_id);
			
			// update local state
			setImg(imageKey);
			setTempImageUri(null);
		} catch (error) {
			setTempImageUri(null);
			console.error("Image upload failed:", error);
		}
	};
	const globColor = colorScheme == "light" ? "black" : "white";
	const globColorInverse = colorScheme == "light" ? "white" : "black"
	

	const PLACEHOLDER_DATE = DateTime.fromObject({ year: 1899, month: 1, day: 1 });

	const toggleAllDay = (value: boolean) => {
		setIsAllDay(value);
		if (value) {
			// store as 1899 year so we know it is an all day event
			// workaround until i can store null in database
			setStartDate(PLACEHOLDER_DATE);
			setEndDate(PLACEHOLDER_DATE);
			//setStartDate((prev) => prev.startOf("day"));
			//setEndDate((prev) => prev.startOf("day"));
		} else {
			setStartDate(DateTime.now());
			setEndDate(DateTime.now());
		}
	};

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

				<Text className="items-center pl-5 text-3xl font-bold text-primary">Update Event</Text>
			</View>

			<ScrollView className="mt-5 flex flex-col gap-2 px-8">
				<Text className='font-semibold text-primary'>Name</Text>
				<TextInput
					className='rounded-lg border border-gray-300 p-3 text-primary'
					style={{ backgroundColor: globColorInverse }}
					value={name}
					onChangeText={setName}
					placeholder="Event Name"
				/>

				<Text className='font-semibold text-primary mt-3'>Location</Text>
				<TextInput
					className='rounded-lg border border-gray-300 p-3 text-primary'
					style={{ backgroundColor: globColorInverse }}
					value={location}
					onChangeText={setLocation}
					placeholder='Event Location'
					multiline={true}
					numberOfLines={4}
				/>

				<Text className='font-semibold text-primary mt-3'>Description</Text>
				<TextInput
					className='rounded-lg border border-gray-300 p-3 text-primary'
					style={{ backgroundColor: globColorInverse }}
					value={description}
					onChangeText={setDescription}
					placeholder='Description'
					multiline={true}
				/>

				<View className='mt-3 border-t border-border' />

				<Text className='font-semibold text-primary mt-3'>Calendar</Text>
				<View className='mt-1'>
					<Dropdown<Calendar>
						options={calendars}
						defaultValue={eventCalendarId ? calendars.find((cal) => cal.calendar_id == eventCalendarId) : undefined}
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

				<View className='mt-4 border-t border-border' />

				<View className="flex-row items-center gap-2 mt-3">
					<Text className="pr-[10] text-primary font-semibold">Start Time:</Text>
					{Platform.OS === "android" && (
						<TouchableOpacity
							className="flex flex-row items-center space-x-2 rounded-lg bg-foreground px-4 py-2"
							onPress={() => setShowStartDatePicker(true)}
						>
							<Text className="font-medium text-sm text-secondary">{
								startDate.toLocaleString({
									year: 'numeric',
									month: 'short',
									day: 'numeric',
									hour: '2-digit',
									minute: '2-digit',
									hour12: !is24Hour
								})
							}</Text>
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
					{!isAllDay && (showStartTimePicker || Platform.OS === "ios") && (
						<DateTimePicker
							value={startDate.toJSDate()}
							is24Hour={is24Hour}
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

				<View className="flex-row items-center gap-2 mt-2">
					<Text className="pr-[16] text-primary font-semibold">End Time:</Text>
					{Platform.OS === "android" && (
						<TouchableOpacity
							className="flex flex-row items-center space-x-2 rounded-lg bg-foreground px-4 py-2"
							onPress={() => setShowEndDatePicker(true)}
							disabled={isAllDay}
						>
							<Text className={`font-medium text-sm ${isAllDay ? "text-gray-400" : "text-secondary"}`}>
								{endDate.toLocaleString({
									year: 'numeric',
									month: 'short',
									day: 'numeric',
									hour: '2-digit',
									minute: '2-digit',
									hour12: !is24Hour
								})}
							</Text>
						</TouchableOpacity>
					)}
					{(showEndDatePicker || Platform.OS === "ios") && (
						<DateTimePicker
							value={endDate.toJSDate()}
							is24Hour={is24Hour}
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
							is24Hour={is24Hour}
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


				<View className="flex-row items-center gap-2 mt-3">
					<Text className="pr-[] text-primary font-semibold m">All Day:</Text>
					<Switch value={isAllDay} onValueChange={(value) => toggleAllDay(value)} />
				</View>

				<View className='mt-4 border-t border-border' />

				<Text className='font-semibold text-primary mt-3 mb-1'>Recurrence</Text>
				<RecurrenceSelector
					onRecurrenceChange={(recurrenceValue) => {
						setFrequency(recurrenceValue);
					}}
					start_time={startDate}
					defaultValue={frequency}
				/>

				<Text className='font-semibold text-primary mt-3 mb-1'>Priority</Text>
				<PrioDropdown
					handleSelect={(item: { label: string; value: number }) => {
						setPriority(item.value);
					}}
					defaultValue={priority}
				/>

				<View className='mt-4 border-t border-border' />

				<Text className='font-semibold text-primary mt-3 mb-1'>First Notification Time</Text>
				<NotificationDropdown
					handleSelect={(item: { label: string; value: number | null }) => {
						setFirstNotification(item.value);
					}}
					defaultValue={firstNotification}
				/>

				<Text className='font-semibold text-primary mt-3 mb-1'>Second Notification Time</Text>
				<NotificationDropdown
					handleSelect={(item: { label: string; value: number | null }) => {
						setSecondNotification(item.value);
					}}
					defaultValue={secondNotification}
				/>

				<View className='mt-4 border-t border-border' />

				{tempImageUri ? (
					<Image 
						source={{ uri: tempImageUri }}
						style={{ 
							width: '100%', 
							height: 200,
							borderRadius: 8,
							resizeMode: 'cover'
						}}
					/>
					) : img ? (
					<Image 
						source={{ uri: `${process.env.EXPO_PUBLIC_S3_URL}/${img}` }}
						style={{ 
							width: '100%', 
							height: 200,
							borderRadius: 8,
							resizeMode: 'cover'
						}}
					/>
				) : null}

				<Text className='font-semibold text-primary mt-3'>Image</Text>
				<View className="flex-row gap-2 mt-2">

				<Button 
					onPress={handlePickImage}  // Use the defined function
					variant="secondary"
					className="flex-1"
					disabled={uploadPicture.isPending}
				>
				{uploadPicture.isPending ? (
					<ActivityIndicator color={globColor} />
				) : img ? (
					'Change Image'
				) : (
					'Add Image'
				)}
				</Button>
				
				{img && (
					<Button 
					onPress={async () => {
						try {
							await deletePicture.mutateAsync();
							setImg(null);
						} catch (error) {
							console.error("Image deletion failed:", error);
						}
					}}
					variant="destructive"
					className="flex-1"
					disabled={deletePicture.isPending}
					>
					{deletePicture.isPending ? (
						<ActivityIndicator color={globColor} />
					) : (
						'Remove'
					)}
					</Button>
				)}
				</View>

				<View className='mb-6'/>

			</ScrollView>
			<View className="m-4 flex flex-row items-center justify-center">
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
								frequency: frequency,
								first_notification: firstNotification,
								second_notification: secondNotification,
								priority: priority,
								all_day: isAllDay,
								img: img,
							},
							calendar_id: eventCalendarId,
						}, {
							onSuccess: () => router.back()
						});
					}}
				>
					Update Event
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

	console.log(defaultValue);

	return (
		<View>
			<Dropdown
				options={options}
				defaultValue={options.find((option) => option.value === defaultValue)}
				renderItem={renderItem}
				onSelect={handleSelect}
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
			/>
		</View>
	);
};
