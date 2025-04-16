import { Text, View, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from '@/components/Button';
import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import Feather from '@expo/vector-icons/Feather';
import { useColorScheme } from 'nativewind';
import { router } from 'expo-router';
import { useDeleteEvent } from '@/hooks/event.hooks';
import { useEvent } from '@/hooks/event.hooks';
import { useCalendar } from '@/hooks/calendar.hooks';
import { cn } from '@/lib/utils';
import { useSession } from '@/hooks/authContext';



interface EventViewModalProps {
    visible: boolean;
    onClose: () => void;
    calendarId: string;
    eventId: string;
}

type TimestampDisplayProps = {
    timestamp: DateTime;
	is24Hour?: boolean;
};
const TimestampDisplay: React.FC<TimestampDisplayProps> = ({ timestamp, is24Hour = false }) => {
	const formattedTime = timestamp.toLocaleString({
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: !is24Hour,
	});

	return (
		<Text className='text-foreground text-l'>{formattedTime}</Text>
	);
};

function EventViewModal({ visible, onClose, calendarId, eventId }: EventViewModalProps) {
    const {colorScheme} = useColorScheme();

    function openEditPage() {
        onClose();
        router.navigate(`/updateEvent?eventId=${eventId}&calendarId=${calendarId}`);
    }

    const {mutate: deleteEvent, isPending: isDeleting} = useDeleteEvent({
        onSuccess: () => {
            onClose();
        }
    })

	const { data: event, isLoading } = useEvent(calendarId, eventId);
	const { data: calendar, isLoading: isLoadingCalendar } = useCalendar(calendarId);
	const { user } = useSession();
	const [is24Hour, setIs24Hour] = useState(false);

	useEffect(() => {
		if (user) {
			setIs24Hour(user.is_24_hour);
		}
	}, [user]);

	if (isLoading || !event || !calendar) {
		return <Text className="text-primary">Loading...</Text>;
	}

    return (
			<Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
				<View className="flex-1 items-center justify-center bg-black/50">
					<View className="h-[80vh] w-[98vw] overflow-hidden rounded-lg bg-background shadow-lg">
						<View className="flex-row items-center border-b border-gray-200 p-4">
							<TouchableOpacity onPress={onClose} className="w-16 p-2">
								<Text className="text-3xl text-secondary-foreground">✕</Text>
							</TouchableOpacity>

							<View className="flex-1 items-center">
								<Text className={cn("text-center text-2xl text-foreground", 
									event.priority > 0 && "text-center text-2xl font-bold text-foreground",
									event.priority > 1 && "text-center text-2xl font-bold text-foreground underline",
									event.priority > 2 && "text-center text-2xl font-bold text-foreground underline uppercase")}>{event.name}</Text>
							</View>

							<View className="w-16 flex-row justify-end gap-2">
								<TouchableOpacity onPress={openEditPage}>
									<Feather
										name="edit-2"
										className="mt-[1] text-primary"
										size={24}
										color={colorScheme == "dark" ? "white" : "black"}
									/>
								</TouchableOpacity>
								<TouchableOpacity onPress={() => {
                                    deleteEvent({event_id: eventId, calendar_id: calendarId});
                                }}>
									<Feather name="trash" size={24} color={"red"} />
								</TouchableOpacity>
							</View>
						</View>

						<ScrollView className="p-6" contentContainerStyle={{ gap: 16 }}>
							<View className="flex-row items-center space-x-3">
								<Text className="w-32 text-xl font-medium text-foreground">Start Time:</Text>
								<TimestampDisplay timestamp={event.start_time} is24Hour={is24Hour} />
							</View>

							<View className="flex-row items-center space-x-3">
								<Text className="w-32 text-xl font-medium text-foreground">End Time:</Text>
								<TimestampDisplay timestamp={event.end_time} is24Hour={is24Hour} />
							</View>

							<View className="space-y-3">
								<Text className="text-xl font-medium text-foreground">Description:</Text>
								<Text className="text-lg text-foreground">{event.description}</Text>
							</View>

							<View className="flex-row items-center space-x-3">
								<Text className="w-32 text-xl font-medium text-foreground">Location:</Text>
								<Text className="text-lg text-foreground">{event.location}</Text>
							</View>

							<View className="flex-row items-center space-x-3">
								<Text className="w-32 text-xl font-medium text-foreground">Notification:</Text>
								<Text className="text-lg text-foreground">{event.notification}</Text>
							</View>

							<View className="mt-4 flex-row items-center border-t border-gray-200 py-4">
								<View className="mr-3 h-6 w-6 rounded-full" style={{ backgroundColor: calendar.color }} />
								<Text className="text-lg text-foreground">{calendar.title}</Text>
							</View>
						</ScrollView>
					</View>
				</View>
			</Modal>
		);
}

export { EventViewModal };