import { Button } from "@/components/Button";
import { router } from "expo-router";
import { Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Checkbox } from "@/components/Checkbox";
import { Accordion } from "@/components/Accordion";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCalendars, useMySubscribedCalendars } from "@/hooks/calendar.hooks";
import { useSQLiteContext } from "expo-sqlite";
import { getCalendarsFromDB } from "@/lib/calendar.helpers";
import { useIsConnected } from "@/hooks/useIsConnected";
import { useEnabledCalendarIds } from "@/hooks/useEnabledCalendarIds";
import { setEnabled } from "react-native/Libraries/Performance/Systrace";
import { DismissKeyboardView } from "@/components/DismissKeyboardView";
import { JoinCalendarModal } from "@/components/JoinCalendarModal";


import { CreateGroupModal } from '@/components/CreateGroupModal';
import { ViewGroupModal } from "@/components/ViewGroupModal";
import { Group } from '@/types/group.types';
import { EditGroupModal } from '@/components/EditGroupModal';
import { useMyGroups } from "@/hooks/group.hooks";
import { Feather } from '@expo/vector-icons';
import { useSession } from "@/hooks/authContext";

import { useFuzzySearchList, Highlight } from '@nozbe/microfuzz/react'
import { Input } from "@/components/Input";

export default function BrowsePublicCalendars() {
	const isPresented = router.canGoBack();
	const queryClient = useQueryClient();
	const { data: calendars, isLoading } = useCalendars();
	const isConnected = useIsConnected();
	const db = useSQLiteContext();

	const [openSubToCalByCode, setSubToCalByCode] = useState(false);
	const [openViewCal, setViewCal] = useState(false);

	

	const { user } = useSession();

	const { data: sub_calendars, isLoading: subIsLoading } = useMySubscribedCalendars();

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

	const [queryText, setQueryText] = useState('');

	const filteredList = useFuzzySearchList({
		list: calendars ?? [],
		queryText,
		getText: (calendar) => [calendar.title],
		mapResultItem: ({ item, score, matches: [highlightRanges] }) => ({ item, highlightRanges })
	})

	return (
			<DismissKeyboardView className="flex-1 bg-background">
				{/* Modals */}
				<JoinCalendarModal
					visible={openSubToCalByCode}
					onClose={() => setSubToCalByCode(false)}
				/>
				{/* <ViewPubCalModal
					visible={openViewCal}
					onClose={() => setViewCal(false)}
					cal={selectedGroup}
				/> */}

	
				{/* Header */}
				<View className="px-4 pt-6 pb-4 bg-primary/5">
					<Text className="text-3xl font-bold text-primary mb-6">Public Calendars</Text>
					<View className="flex-row justify-between">
						<Button
							className="flex-1 ml-2 bg-primary"
							labelClasses="text-secondary font-medium"
							onPress={() => { setSubToCalByCode(true) }}
						>
							Subcribe Via Code
						</Button>
					</View>
				</View>

				<Input placeholder="Search calendars..." value={queryText} onChangeText={setQueryText}/>

				{/* Filtered Calendar List */}
				<View className="px-4 mt-2">
					{filteredList.map(({ item, highlightRanges }) => (
						<View key={item.calendar_id} className="py-2">
							<Text className="text-lg font-medium text-gray-800">
								<Highlight text={item.title} ranges={highlightRanges} />
							</Text>
						</View>
					))}
				</View>
	
				{/* Groups List */}
				<ScrollView className="flex-1 px-4 pt-4">
					{isLoading ? (
						<View className="items-center justify-center py-12">
							<ActivityIndicator size="large" color="#6366f1" />
							<Text className="text-center text-gray-500 mt-4">Loading your public calendars...</Text>
						</View>
					) : (
						<View className="items-center justify-center py-12">
							<View className="bg-gray-100 rounded-full p-4 mb-4">
								<Feather name="users" size={24} color="#6366f1" />
							</View>
							<Text className="text-lg font-semibold text-gray-800 text-center">No Public Calendars Yet</Text>
							<Text className="text-gray-500 text-center mt-2 mb-6">Create a public calendar to get started with shared scheduling.</Text>
						</View>
					)}
				</ScrollView>
			</DismissKeyboardView>
		);
}
