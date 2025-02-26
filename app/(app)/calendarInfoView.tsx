import { router, useLocalSearchParams } from "expo-router";
import { Text, View, Image, TouchableOpacity, Switch, TextInput } from "react-native";
import { Button } from "@/components/Button";
import { useEffect, useState } from "react";
import { CalendarNameModal } from "@/components/CalendarNameModal";
import { CalendarColorModal } from "@/components/CalendarColorModal";
import { CalendarDefaultNotificationModal } from "@/components/CalendarDefaultNotificationModal";
import { useCalendar, useDeleteCalendar, useUpdateCalendar } from "@/hooks/calendar.hooks";
import { cn } from "@/lib/utils";
import FontAwesome from "@expo/vector-icons/FontAwesome";
export default function CalendarInfoView() {
	const isPresented = router.canGoBack();
	const params = useLocalSearchParams();
	const { data: calendar, isLoading } = useCalendar(params.id as string);
	const [calendarName, setCalendarName] = useState<string>("");
	const [calendarColorHex, setCalendarColorHex] = useState<string>("");
	const [colorModalVisible, setColorModalVisible] = useState(false);
	// const [notificationModalVisible, setNotificationModalVisible] = useState(false);
	// const [calendarDefaultNotification, setCalendarDefaultNotification] = useState<string>();
	const [isPublic, setIsPublic] = useState<boolean>(false);

	useEffect(() => {
		if (calendar && !isLoading) {
			setCalendarColorHex(calendar.color);
			setIsPublic(calendar.is_public);
			setCalendarName(calendar.title);
		}
	}, [calendar, isLoading]);

	const calendarId = params.id as string;
	const { mutate: updateCalendar, isPending: isUpdating } = useUpdateCalendar({
        onSuccess: () => {
            router.back();
        }
    });
	const { mutate: deleteCalendar, isPending: isDeleting } = useDeleteCalendar({
        onSuccess: () => {
            router.back();
        }
    });

	if (isLoading) {
		return <Text className="text-primary">Loading...</Text>;
	}

	if (!calendar) {
		return <Text className="text-primary">Calendar was not found</Text>;
	}

	return (
		<View className="flex-1">
			<CalendarColorModal
				visible={colorModalVisible}
				color={calendarColorHex}
				onClose={() => setColorModalVisible(!colorModalVisible)}
				onColorChange={setCalendarColorHex}
			/>
			{/* <CalendarDefaultNotificationModal
				visible={notificationModalVisible}
				notification={calendarDefaultNotification}
				onClose={() => setNotificationModalVisible(!notificationModalVisible)}
				onNotificationChange={setCalendarDefaultNotification}
			/> */}

			<View className="m-2 flex-row items-center justify-between">
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
				<Text className="text-3xl font-bold text-primary">Edit Calendar</Text>
				<Button
					className={cn((isUpdating || isDeleting) && "opacity-70")}
					onPress={() => {
						deleteCalendar(calendarId);
					}}
					variant={"destructive"}
				>
					<FontAwesome name="trash" size={24} color="black" />
				</Button>
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
						if (
							(calendarName.trim() === calendar.title &&
								calendarColorHex == calendar.color &&
								isPublic == calendar.is_public) ||
							isLoading
						) {
							return;
						}
						updateCalendar(
							{
								calendar_id: calendarId,
								title: calendarName,
								color: calendarColorHex,
								is_public: isPublic,
							},
						);
					}}
					className={cn((isUpdating || isDeleting) && "opacity-70")}
				>
					<Text>Save Changes</Text>
				</Button>
			</View>
		</View>
	);
}
