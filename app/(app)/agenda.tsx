import { useEventsForDay } from "@/hooks/event.hooks";
import { useCurrentViewedDay } from "@/hooks/useCurrentViewedDay";
import { Text, View } from "react-native";

export default function Agenda() {
	const { dayBeingViewed } = useCurrentViewedDay();
	const { data: events, isLoading } = useEventsForDay(dayBeingViewed);

	if (isLoading) return <Text className="text-primary">Loading...</Text>;
	return (
		<View className="flex flex-col gap-4">
			<Text className="text-primary">Agenda</Text>
			{events?.map((event) => (
				<Text className="text-primary" key={event.event_id}>
					{event.name}
				</Text>
			))}
		</View>
	);
}
