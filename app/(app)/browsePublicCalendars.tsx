import { Button } from "@/components/Button";
import { router } from "expo-router";
import { Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAllPublicCalendars, useCalendars, useMySubscribedCalendars } from "@/hooks/calendar.hooks";
import { useSQLiteContext } from "expo-sqlite";
import { useIsConnected } from "@/hooks/useIsConnected";
import { DismissKeyboardView } from "@/components/DismissKeyboardView";
import { JoinCalendarModal } from "@/components/JoinCalendarModal";
import { ToggleByTouch } from "@/components/ToggleByTouch";

import { Feather } from '@expo/vector-icons';
import { useSession } from "@/hooks/authContext";

import { useFuzzySearchList, Highlight } from '@nozbe/microfuzz/react'
import { Input } from "@/components/Input";
import { Calendar } from "@/types/calendar.types";

export default function BrowsePublicCalendars() {
	const isPresented = router.canGoBack();
	const queryClient = useQueryClient();
	const { data: calendars, isLoading } = useCalendars();
	const isConnected = useIsConnected();
	const db = useSQLiteContext();

	const [openSubToCalByCode, setSubToCalByCode] = useState(false);
	const [openToggleByTouch, setToggleByTouch] = useState(false);
	const [selectedCal, setSelectedCal] = useState<Calendar>({
		calendar_id: "",
		user_id: null,
		group_id: null,
		color: "",
		is_public: true,
		title: "",
		invite_code: "",
	});

	const { user } = useSession();

	const { data: sub_calendars, isLoading: subIsLoading } = useMySubscribedCalendars();
	const { data: pub_cals, isLoading: pubIsLoading} = useAllPublicCalendars();

	if (user?.user_id === "localUser") {
		return (
			<View className="flex-1 bg-background">
				<View className="px-6 pt-4 pb-3 bg-muted rounded-b-lg shadow-sm">
					<View className="flex-row justify-between items-center">
						<View className="flex-1">
							<Text className="text-2xl font-bold text-primary">Public Calendars</Text>
							<Text className="text-muted-foreground text-xs">Discover and join shared calendars</Text>
						</View>
					</View>
				</View>

				<View className="items-center justify-center py-16 px-6">
					<View className="bg-muted rounded-full p-5 mb-6 shadow-sm">
						<Feather name="users" size={32} color="hsl(var(--primary))" />
					</View>
					<Text className="text-muted-foreground text-center mt-3 mb-8 leading-5">
						Subscribe to public calendars by creating an account
					</Text>

				</View>
			</View>
		)
	}

	const [queryText, setQueryText] = useState('');

	const filteredList = useFuzzySearchList({
		list: pub_cals ?? [],
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
			<ToggleByTouch
				visible={openToggleByTouch}
				onClose={() => setToggleByTouch(false)}
				cal={selectedCal}
				sub_cals = {sub_calendars ?? []}
			/>

			{/* Header */}
			<View className="px-6 pt-4 pb-3 bg-muted rounded-b-lg shadow-sm">
				<View className="flex-row justify-between items-center">
					<View className="flex-1">
						<Text className="text-2xl font-bold text-primary">Public Calendars</Text>
						<Text className="text-muted-foreground text-xs">Discover and join shared calendars</Text>
					</View>
					<Button
						className="bg-primary rounded-md shadow-sm"
						labelClasses="text-primary-foreground font-medium text-sm"
						onPress={() => { setSubToCalByCode(true) }}
					>
						Join via Code
					</Button>
				</View>
			</View>

			{/* Search Bar */}
			<View className="px-6 py-4">
				<Input 
					placeholder="Search calendars..." 
					value={queryText} 
					onChangeText={setQueryText}
					className="bg-card rounded-md shadow-sm"
				/>
			</View>

			{/* Calendar List */}
			<ScrollView className="flex-1 px-4">
				{isLoading || pubIsLoading ? (
					<View className="items-center justify-center py-16">
						<ActivityIndicator size="large" color="hsl(var(--primary))" />
						<Text className="text-center text-muted-foreground mt-6">Loading calendars...</Text>
					</View>
				) : pub_cals && pub_cals.length > 0 ? (
					<View className="pb-6">
						<Text className="text-muted-foreground text-xs uppercase font-semibold px-4 mb-2 mt-2">
							{filteredList.length} {filteredList.length === 1 ? 'calendar' : 'calendars'} found
						</Text>

						{filteredList.map(({ item, highlightRanges }) => (
							<TouchableOpacity 
								key={item.calendar_id} 
								className="bg-card rounded-md p-4 mb-3 shadow-sm border border-border"
								onPress={() => {
									setSelectedCal(item)
									setToggleByTouch(true)
								}}
							>
								<View className="flex-row items-center justify-between">
									<View className="flex-1">
										<Text className="text-lg font-semibold text-card-foreground">
											<Highlight text={item.title} ranges={highlightRanges} />
										</Text>
										<Text className="text-muted-foreground text-sm mt-1">
											Tap to subscribe
										</Text>
									</View>
									<View className={`h-10 w-2 rounded-full bg-${item.color || 'primary'}`} />
								</View>
							</TouchableOpacity>
						))}
					</View>
				) : (
					<View className="items-center justify-center py-16 px-6">
						<View className="bg-muted rounded-full p-6 mb-6 shadow-sm">
							<Feather name="calendar" size={32} color="hsl(var(--primary))" />
						</View>
						<Text className="text-xl font-bold text-foreground text-center">No Public Calendars</Text>					
					</View>
				)}
			</ScrollView>
		</DismissKeyboardView>
	);
}