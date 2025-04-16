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
import { EditGroupModal } from '@/components/EditGroupModal';
import { useMyGroups } from "@/hooks/group.hooks";
import { Feather } from '@expo/vector-icons';
import { useSession } from "@/hooks/authContext";

export default function BrowsePublicCalendars() {
	const isPresented = router.canGoBack();
	const queryClient = useQueryClient();
	const { data: calendars, isLoading } = useCalendars();
	const isConnected = useIsConnected();
	const db = useSQLiteContext();

	const { setEnabledCalendarIds } = useEnabledCalendarIds();

	const { user } = useSession();

	if (user?.user_id === "localUser") {
		return (
			<View>
				<View className="px-4 pt-6 bg-primary/5">
					<Text className="text-3xl font-bold text-primary mb-6">Public Calendars</Text>
				</View>


				<View className="items-center justify-center py-12">
					<View className="bg-gray-100 rounded-full p-4 mb-4">
						<Feather name="users" size={24} color="#6366f1" />
					</View>
					<Text className="text-lg font-semibold text-gray-800 text-center">Subcribing is not Enabled for Guest Accounts</Text>
					<Text className="text-gray-500 text-center mt-2 mb-6">Create an account to subscribe to calendars</Text>
				</View>
			</View>
		)
	}

	return <View className="flex-1 bg-background">

	</View>;
}
