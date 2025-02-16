import { router } from 'expo-router';
import { Text, View, TouchableOpacity, TextInput, Switch} from 'react-native';
import { Button } from '@/components/Button';
import { useState } from 'react';
import { CalendarColorModal, calendarColors } from '@/components/CalendarColorModal';
import { CalendarDefaultNotificationModal } from '@/components/CalendarDefaultNotificationModal';

function getRandomItem<T>(list: T[]): T {
    return list[Math.floor(Math.random() * list.length)];
}

export default function CreateCalendar() {
    const isPresented = router.canGoBack();
    const [calendarName, setCalendarName] = useState("");
    const [calendarColor, setCalendarColor] = useState(getRandomItem(calendarColors).hex);
    const [colorModalVisible, setColorModalVisible] = useState(false);
    const [notificationModalVisible, setNotificationModalVisible] = useState(false);
    const [calendarDefaultNotification, setCalendarDefaultNotification] = useState("30 minutes before");
    const [calendarSync, setCalendarSync] = useState(true);

    return (
        <View className="flex-1">
            <CalendarColorModal visible={colorModalVisible} color={calendarColor} onClose={() => setColorModalVisible(!colorModalVisible)} onColorChange={setCalendarColor} />
            <CalendarDefaultNotificationModal visible={notificationModalVisible} notification={calendarDefaultNotification}
                onClose={() => setNotificationModalVisible(!notificationModalVisible)} onNotificationChange={setCalendarDefaultNotification} />

            <View className='bg-border items-left flex-row items-center justify-between'>
            <View className='flex-row items-center m-2'>
                    {isPresented && <Button onPress={() => {
                        router.back();
                    }} labelClasses="text-secondary">
                        Cancel
                    </Button>}
                    <Text className='text-3xl font-bold pl-5'>Calendar Info</Text>
                </View>
            </View>
            
            <View className='flex-1 items-center mt-10 gap-10'>
                <View className='flex-row'>
                    <Text className='text-2xl'>Name: </Text>
                    <TextInput value={calendarName} onChangeText={setCalendarName} className='text-2xl text-secondary-foreground border w-60 border-gray-400 p-1'/>
                </View>
            
                <TouchableOpacity onPress={() => setColorModalVisible(true)}>
                    <View className='flex-row'>
                        <Text className='text-2xl'>Color:</Text>
                        <View className='w-8 h-8 rounded-full ml-5' style={{ backgroundColor: calendarColor }} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setNotificationModalVisible(true)}>
                    <View className='flex-col items-center justify-center'>
                        <Text className='text-2xl'>Default notifications:</Text>
                        <Text className='text-xl'>{calendarDefaultNotification}</Text>
                    </View>
                </TouchableOpacity>

                <View className='flex-row items-center justify-center'>
                    <Text className='text-2xl'>Sync: </Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "#808080" }}
                        thumbColor={calendarSync ? "#FFFFFF" : "#F4F4F4"}
                        onValueChange={() => setCalendarSync(!calendarSync)}
                        value={calendarSync}
                    />
                </View>
            </View>

            <View className='flex-row justify-center pb-[50vh]'>
                <View className='flex-row items-center m-2'>
                    <Button labelClasses="text-secondary">Create Calendar</Button>
                </View>
            </View>
        </View>
    )
}