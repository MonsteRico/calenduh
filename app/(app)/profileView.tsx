import { Button } from "@/components/Button";
import { router } from "expo-router";
import { Modal, Text, View, TouchableOpacity, TextInput, Platform, ScrollView } from "react-native";
import { Input } from "@/components/Input";
import { useEffect, useState } from "react";
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

export default function ProfileView() {
	const isPresented = router.canGoBack();

	const [isEditing, setIsEditing] = useState(false);

	const { user } = useSession();
	if (!user) {
		return <Text className="text-primary">Loading...</Text>;
	}

	const [username, setUserName] = useState(user?.username || "");
	const [name, setName] = useState(user?.name || "");
	// const [birthday, setBirthday] = useState(DateTime.fromISO("1900-01-01T00:00:00.000Z"));
	const [birthday, setBirthday] = useState(user?.birthday ? DateTime.fromISO(user.birthday) : DateTime.local().startOf('day'));
	const { colorScheme } = useColorScheme();

	const [tempUsername, setTempUserName] = useState(username);
	const [tempName, setTempName] = useState(name);
	const [tempBirthday, setTempBirthday] = useState(birthday);

	const [signInModalVisible, setSignInModalVisible] = useStateWithCallbackLazy(false);
	const [mergeCalendarModalVisible, setMergeCalendarModalVisible] = useState(false);
	const [showDatePicker, setShowDatePicker] = useState(false);

	const { data: calendars, isLoading } = useMyCalendars();

	const handleEditToggle = () => {
		setIsEditing(!isEditing);
	};

	const { mutate: updateUser, isPending: isUpdating } = useUpdateUser({
		onSuccess: () => {
			setIsEditing(false);
			router.back(); // Navigate back after updating
		},
	});


	const handleSave = () => {
		console.log("***BDAY:", tempBirthday);
		updateUser({
			user_id: user.user_id,
			username: tempUsername,
			name: tempName,
			// birthday: tempBirthday ? tempBirthday : undefined
			birthday: tempBirthday ? tempBirthday.toFormat('yyyy-MM-dd') : undefined
		}, {
			onSuccess: () => {
				setIsEditing(false);
				// update values locally
				setUserName(tempUsername);
				setName(tempName);
				setBirthday(tempBirthday);
			},
		});
	};

	const handleCancel = () => {
		setIsEditing(false);
		setTempUserName(username);
		setTempName(name);
		setTempBirthday(birthday);
	};
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
						<Text className="mb-3 text-center text-xl font-bold">Merge Calendars</Text>

						<Text className="mb-5 text-center text-base text-primary">
							Select calendars to merge with your online account{"\n"}
							<Text className="font-medium text-red-600">(calendars not selected will be deleted)</Text>
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
												setSelectedCalendars([...selectedCalendars, calendar.calendar_id]);
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

	const { enabledCalendarIds, setEnabledCalendarIds } = useEnabledCalendarIds();

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

			<View className="ml-1 mr-1 flex-row items-center justify-center relative">
				<Text className="text-2xl font-bold text-primary">User Profile</Text>
				<View className="absolute right-0 flex-row gap-6">
					<TouchableOpacity onPress={handleEditToggle}>
						<Feather name="edit-2" className="mt-[1]" size={24} color={globColor} />
					</TouchableOpacity>
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
					<View className="space-y-4">
						<Text className="text-sm font-medium text-muted-foreground">Username</Text>
						<TextInput
							className="rounded-lg border border-gray-300 p-3 text-primary"
							style={{ backgroundColor: globColorInverse }}
							value={tempUsername}
							onChangeText={setTempUserName}
							placeholder="Username"
						/>

						<Text className="text-sm font-medium text-muted-foreground">Name</Text>
						<TextInput
							className="rounded-lg border border-gray-300 p-3 text-primary"
							style={{ backgroundColor: globColorInverse }}
							value={tempName}
							onChangeText={setTempName}
							placeholder="Name"
						/>

						<Text className="text-sm font-medium text-muted-foreground">Birthday</Text>
						{Platform.OS === "android" && (
							<TouchableOpacity
								className="flex flex-row items-center space-x-2 rounded-lg bg-gray-200 px-4 py-2"
								onPress={() => setShowDatePicker(true)}
							>
								<Text className="font-medium text-primary">{birthday.toLocaleString(DateTime.DATE_MED)}</Text>
							</TouchableOpacity>
						)}
						{(showDatePicker || Platform.OS === "ios") && (
							<DateTimePicker
								value={tempBirthday?.toJSDate()}
								mode={"date"}
								onChange={(e, selectedDate) => {
									if (selectedDate && e.type === "set") {
										const luxonDate = DateTime.fromJSDate(selectedDate);
										setTempBirthday(luxonDate);
									}
									setShowDatePicker(false);
								}}
							/>
						)}

						<View className="mt-10 flex-row items-center justify-center gap-8">
							{/* <Button onPress={handleSave} labelClasses="text-background">
								Save Changes
							</Button> */}
							<Button onPress={handleSave} labelClasses="text-background" disabled={isUpdating}>
								{isUpdating ? "Updating..." : "Save Changes"}
							</Button>


							<Button onPress={handleCancel} labelClasses="text-background">
								Cancel
							</Button>
						</View>
					</View>
				) : (
					<View>
						<View className="mb-8 rounded-lg p-4 shadow-sm">
							<View className="rounded-xl border border-gray-300 p-4">
								<View className="space-y-4">
									<View className="flex-row items-center rounded-xl border border-gray-100 py-4 mb-2">
										<Text className="pl-[5px] w-1/3 text-lg font-medium text-gray-600">Username</Text>
										<Text className="flex-1 text-lg font-semibold text-gray-100">{tempUsername}</Text>
									</View>

									<View className="flex-row items-center rounded-xl border border-gray-100 py-4 mb-2">
										<Text className="pl-[5px] w-1/3 text-lg font-medium text-gray-600">Name</Text>
										<Text className="flex-1 text-lg font-semibold text-gray-100">{tempName}</Text>
									</View>

									<View className="flex-row items-center rounded-xl border border-gray-100 py-4 mb-2">
										<Text className="pl-[5px] w-1/3 text-lg font-medium text-gray-600">Birthday</Text>
										<Text className="flex-1 text-lg font-semibold text-gray-100">
										{tempBirthday ? tempBirthday.toLocaleString(DateTime.DATE_MED) : "Not set"}
										</Text>
									</View>
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

						<Button
							onPress={() => {
								setEnabledCalendarIds([]);
								Storage.setItemSync("enabledCalendarIds", JSON.stringify([]));

								signOut();
							}}
						>
							Sign Out
						</Button>
					</View>
				)}
			</View>
		</View>
	);
}