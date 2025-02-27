import { Text, View, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from '@/components/Button';
import { useState } from 'react';
import { DateTime } from 'luxon';
import Feather from '@expo/vector-icons/Feather';
import { useColorScheme } from 'nativewind';
import { router } from 'expo-router';
import { useDeleteEvent } from '@/hooks/event.hooks';



interface EventViewModalProps {
    visible: boolean;
    onClose: () => void;
    calendarId: string | null;
    eventId: string | null;
}

type TimestampDisplayProps = {
    timestamp: string;
};
const TimestampDisplay: React.FC<TimestampDisplayProps> = ({ timestamp }) => {

    const formattedTime = DateTime.fromISO(timestamp).toLocaleString(DateTime.DATETIME_MED);
    return (
        <Text className='text-foreground text-l'>{formattedTime}</Text>
    );
}

function EventViewModal({ visible, onClose, calendarId, eventId }: EventViewModalProps) {
    const [eventName, setEventName] = useState('Test Event Name');
    const [calendarName, setCalendarName] = useState('Test Calendar Name');
    const [calendarColor, setCalendarColor] = useState("#4B89AC");
    const [startTime, setStartTime] = useState('2022-01-01T00:00:00.000Z');
    const [endTime, setEndTime] = useState('2022-01-01T00:00:00.000Z');
    const [location, setLocation] = useState('Test Location');
    const [notification, setNotification] = useState('Test Notification');
    const [description, setDescription] = useState('Test Description');

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


    if (!calendarId || !eventId) {
        return null;
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
								<Text className="text-center text-2xl font-bold text-foreground">{eventName}</Text>
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
								<TimestampDisplay timestamp={startTime} />
							</View>

							<View className="flex-row items-center space-x-3">
								<Text className="w-32 text-xl font-medium text-foreground">End Time:</Text>
								<TimestampDisplay timestamp={endTime} />
							</View>

							<View className="space-y-3">
								<Text className="text-xl font-medium text-foreground">Description:</Text>
								<Text className="text-lg text-foreground">{description}</Text>
							</View>

							<View className="flex-row items-center space-x-3">
								<Text className="w-32 text-xl font-medium text-foreground">Location:</Text>
								<Text className="text-lg text-foreground">{location}</Text>
							</View>

							<View className="flex-row items-center space-x-3">
								<Text className="w-32 text-xl font-medium text-foreground">Notification:</Text>
								<Text className="text-lg text-foreground">{notification}</Text>
							</View>

							<View className="mt-4 flex-row items-center border-t border-gray-200 py-4">
								<View className="mr-3 h-6 w-6 rounded-full" style={{ backgroundColor: calendarColor }} />
								<Text className="text-lg text-foreground">{calendarName}</Text>
							</View>
						</ScrollView>
					</View>
				</View>
			</Modal>
		);
}

export { EventViewModal };