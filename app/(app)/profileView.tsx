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
import axios from 'axios';

const EXPO_PUBLIC_SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;

export default function ProfileView() {
	const isPresented = router.canGoBack();

	const [isEditing, setIsEditing] = useState(false);
	const [username, setUserName] = useState("");
	const [name, setName] = useState("");
	const [birthday, setBirthday] = useState(DateTime.fromISO("1900-01-01T00:00:00.000Z"));
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
	
	const { user } = useSession();
	if (!user) {
		return <Text className="text-primary">Loading...</Text>;
	}

	const handleSave = async () => {
		// pass to function
		const updatedUserData: UpdatedUserData = {
			username: tempUsername,
			name: tempName,
			birthday: birthday,
			profile_picture: null,
			// email: email immutable?
		};
		try {
			// Assuming you have the userID (from session or props)
			await updateUser(user.user_id, updatedUserData); // Update user on the server
			setIsEditing(false); // Hide the editing mode
		} catch (error) {
			// Handle any errors that occur during the update
			console.error('Failed to update user:', error);
		}
		setIsEditing(false);
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
			<Modal animationType="fade" transparent={false} visible={visible} onRequestClose={onClose}>
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

	interface UpdatedUserData {
		// email?: string;
		username?: string;
		profile_picture?: string | null;
		birthday?: DateTime;
		name?: string;
	}

	const updateUser = async (userID: string, updatedUserData: UpdatedUserData): Promise<void> => {
		console.log("test!");
		try {
			console.log("updating user:", userID);
	
			console.log("request body:", {
				user_id: userID,
				username: updatedUserData.username,
				profile_picture: updatedUserData.profile_picture,
				birthday: updatedUserData.birthday,
				name: updatedUserData.name,
			});
		
			const response = await fetch(`${EXPO_PUBLIC_SERVER_URL}/users/${userID}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${userID}`,
				},
				body: JSON.stringify({
					user_id: userID,
					username: updatedUserData.username,
					profile_picture: updatedUserData.profile_picture,
					birthday: updatedUserData.birthday,
					name: updatedUserData.name,
				}),
			});
		
			console.log("response status:", response.status);

			if (!response.ok) {
				const errorResponse = await response.text();
				throw new Error(`failed to update user. status: ${response.status}, response: ${errorResponse}`);
			}
		
			const data = await response.json();
			console.log('user now updated: ', data);
		} catch (error) {
		  	console.error('error updating user:', error);
		}
	  };
	  

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

			<View className="ml-1 mr-1 flex-row items-center justify-between">
				<Text className="text-2xl font-bold text-primary">User Profile</Text>
				<View className="w-16 flex-row justify-end gap-6">
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
						<Text className="text-base font-medium text-primary">Username</Text>
						<TextInput
							className="rounded-lg border border-gray-300 p-3 text-primary"
							style={{ backgroundColor: globColorInverse }}
							value={tempUsername}
							onChangeText={setTempUserName}
							placeholder="Username"
						/>

						<Text className="mt-2 text-base font-medium text-primary">Name</Text>
						<TextInput
							className="rounded-lg border border-gray-300 p-3 text-primary"
							style={{ backgroundColor: globColorInverse }}
							value={tempName}
							onChangeText={setTempName}
							placeholder="Name"
						/>

						<Text className="mt-2 text-base font-medium text-primary">Birthday</Text>
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
								value={birthday?.toJSDate()}
								mode={"date"}
								onChange={(e, selectedDate) => {
									if (selectedDate && e.type === "set") {
										const luxonDate = DateTime.fromJSDate(selectedDate);
										setBirthday(luxonDate);
									}
									setShowDatePicker(false);
								}}
							/>
						)}

						<View className="mt-10 flex-row items-center justify-center gap-8">
							<Button onPress={handleSave} labelClasses="text-background">
								Save Changes
							</Button>

							<Button onPress={handleCancel} labelClasses="text-background">
								Cancel
							</Button>
						</View>
					</View>
				) : (
					<View>
						<View className="mt-4">
							<View className="space-y-4">
								<View className="flex-row border-b border-gray-200 p-2">
									<Text className="w-1/3 text-xl font-medium text-primary">Username</Text>
									<Text className="text-xl font-semibold text-primary">{user.username}</Text>
								</View>

								<View className="flex-row border-b border-gray-200 p-2">
									<Text className="w-1/3 text-xl font-medium text-primary">User Id</Text>
									<Text className="text-xl font-semibold text-primary">{user.user_id}</Text>
								</View>

								<View className="flex-row border-b border-gray-200 p-2">
									<Text className="w-1/3 text-xl font-medium text-primary">Birthday</Text>
									<Text className="text-xl font-semibold text-primary">
										{birthday.toLocaleString(DateTime.DATE_MED)}
									</Text>
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
