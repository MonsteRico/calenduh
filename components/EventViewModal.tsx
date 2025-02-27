import { Text, View, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from '@/components/Button';
import { useState } from 'react';
import { DateTime } from 'luxon';
import Feather from '@expo/vector-icons/Feather';



interface EventViewModalProps {
    visible: boolean;
    onClose: () => void;
    calendarId: string;
    eventId: string;
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

    return (
        <Modal
            animationType='fade'
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className='flex-1 justify-center items-center bg-black/50'>
                <View className='bg-background rounded-lg w-[90vw] h-[80vh] shadow-lg overflow-hidden'>
                    <View className='flex-row items-center p-4 border-b border-gray-200'>
                        <TouchableOpacity onPress={onClose} className='p-2 w-16'>
                            <Text className='text-secondary-foreground text-3xl'>✕</Text>
                        </TouchableOpacity>

                        <View className='flex-1 items-center'>
                            <Text className='text-foreground font-bold text-2xl text-center'>{eventName}</Text>
                        </View>

                        <View className='flex-row w-16 justify-end gap-2'>
                            <TouchableOpacity>
                                <Feather name="edit-2" className="mt-[1]" size={24} color="black" />
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Feather name="trash" size={24} color="black" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView
                        className='p-6'
                        contentContainerStyle={{ gap: 16 }}
                    >
                        <View className='flex-row items-center space-x-3'>
                            <Text className='text-foreground font-medium text-xl w-32'>Start Time:</Text>
                            <TimestampDisplay timestamp={startTime} />
                        </View>

                        <View className='flex-row items-center space-x-3'>
                            <Text className='text-foreground font-medium text-xl w-32'>End Time:</Text>
                            <TimestampDisplay timestamp={endTime} />
                        </View>

                        <View className='space-y-3'>
                            <Text className='text-foreground font-medium text-xl'>Description:</Text>
                            <Text className='text-foreground text-lg'>{description}</Text>
                        </View>

                        <View className='flex-row items-center space-x-3'>
                            <Text className='text-foreground font-medium text-xl w-32'>Location:</Text>
                            <Text className='text-foreground text-lg'>{location}</Text>
                        </View>

                        <View className='flex-row items-center space-x-3'>
                            <Text className='text-foreground font-medium text-xl w-32'>Notification:</Text>
                            <Text className='text-foreground text-lg'>{notification}</Text>
                        </View>

                        <View className='flex-row items-center mt-4 py-4 border-t border-gray-200'>
                            <View className='w-6 h-6 rounded-full mr-3' style={{ backgroundColor: calendarColor }} />
                            <Text className='text-foreground text-lg'>{calendarName}</Text>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    )
}

export { EventViewModal };