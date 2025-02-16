import { router } from "expo-router";
import { Text, View, Image, TouchableOpacity, Switch } from 'react-native';
import { Button } from "@/components/Button";
import { useState } from 'react';
import { CalendarNameModal } from '@/components/CalendarNameModal';
import { CalendarColorModal } from '@/components/CalendarColorModal';
import { CalendarDefaultNotificationModal } from '@/components/CalendarDefaultNotificationModal';


export default function CalendarInfoView() {
    const isPresented = router.canGoBack();
    const [nameModalVisible, setNameModalVisible] = useState(false);
    const [calendarName, setCalendarName] = useState("Test");
    const [calendarColor, setCalendarColor] = useState("#E63946");
    const [colorModalVisible, setColorModalVisible] = useState(false);
    const [notificationModalVisible, setNotificationModalVisible] = useState(false);
    const [calendarDefaultNotification, setCalendarDefaultNotification] = useState("30 minutes before");
    const [calendarSync, setCalendarSync] = useState(true);


    const [tempName, setTempName] = useState(calendarName);
    const [tempColor, setTempColor] = useState(calendarColor);
    const [tempNotification, setTempNotification] = useState(calendarDefaultNotification);
    const [tempSync, setTempSync] = useState(calendarSync);

    const updateCalendar = () => {
        setCalendarName(tempName);
        setCalendarColor(tempColor);
        setCalendarDefaultNotification(tempNotification);
        setCalendarSync(tempSync);
    }
    const cancelChanges = () => {
        setTempName(calendarName);
        setTempColor(calendarColor);
        setTempNotification(calendarDefaultNotification);
        setTempSync(calendarSync);
    }



    return (
        <View className="flex-1">
            <CalendarNameModal visible={nameModalVisible} name={tempName} onClose={() => setNameModalVisible(!nameModalVisible)} onNameChange={setTempName} />
            <CalendarColorModal visible={colorModalVisible} color={tempColor} onClose={() => setColorModalVisible(!colorModalVisible)} onColorChange={setTempColor} />
            <CalendarDefaultNotificationModal visible={notificationModalVisible} notification="None" onClose={() => setNotificationModalVisible(!notificationModalVisible)}
                onNotificationChange={setTempNotification}
            />

            <View className='bg-border items-left flex-row items-center justify-between'>
                <View className='flex-row items-center m-2'>
                    {isPresented && <Button onPress={() => {
                        router.back();
                    }} labelClasses="text-secondary">
                        Back
                    </Button>}
                    <Text className='text-3xl font-bold pl-5'>Calendar Info</Text>
                </View>

                <View className="mr-[1%] flex-row items-center gap-4">
                    <Button labelClasses="text-secondary">Delete Calendar</Button>
                </View>

            </View>

            <View className='flex-1 items-center m-10 gap-10'>
                <TouchableOpacity onPress={() => setNameModalVisible(true)}>
                    <View className='flex-row'>
                        <Text className='text-2xl'>Name: {tempName}</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setColorModalVisible(true)}>
                    <View className='flex-row'>
                        <Text className='text-2xl'>Color:</Text>
                        <View className="w-8 h-8 rounded-full ml-5" style={{ backgroundColor: tempColor }} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setNotificationModalVisible(true)}>
                    <View className='flex-col items-center justify-center'>
                        <Text className='text-2xl'>Default notifications:</Text>
                        <Text className='text-xl'>{tempNotification}</Text>
                    </View>
                </TouchableOpacity>

                <View className='flex-row items-center justify-center'>
                    <Text className='text-2xl'>Sync: </Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "#808080" }}
                        thumbColor={tempSync ? "#FFFFFF" : "#F4F4F4"}
                        onValueChange={() => setTempSync(!tempSync)}
                        value={tempSync}
                    />
                </View>
            </View>

            <View className="pb-[40vh] items-center">
                {(tempName != calendarName || tempColor != calendarColor || calendarDefaultNotification != tempNotification || calendarSync != tempSync) &&
                    <View className="flex-row gap-5">
                        <Button onPress={cancelChanges} className="text-secondary">
                            <Text>Cancel Changes</Text>
                        </Button>
                        <Button onPress={updateCalendar} className="text-secondary">
                            <Text>Save Changes</Text>
                        </Button>
                    </View>

                }
            </View>
        </View>
    )
}
