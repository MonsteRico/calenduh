import { Button } from "@/components/Button";
import { router } from "expo-router";
import { Text, View, ScrollView } from "react-native";
import { Checkbox } from "@/components/Checkbox";
import { Accordion } from "@/components/Accordion";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCalendars } from "@/hooks/calendar.hooks";
import { useSQLiteContext } from "expo-sqlite";
import { getCalendarsFromDB } from "@/lib/calendar.helpers";
import { useIsConnected } from "@/hooks/useIsConnected";
import { useEnabledCalendarIds } from "@/hooks/useEnabledCalendarIds";
import { setEnabled } from "react-native/Libraries/Performance/Systrace";
import { DismissKeyboardView } from "@/components/DismissKeyboardView";
import { JoinGroupModal } from "@/components/JoinGroupModal";

export default function ManageGroups() {
	const isPresented = router.canGoBack();
	const queryClient = useQueryClient();
	const { data: calendars, isLoading } = useCalendars();
	const isConnected = useIsConnected();
	const db = useSQLiteContext();

	const [openCreateGroup, setOpenCreateGroup] = useState(false);
	const [openJoinGroup, setOpenJoinGroup] = useState(false);

	const { setEnabledCalendarIds } = useEnabledCalendarIds();
	return (
		<DismissKeyboardView className="flex-1 bg-background">
			<JoinGroupModal
				visible={openJoinGroup}
				onClose={() => setOpenJoinGroup(false)}
				setGroupCode={(code) => {
					//TODO: Handle group joining with code - also might want to move this logic into the modal
					console.log(code);
				}}
			/>
			<View className='m-2 flex-row items-center justify-between'>
				<Text className='text-3xl font-bold text-primary'>Groups</Text>

				<Button
					labelClasses='text-secondary'
					onPress={() => {setOpenCreateGroup(true)}}
				>
					Create Group
				</Button>

				<Button
					labelClasses='text-secondary'
					onPress={() => {setOpenJoinGroup(true)}}
				>
					Join Group
				</Button>
			</View>

			
			
		</DismissKeyboardView>
	);
}
