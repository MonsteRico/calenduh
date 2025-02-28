import { Button } from "@/components/Button";
import { EventViewModal } from "@/components/EventViewModal";
import { useEventsForDay } from "@/hooks/event.hooks";
import { useCurrentViewedDay } from "@/hooks/useCurrentViewedDay";
import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

export default function Agenda() {
	const { dayBeingViewed } = useCurrentViewedDay();
	const { data: events, isLoading } = useEventsForDay(dayBeingViewed);

	const [eventIdToView, setEventIdToView] = useState<string | null>(null);
	const [calendarIdToView, setCalendarIdToView] = useState<string | null>(null);

	if (isLoading) return <Text className="text-primary">Loading...</Text>;
	return (
		<View className="flex flex-col gap-4">
            <Button onPress={() => {router.back()}}>BACK</Button>
			{eventIdToView && calendarIdToView && (<EventViewModal
				visible={eventIdToView != null}
				eventId={eventIdToView}
				calendarId={calendarIdToView}
				onClose={() => {
					setEventIdToView(null);
					setCalendarIdToView(null);
				}}
			/>)}
			<Text className="text-primary">Agenda</Text>
			{events?.map((event) => (
				<Button
					onPress={() => {
						// router.navigate(`/editEvent?eventId=${event.event_id}&calendarId=${event.calendar_id}`);
                        setEventIdToView(event.event_id);
                        setCalendarIdToView(event.calendar_id);
					}}
					className="text-primary"
					key={event.event_id}
				>
					{event.name}
				</Button>
			))}
		</View>
	);
}
