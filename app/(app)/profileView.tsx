import { Button } from "@/components/Button";
import { router } from "expo-router";
import { Modal, Text, View, TouchableOpacity, TextInput, Platform, ScrollView, Switch } from "react-native";
import { Input } from "@/components/Input";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import React from "react";
import Feather from "@expo/vector-icons/Feather";
import { useColorScheme } from "nativewind";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import { GuestSignInModal } from "@/components/GuestSignInModal";
import { DateTime } from "luxon";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useDeleteUser } from "@/hooks/user.hooks";
import { useSession } from "@/hooks/authContext";
import { CalendarItem } from "./(index)/calendarsList";
import { useMyCalendars } from "@/hooks/calendar.hooks";
import useStateWithCallbackLazy from "@/hooks/useStateWithCallbackLazy";
import { migrateUserCalendarsInDB, migrateUserServer } from "@/lib/user.helper";
import { useEnabledCalendarIds } from "@/hooks/useEnabledCalendarIds";
import Storage from "expo-sqlite/kv-store";
import { useUpdateUser } from "@/hooks/profile.hooks";
import Dropdown from "@/components/Dropdown";
import { Calendar } from "@/types/calendar.types";
import { GlobalNotificationSettingsModal } from "@/components/GlobalNotificationSettingsModal";
import { NotificationTimes } from "@/constants/notificationTimes";
import { deleteEventsUntilFromDB, deleteEventsUntilNowOnServer } from "@/lib/event.helpers";


