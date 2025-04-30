import { router, useLocalSearchParams } from "expo-router";
import { Text, View, Image, TouchableOpacity, Switch, TextInput } from "react-native";
import { Button } from "@/components/Button";
import { useEffect, useState } from "react";
import { useCalendar, useDeleteCalendar, useUpdateCalendar, useUpdateGroupCalendar, useDeleteGroupCalendar } from "@/hooks/calendar.hooks";
import { cn } from "@/lib/utils";
import Dropdown from '@/components/Dropdown';
import { Input } from '@/components/Input';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { calendarColors } from "@/components/CalendarColorModal";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import { DismissKeyboardView } from "@/components/DismissKeyboardView";
import * as Clipboard from "expo-clipboard"

export default function CalendarInfoView() {
	//TODO: Display groups name if there is one (can't change group though)
	const isPresented = router.canGoBack();
	const params = useLocalSearchParams();
	const { data: calendar, isLoading } = useCalendar(params.id as string);
	const [calendarName, setCalendarName] = useState("");
	const [calendarColorHex, setCalendarColorHex] = useState("");
	const [calendarShareCode, setCalendarShareCode] = useState("");
	const [isPublic, setIsPublic] = useState(false);
	const [matchingColor, setMatchingColor] = useState(calendarColors[0]);
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
	const { mutate: updateGroupCalendar } = useUpdateGroupCalendar({
		onSuccess: () => {
			router.back();
		}
	})
	
	const onSubmit = () => {
		if ((calendarName.trim() === "" || calendarName.trim() === calendar?.title
			&& calendarColorHex === calendar?.color && isPublic === calendar?.is_public) || isLoading) {
			return;
		}
		console.log("CALENDAR GROUP ID:      ", calendar?.group_id);
		if (calendar?.group_id !== null) {
			console.log("USED UPDATE GROUP CALENDAR")
			updateGroupCalendar(
				{
					calendar_id: calendarId,
					title: calendarName,
					color: calendarColorHex,
					is_public: isPublic,
					group_id: calendar?.group_id
				}
			)
		}
		else {
			updateCalendar(
				{
					calendar_id: calendarId,
					title: calendarName,
					color: calendarColorHex,
					is_public: isPublic,
				},
			);
		}
	}

	useEffect(() => {
		if (calendar && !isLoading) {
			setCalendarColorHex(calendar.color);
			setIsPublic(calendar.is_public);
			setCalendarName(calendar.title);
			setMatchingColor(calendarColors.find(color => color.hex === calendar.color)!);
		}
	}, [calendar, isLoading]);

	const calendarId = params.id as string;


	if (isLoading) {
		return <Text className="text-primary">Loading...</Text>;
	}

	if (!calendar) {
		return <Text className="text-primary">Calendar was not found</Text>;
	}

	return (
		<DismissKeyboardView className="flex-1 bg-background">
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
				<Text className="items-center pl-5 text-3xl font-bold text-primary">Edit Calendar</Text>

				<ConfirmDelete onDelete={() => deleteCalendar(calendarId)} buttonClass="mr-4 ml-6" />
			</View>

			<View className="mt-5 flex flex-col gap-2 px-8">
				<Input
					label="Name:"
					className="text-primary"
					value={calendarName}
					onChangeText={setCalendarName}
					placeholder="Calendar Name"
				/>

				<View className="flex-col gap-1">
					<Text className="text-primary">Color:</Text>
					<Dropdown<{ hex: string; name: string }>
						options={calendarColors}
						defaultValue={matchingColor}
						renderItem={(calendarColor) => (
							<View className="flex flex-row items-center gap-2">
								<View className="h-6 w-6 rounded-full" style={{ backgroundColor: calendarColor.hex }} />
								<Text className="text-primary">{calendarColor.name}</Text>
							</View>
						)}
						onSelect={(selectedCalendarColor) => {
							setCalendarColorHex(selectedCalendarColor.hex);
						}}
					/>
				</View>

				<View className="mb-6 mt-4 rounded-lg border border-border bg-muted p-3">
					<View className="flex-row items-center justify-between">
						<View className="flex-1">
							<Text className="font-semibold text-primary">Make Calendar Public</Text>
							<Text className="mt-1 text-sm text-muted-foreground">Public calendars are visible to all app users</Text>
						</View>
						<Switch
							trackColor={{ false: "#767577", true: "#4CAF50" }}
							thumbColor={isPublic ? "#FFFFFF" : "#F4F4F4"}
							onValueChange={() => setIsPublic(!isPublic)}
							value={isPublic}
						/>
					</View>
				</View>

				<View className="mb-5 flex-row gap-1">
					<Text className="mr-2 font-semibold text-primary">Share Code:</Text>
					<Text className="text-primary">{calendar.invite_code}</Text>
				</View>

				<Text className="font-semibold text-primary">iCal Subscribe Link:</Text>
				<Button variant="link" className="mb-5" onPress={async () => {
					await Clipboard.setUrlAsync(`https://calenduh.technowizzy.dev/calendars/${calendar.calendar_id}.ical`);
					alert("iCal URL copied to clipboard. Open in your browser to download!")
				}}>
					<Text className="text-sm text-wrap text-primary">{`https://calenduh.technowizzy.dev/calendars/${calendar.calendar_id}.ical`}</Text>
				</Button>

				<Button onPress={() => onSubmit()} className={cn((isUpdating || isDeleting) && "opacity-70")}>
					<Text>Save Changes</Text>
				</Button>
			</View>
		</DismissKeyboardView>
	);
}
