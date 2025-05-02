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
import { NotificationTimes } from '@/constants/notificationTimes';
import { useMyGroups } from '@/hooks/group.hooks';
import * as Clipboard from "expo-clipboard";

import { Image } from 'react-native';

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

function convertCronToRecurrence(cronString: string) {
	if (!cronString || typeof cronString !== 'string' || cronString.trim() === '') {
		return '';
	}

	const parts = cronString.trim().split(/\s+/)
	if (parts.length < 5) {
		return '';
	}
	const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

	if ((dayOfMonth === '*' || dayOfMonth === '?') &&
		month === '*' &&
		(dayOfWeek === '*' || dayOfWeek === '?')) {
		return 'Daily';
	}
	if ((dayOfMonth === '*' || dayOfMonth === '?') &&
		month === '*' &&
		dayOfWeek !== '*' &&
		dayOfWeek !== '?') {
		return 'Weekly';
	}
	if (dayOfMonth !== '*' &&
		dayOfMonth !== '?' &&
		month === '*' &&
		(dayOfWeek === '*' || dayOfWeek === '?')) {
		return 'Monthly';
	}
	if ((dayOfMonth !== '*' && dayOfMonth !== '?') &&
		month !== '*') {
		return 'Yearly';
	}
	return 'Custom';

}


function convertPriorityToString(prio: number) {
	if (prio > 3 || prio < 0) {
		return '';	
	}
	if (prio === 0) {
		return 'None';
	} else if (prio === 1) {
		return 'Low';
	} else if (prio === 2) {
		return 'Medium';
	} else if (prio === 3) {
		return 'High';
	}
}

function convertNotificationToString(notif: number) {
	if (notif === NotificationTimes.TIME_OF_EVENT) {
		return "Time of event";
	} else if (notif === NotificationTimes.FIFTEEN_MINUTES_MS) {
		return "15 minutes before";
	} else if (notif === NotificationTimes.THIRTY_MINUTES_MS) {
		return "30 minutes before";
	} else if (notif === NotificationTimes.ONE_HOUR_MS) {
		return "1 hour before";
	} else if (notif === NotificationTimes.ONE_DAY_MS) {
		return "1 day before";
	} else {
		return "None"
	}
}

function EventViewModal({ visible, onClose, calendarId, eventId }: EventViewModalProps) {
	const { colorScheme } = useColorScheme();

	function openEditPage() {
		onClose();
		router.navigate(`/updateEvent?eventId=${eventId}&calendarId=${calendarId}`);
	}

	const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent({
		onSuccess: () => {
			onClose();
		}
	})

	const { data: event, isLoading } = useEvent(calendarId, eventId);
	const { data: calendar, isLoading: isLoadingCalendar } = useCalendar(calendarId);
	const { data: groups, isLoading: isLoadingGroups } = useMyGroups();
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

	const eventShareLink = `calenduh://createEvent?start_time=${encodeURIComponent(event.start_time.toUTC().toISO() as string)}&end_time=${encodeURIComponent(event.end_time.toUTC().toISO() as string)}&name=${encodeURIComponent(event.name)}&all_day=${encodeURIComponent(event.all_day)}&recurrence=${encodeURIComponent(event.frequency ?? "")}&location=${encodeURIComponent(event.location)}&description=${encodeURIComponent(event.description)}`


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
						
						{(user?.user_id === calendar.user_id || groups?.some(group => group.group_id === calendar.group_id)) &&
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
								deleteEvent({ event_id: eventId, calendar_id: calendarId });
							}}>
								<Feather name="trash" size={24} color={"red"} />
							</TouchableOpacity>
						</View>
					}
					</View>


					<ScrollView className="p-6" contentContainerStyle={{ gap: 16 }}>
						<View className="flex-row items-center space-x-3">
							<Text className="w-32 text-xl font-medium text-primary">Start Time:</Text>
							<TimestampDisplay timestamp={event.start_time} is24Hour={is24Hour} />
						</View>

						<View className="flex-row items-center space-x-3">
							<Text className="w-32 text-xl font-medium text-primary">End Time:</Text>
							<TimestampDisplay timestamp={event.end_time} is24Hour={is24Hour} />
						</View>

						<View className='border-t border-border' />
						<View className='flex-row'>
							<View className="mr-3 h-6 w-6 rounded-full" style={{ backgroundColor: calendar.color }} />
							<Text className="text-lg text-primary">{calendar.title}</Text>
						</View>
						<View className='border-t border-border' />

						<View className='flex-row items-center'>
							<Text className="mr-3 text-xl font-medium text-primary">Description:</Text>
							<Text className="text-lg text-primary">{event.description}</Text>
						</View>

						<View className="flex-row items-center">
							<Text className="mr-10 text-xl font-medium text-primary">Location:</Text>
							<Text className="text-lg text-primary">{event.location}</Text>
						</View>

						{event.img && (
							<View className="mt-4">
								<Text className="mb-2 text-xl font-medium text-primary">Image:</Text>
								<Image
								source={{ uri: `${process.env.EXPO_PUBLIC_S3_URL}/${event.img}` }}
								className="h-48 w-full rounded-lg"
								resizeMode="contain"
								/>
							</View>
						)}

						<View className='border-t border-border' />

						<View className='flex-row items-center'>
							<Text className='mr-5 text-xl font-medium text-primary'>Recurrence:</Text>
							<Text className='text-lg text-primary'>{convertCronToRecurrence(event.frequency ?? '')}</Text>
						</View>

						<View className='flex-row items-center'>
							<Text className='mr-[50px] text-xl font-medium text-primary'>Priority:</Text>
							<Text className='text-lg text-primary'>{convertPriorityToString(event.priority)}</Text>
						</View>

						<View className='border-t border-border' />

						<View className="flex-row items-center space-x-3">
							<Text className="mr-10 text-xl font-medium text-primaryd">First Notification:</Text>
							<Text className="text-lg text-primary">{convertNotificationToString(event.first_notification ?? -1)}</Text>
						</View>

						<View className='flex-row items-center space-x-3'>
							<Text className='mr-4 text-xl font-medium text-primary'>Second Notification:</Text>
							<Text className='text-lg text-primary'>{convertNotificationToString(event.second_notification ?? -1)}</Text>
						</View>

						<View className='flex-row items-center space-x-3'>
							<Button variant={"default"} onPress={async () => {
								await Clipboard.setStringAsync(eventShareLink)
								alert("Share Link copied!")
							}}>Copy Share Link</Button>
						</View>

					</ScrollView>
				</View>
			</View>
		</Modal>
	);
}

export { EventViewModal };