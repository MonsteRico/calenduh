import { router } from "expo-router";
import { Text, View, TouchableOpacity, TextInput, Switch } from "react-native";
import { Button } from "@/components/Button";
import { useEffect, useState } from "react";
import { CalendarColorModal, calendarColors } from "@/components/CalendarColorModal";
import { CalendarDefaultNotificationModal } from "@/components/CalendarDefaultNotificationModal";

import { Platform } from "react-native";
import { useCreateCalendar } from "@/hooks/calendar.hooks";
import { useIsConnected } from "@/hooks/useIsConnected";

function getRandomItem<T>(list: T[]): T {
	return list[Math.floor(Math.random() * list.length)];
}

export default function CreateCalendar() {
	const isPresented = router.canGoBack();
	const [calendarName, setCalendarName] = useState("");
	const [calendarColorHex, setCalendarColor] = useState(getRandomItem(calendarColors).hex);
	const [colorModalVisible, setColorModalVisible] = useState(false);
	const [notificationModalVisible, setNotificationModalVisible] = useState(false);
	const [calendarDefaultNotification, setCalendarDefaultNotification] = useState("30 minutes before");
	const [isPublic, setIsPublic] = useState(false);
	const { mutate } = useCreateCalendar();


	return (
		<View className="flex-1 bg-background">
			<CalendarColorModal
				visible={colorModalVisible}
				color={calendarColorHex}
				onClose={() => setColorModalVisible(!colorModalVisible)}
				onColorChange={setCalendarColor}
			/>
			<CalendarDefaultNotificationModal
				visible={notificationModalVisible}
				notification={calendarDefaultNotification}
				onClose={() => setNotificationModalVisible(!notificationModalVisible)}
				onNotificationChange={setCalendarDefaultNotification}
			/>

			<View className="items-left flex-row items-center justify-between bg-muted">
				<View className="m-2 flex-row items-center">
					{isPresented && (
						<Button
							onPress={() => {
								router.back();
							}}
							labelClasses="text-secondary"
						>
							Cancel
						</Button>
					)}
					<Text className="pl-5 text-3xl font-bold text-primary">Create Calendar</Text>
				</View>
			</View>

			<View className="mt-5 flex flex-col gap-5 px-8">
				<View className="flex-row">
					<Text className="text-2xl text-primary">Name: </Text>
					<TextInput
						value={calendarName}
						onChangeText={setCalendarName}
						className="w-60 border border-gray-400 p-1 text-2xl text-primary"
					/>
				</View>

				<TouchableOpacity onPress={() => setColorModalVisible(true)}>
					<View className="flex-row">
						<Text className="text-2xl text-primary">Color:</Text>
						<View className="ml-5 h-8 w-8 rounded-full" style={{ backgroundColor: calendarColorHex }} />
					</View>
				</TouchableOpacity>

				{/* <TouchableOpacity className="flex-row items-center gap-3" onPress={() => setNotificationModalVisible(true)}>
					<Text className="text-2xl text-primary">Default notifications:</Text>
					<Text className="text-xl text-primary">{calendarDefaultNotification}</Text>
				</TouchableOpacity> */}

				<View className="flex-row items-center">
					<Text className="text-2xl text-primary">Make Public?: </Text>
					<Switch
						trackColor={{ false: "#767577", true: "#808080" }}
						thumbColor={isPublic ? "#FFFFFF" : "#F4F4F4"}
						onValueChange={() => setIsPublic(!isPublic)}
						value={isPublic}
					/>
				</View>

				<Button
					onPress={() => {
						if (calendarName.trim() === "") {
							return;
						}
						mutate({
							group_id: null,
							title: calendarName,
							color: calendarColorHex,
							is_public: isPublic,
							user_id: null,
						});
						router.back();
					}}
				>
					Create Calendar
				</Button>
			</View>
		</View>
	);
}