export default function ProfileView() {
	const isPresented = router.canGoBack();

	const [isEditing, setIsEditing] = useState(false);

	const { user } = useSession();

	const [username, setUserName] = useState("");
	const [name, setName] = useState("");
	// const [birthday, setBirthday] = useState(DateTime.fromISO("1900-01-01T00:00:00.000Z"));
	const [birthday, setBirthday] = useState<DateTime<true> | undefined>(DateTime.local().startOf('day'));
	const [defaultCal, setDefaultCal] = useState<string | undefined>(undefined);
	const { colorScheme } = useColorScheme();
	const [is24Hour, setIs24Hour] = useState(false);

	// global notification settings
	const [notificationModalVisible, setNotificationModalVisible] = useState(false);
	const [firstNotification, setFirstNotification] = useState<number | null>(NotificationTimes.FIFTEEN_MINUTES_MS);
	const [secondNotification, setSecondNotification] = useState<number | null>(null);

	const [signInModalVisible, setSignInModalVisible] = useStateWithCallbackLazy(false);
	const [mergeCalendarModalVisible, setMergeCalendarModalVisible] = useState(false);
	const [showDatePicker, setShowDatePicker] = useState(false);

	const { data: calendars, isLoading } = useMyCalendars();

	const { enabledCalendarIds = [], setEnabledCalendarIds } = useEnabledCalendarIds();

	const handleEditToggle = () => {
		setIsEditing(!isEditing);
	};

	const { mutate: updateUser, isPending: isUpdating } = useUpdateUser({
		onSuccess: () => {
			setIsEditing(false);
			router.navigate("/(app)/profileView"); // Navigate back after updating
		}
	});

	useEffect(() => {
		if (!user) return;
		setName(user.name || "")
		setUserName(user.username)
		setBirthday(user.birthday ? DateTime.fromFormat(user.birthday, "yyyy-MM-dd") as DateTime<true> : undefined)
		setDefaultCal(user.default_calendar_id)
		setIs24Hour(user.is_24_hour)

		// load global notification settings
		const loadNotificationSettings = async () => {
			try {
				const savedFirst = await Storage.getItem('firstNotification');
				const savedSecond = await Storage.getItem('secondNotification');

				if (savedFirst !== null) {
					setFirstNotification(savedFirst === 'null' ? null : Number(savedFirst));
				}
				if (savedSecond !== null) {
					setSecondNotification(savedSecond === 'null' ? null : Number(savedSecond));
				}
			} catch (error) {
				if (process.env.SHOW_LOGS == 'true') {
					console.error('Error loading notification settings:', error);
				}
			}
		};

		loadNotificationSettings();
	}, [user])

	const handleSave = async () => {
		if (!user) {
			return;
		}

		const oldDefault = user.default_calendar_id;

		await updateUser({
			user_id: user.user_id,
			username: username,
			name: name,
			birthday: birthday ? birthday.toFormat("yyyy-MM-dd") : undefined,
			default_calendar_id: defaultCal,
			is_24_hour: is24Hour,
		}, {
			onSuccess: () => {
				setIsEditing(false);

				if (defaultCal) {
					const filteredIds = oldDefault ?
						enabledCalendarIds.filter(id => id !== oldDefault) :
						[...enabledCalendarIds];

					if (!filteredIds.includes(defaultCal)) {
						setEnabledCalendarIds([...filteredIds, defaultCal]);
					} else {
						setEnabledCalendarIds(filteredIds);
					}
				}

				//router.back()
			},
		});
	}
	const handleSaveNotificationSettings = (firstNotif: number | null, secondNotif: number | null) => {
		setFirstNotification(firstNotif);
		setSecondNotification(secondNotif);
		Storage.setItem('firstNotification', firstNotif?.toString() ?? 'null');
		Storage.setItem('secondNotification', secondNotif?.toString() ?? 'null');
	};

	const formatNotificationTime = (timeMs: number | null): string => {
		if (timeMs === null) return 'None';
		if (timeMs === NotificationTimes.TIME_OF_EVENT) return 'At time of event';
		if (timeMs < NotificationTimes.ONE_HOUR_MS) return `${timeMs / (60 * 1000)} minutes before`;
		if (timeMs < NotificationTimes.ONE_DAY_MS) return '1 hour before';
		return '1 day before';
	};

	const handleCancel = () => {
		setIsEditing(false);
	}

		;
	const { signOut } = useSession();

	const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser({});

	const globColor = colorScheme == "light" ? "black" : "white";
	const globColorInverse = colorScheme == "light" ? "white" : "black";

	type MergeCalendarModalProps = {
		visible: boolean;
		onClose: () => void;
	};

	const MergeCalendarModal: React.FC<MergeCalendarModalProps> = ({ visible, onClose }) => {
		const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);

		const { user, sessionId } = useSession();

		useEffect(() => {
			console.log("merge visible chagned", visible);
		}, [visible]);

		if (!user) {
			return <Text className="text-primary">Loading...</Text>;
		}

		return (
			<Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
				<View className="flex-1 items-center justify-center bg-black/50">
					<View className="max-h-[80vh] w-[90vw] rounded-2xl bg-background p-6 shadow-lg">
						<Text className="mb-3 text-center text-xl font-bold text-primary">Merge Calendars</Text>

						<Text className="mb-5 text-center text-base text-primary">
							Select calendars to merge with your online account{"\n"}
							<Text className="font-medium text-primary">(calendars not selected will be deleted)</Text>
						</Text>

						<ScrollView className="max-h-96" contentContainerClassName="pb-2">
							<View className="flex-col space-y-3">
								{calendars?.map((calendar, i) => (
									<CalendarItem
										checked={false}
										key={calendar.calendar_id}
										calendarName={calendar.title}
										calendarColor={calendar.color}
										editMode={false}
										onPress={() => {
											if (selectedCalendars.includes(calendar.calendar_id)) {
												setSelectedCalendars(selectedCalendars.filter((id) => id !== calendar.calendar_id));
											} else {
												if (!selectedCalendars.filter((id) => id === calendar.calendar_id)) {
													setSelectedCalendars([...selectedCalendars, calendar.calendar_id]);
												}
											}
										}}
									/>
								))}
							</View>
						</ScrollView>

						<View className="mt-6 flex-row justify-between space-x-3">
							<Button
								labelClasses="font-secondary"
								onPress={async () => {
									console.log("selectedCalendars", selectedCalendars);
									console.log("sessionId", sessionId);
									console.log("user", user);
									migrateUserCalendarsInDB(user.user_id);
									migrateUserServer(user.user_id);
									onClose();
								}}
							>
								Merge Selected
							</Button>
						</View>
					</View>
				</View>
			</Modal>
		);
	};

	const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));


	if (!calendars) {
		return null;
	}

	if (!user) {
		return <Text className="text-primary">Loading...</Text>;
	}


	const renderCalendarItem = useCallback((calendar: Calendar) => (
		<View className="flex flex-row items-center gap-2">
			<View className="h-6 w-6 rounded-full" style={{ backgroundColor: calendar.color }} />
			<Text className="text-primary">{calendar.title}</Text>
		</View>
	), [enabledCalendarIds]);


	return (
		<View>
			<GuestSignInModal
				visible={signInModalVisible}
				onClose={() => setSignInModalVisible(false)}
				onComplete={() => {
					setSignInModalVisible(false, () => {
						setTimeout(() => {
							setMergeCalendarModalVisible(true);
						}, 1000);
					});
					setEnabledCalendarIds([]);
					Storage.setItemSync("enabledCalendarIds", JSON.stringify([]));

					console.log("onComplete");
				}}
			/>

			<MergeCalendarModal visible={mergeCalendarModalVisible} onClose={() => setMergeCalendarModalVisible(false)} />

			<GlobalNotificationSettingsModal
				visible={notificationModalVisible}
				firstNotification={firstNotification}
				secondNotification={secondNotification}
				onClose={() => setNotificationModalVisible(false)}
				onSave={handleSaveNotificationSettings}
			/>

			<View className="ml-1 mr-1 flex-row items-center justify-center relative">
				<Text className="text-2xl font-bold text-primary">User Profile</Text>
				<View className="absolute right-0 flex-row gap-6">
					{!isEditing && (
						<TouchableOpacity onPress={handleEditToggle}>
							<Feather name="edit-2" className="mt-[1]" size={24} color={globColor} />
						</TouchableOpacity>
					)}
					<ConfirmDelete
						onDelete={() => {
							deleteUser(user.user_id);
						}}
						buttonClass="mr-4"
					/>
				</View>
			</View>

			<View className="">
				{isEditing ? (
					<View className="p-6">
						<View className="p-3">
							<Text className="font-semibold text-primary">Username</Text>
							<TextInput
								className="rounded-lg border border-gray-300 p-3 text-primary"
								style={{ backgroundColor: globColorInverse }}
								value={username}
								onChangeText={setUserName}
								placeholder="Username"
							/>

							<Text className="font-semibold text-primary mt-5">Name</Text>
							<TextInput
								className="rounded-lg border border-gray-300 p-3 text-primary"
								style={{ backgroundColor: globColorInverse }}
								value={name}
								onChangeText={setName}
								placeholder="Name"
							/>

							<Text className="font-semibold text-primary mt-5">Birthday</Text>
							{Platform.OS === "android" && (
								<TouchableOpacity
									className="rounded-lg bg-muted border border-border px-4 py-2"
									onPress={() => setShowDatePicker(true)}
								>
									<Text className="font-medium text-primary">{birthday ? birthday.toLocaleString(DateTime.DATE_MED) : "No birthday set"}</Text>
								</TouchableOpacity>
							)}
							{(showDatePicker || Platform.OS === "ios") && (
								<DateTimePicker
									value={birthday ? birthday.toJSDate() : new Date()}
									mode={"date"}
									onChange={(e, selectedDate) => {
										if (selectedDate && e.type === "set") {
											const luxonDate = DateTime.fromJSDate(selectedDate);
											setBirthday(luxonDate as DateTime<true>);
										}
										setShowDatePicker(false);
									}}
								/>
							)}

							<Text className="font-semibold text-primary mt-5">Default Calendar</Text>
							<Dropdown<Calendar>
								options={calendars}
								defaultValue={calendars.find((cal) => cal.calendar_id === defaultCal)}
								renderItem={(calendar) => {
									return (
										<View className="flex flex-row items-center gap-2">
											<View className="h-6 w-6 rounded-full" style={{ backgroundColor: calendar.color }} />
											<Text className="text-primary">{calendar.title}</Text>
										</View>
									);
								}}
								onSelect={(selectedCalendar) => (setDefaultCal(selectedCalendar.calendar_id))}
							/>
							<View className='flex-row mt-5 pl-1'>
								<Text className='text-primary font-semibold pt-1 pr-4'>24-Hour Time:</Text>
								<Switch
									trackColor={{ false: '#767577', true: '#2196F3' }}
									thumbColor={is24Hour ? '#FFFFFF' : '#F4F4F4'}
									onValueChange={() => {
										setIs24Hour(!is24Hour);
									}}
									value={is24Hour}
								/>
							</View>

							<View className="mt-4 p-3 bg-muted rounded-lg border border-border">
								<View className="flex-row items-center justify-between">
									<View className="flex-1">
										<Text className="text-primary font-semibold">Notification Settings</Text>
										<Text className="text-muted-foreground text-sm mt-1">
											Customize default notification settings
										</Text>
									</View>
									<View className='pl-7 pr-7'>
										<Button
											onPress={() => setNotificationModalVisible(true)}
											labelClasses='text-sm font-medium text-secondary'
										>
											Configure
										</Button>
									</View>
								</View>
							</View>

							<View className="mt-4 p-3 bg-muted rounded-lg border border-border">
								<View className="flex-row items-center justify-between">
									<View className="flex-1">
										<Text className="text-primary font-semibold">Delete Past Events</Text>
										<Text className="text-muted-foreground text-sm mt-1">
											Permanently deletes all events before the current time
										</Text>
									</View>
									<View className='pl-7 pr-7'>
										<Button
											variant='destructive'
											onPress={() => {
												deleteEventsUntilFromDB(DateTime.now(), user.user_id)
												deleteEventsUntilNowOnServer()
											}}
											labelClasses='text-sm font-medium text-secondary'
										>
											Delete
										</Button>
									</View>
								</View>
							</View>

							<View className="mt-10 flex-row items-center justify-center gap-8">
								<Button onPress={handleSave} labelClasses="text-secondary" disabled={isUpdating}>
									{isUpdating ? "Updating..." : "Save Changes"}

								</Button>

								<Button onPress={handleCancel} labelClasses="text-secondary">
									Cancel
								</Button>
							</View>
						</View>
					</View>
				) : (
					<View>
						<View className="p-3">
							<Text className='text-primary font-bold m-1 ml-4 text-xl'>Profile Settings</Text>
							<View className="items-left m-2 p-3 bg-muted rounded-lg border border-border">
								<View className='flex-row p-4'>
									<Text className='text-primary font-semibold'>Username: </Text>
									<Text className='text-primary ml-4'>{username}</Text>
								</View>
								<View className='flex-row p-4 border-t border-gray-300'>
									<Text className='text-primary font-semibold'>Name: </Text>
									<Text className='text-primary ml-4'>{name}</Text>
								</View>
								<View className='flex-row p-4 border-t border-gray-300'>
									<Text className='text-primary font-semibold'>Birthday: </Text>
									<Text className='text-primary ml-4'>{birthday ? birthday.toLocaleString(DateTime.DATE_MED) : "Not set"}</Text>
								</View>
								<View className='flex-row p-4 border-t border-gray-300'>
									<Text className='text-primary font-semibold'>Default Calendar: </Text>
									<Text className='text-primary ml-4'>{defaultCal ? defaultCal : "Not set"}</Text>
								</View>

								<View className='flex-row p-4 border-t border-gray-300'>
									<Text className='text-primary font-semibold'>Time Setting: </Text>
									<Text className='text-primary ml-4'>{is24Hour ? "24 Hour" : "12 Hour"}</Text>
								</View>
							</View>

							<Text className='text-primary font-bold m-1 ml-4 text-xl'>Notification Settings</Text>
							<View className='items-left m-2 p-3 bg-muted rounded-lg border border-border'>
								<View className='flex-row p-4'>
									<Text className='text-primary font-semibold'>First Notification: </Text>
									<Text className='text-primary ml-4'>{formatNotificationTime(firstNotification)}</Text>
								</View>

								<View className='flex-row p-4 border-t border-gray-300'>
									<Text className='text-primary font-semibold'>Second Notification: </Text>
									<Text className='text-primary ml-4'>{formatNotificationTime(secondNotification)}</Text>
								</View>
							</View>

						</View>


						{user.user_id == "localUser" && (
							<View className="flex-col items-center justify-center">
								<Button className="m-8 ml-10 mr-10" onPress={() => setSignInModalVisible(!signInModalVisible)}>
									Sign-In
								</Button>
							</View>
						)}

						<View className='flex-1 items-center justify-center pt-20'>
							<Button className='w-[40vw]'
								onPress={() => {
									setEnabledCalendarIds([]);
									Storage.setItemSync("enabledCalendarIds", JSON.stringify([]));

									signOut();
								}}
							>
								Sign Out
							</Button>
						</View>
					</View>

				)}
			</View>
		</View>
	);
}