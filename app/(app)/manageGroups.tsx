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
import { CreateGroupModal } from '@/components/CreateGroupModal';
import { ViewGroupModal } from "@/components/ViewGroupModal";
import { Group } from '@/types/group.types';
import { EditGroupModal } from '@/components/EditGroupModal'

export default function ManageGroups() {
	const isPresented = router.canGoBack();
	const queryClient = useQueryClient();
	const { data: calendars, isLoading } = useCalendars();
	const isConnected = useIsConnected();
	const db = useSQLiteContext();

	const [openCreateGroup, setOpenCreateGroup] = useState(false);
	const [openJoinGroup, setOpenJoinGroup] = useState(false);
	const [openViewGroup, setOpenViewGroup] = useState(true);
	const [openEditGroup, setOpenEditGroup] = useState(false);
	const [selectedGroup, setSelectedGroup] = useState<Group>({
		group_id: "",
		name: "",
		calendar_ids: null,
	})

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
			<CreateGroupModal
				visible={openCreateGroup}
				onClose={() => setOpenCreateGroup(false)}
			/>
			<ViewGroupModal
				visible={openViewGroup}
				onClose={() => setOpenViewGroup(false)}
				openEditGroup={() => setOpenEditGroup(true)}
				group={selectedGroup}	
			/>
			<EditGroupModal
				visible={openEditGroup}
				onClose={() => {
					setOpenEditGroup(false)
					setOpenViewGroup(true)
				}}
				group={selectedGroup}
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
