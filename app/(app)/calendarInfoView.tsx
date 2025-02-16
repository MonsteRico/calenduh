import { router } from "expo-router";
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { Button } from "@/components/Button";
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import { useState } from 'react';
import { CalendarNameModal } from '@/components/CalendarNameModal';
import { CalendarColorModal } from '@/components/CalendarColorModal';

export default function CalendarInfoView() {
    const isPresented = router.canGoBack();
    const settings_icon = require('@/assets/images/settings_icon.png');
    const [nameModalVisible, setNameModalVisible] = useState(false);
    const [calendarName, setCalendarName] = useState("Test");
    const [calendarColor, setCalendarColor] = useState("#E63946");
    const [colorModalVisible, setColorModalVisible] = useState(false);

    const [tempName, setTempName] = useState(calendarName);
    const [tempColor, setTempColor] = useState(calendarColor);

    const updateCalendar = () => {
        setCalendarName(tempName);
        setCalendarColor(tempColor);
    }
    const cancelChanges = () => {
        setTempName(calendarName);
        setTempColor(calendarColor);
    }

    return (
        <View className="flex-1">
            <CalendarNameModal visible={nameModalVisible} name={tempName} onClose={() => setNameModalVisible(!nameModalVisible)} onNameChange={setTempName} />
            <CalendarColorModal visible={colorModalVisible} color={tempColor} onClose={() => setColorModalVisible(!colorModalVisible)} onColorChange={setTempColor} />

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
                        <View className="w-10 h-10 rounded-full ml-5" style={{ backgroundColor: tempColor }} />
                    </View>
                </TouchableOpacity>
                <Text className='text-2xl'>Default notifications:</Text>
                <Text className="text-2xl">Sync: </Text>

            </View>

            <View className="pb-[40vh] items-center">
                {(tempName != calendarName || tempColor != calendarColor) &&
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
