import { Button } from "@/components/Button";
import { router } from "expo-router";
import { Text, View, ScrollView } from "react-native";
import { Checkbox } from "@/components/Checkbox";
import { Accordion } from "@/components/Accordion";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCalendars } from "@/hooks/calendar.hooks";

export default function TestButtons() {
	const isPresented = router.canGoBack();
	const queryClient = useQueryClient();
	const { data: calendars, isLoading } = useCalendars();
	return (
		<View className="flex-1 bg-background">
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
			<View className="items-left flex-row flex-wrap gap-4">
				<Button onPress={() => {}}>Create Calendar</Button>
				<Button onPress={() => {}}>Update Calendar</Button>
				<Button onPress={() => {}}>Delete Calendar</Button>
				<Button
					onPress={() => {
						queryClient.invalidateQueries({ queryKey: ["calendars"] });
                        queryClient.setQueryData(["calendars"], []);
					}}
				>
					Invalidate calendars
				</Button>
			</View>
			{!isLoading && calendars && (
				<View className="items-left flex-row flex-wrap gap-4">
					{calendars?.map((calendar) => (
						<Button
							key={calendar.calendar_id}
							onPress={() => {
								console.log("calendar", calendar);
							}}
						>
							{calendar.title}
						</Button>
					))}
				</View>
			)}
		</View>
	);
}
