import { Button } from "@/components/Button";
import { router } from "expo-router";
import { Modal, Text, View, TouchableOpacity, TextInput, Platform, ScrollView } from "react-native";
import { Input } from "@/components/Input";
import { useState } from "react";
import dayjs from 'dayjs';
import React from "react";
import Feather from '@expo/vector-icons/Feather'
import { useColorScheme } from "nativewind";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import { GuestSignInModal } from "@/components/GuestSignInModal";
import { DateTime } from "luxon";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useDeleteUser } from "@/hooks/user.hooks";
import { useSession } from "@/hooks/authContext";
import { CalendarItem } from "./calendarsList";
import { useMyCalendars } from "@/hooks/calendar.hooks";


export default function ProfileView() {
    const isPresented = router.canGoBack();

    const [isEditing, setIsEditing] = useState(false);
    const [username, setUserName] = useState("");
    const [name, setName] = useState("");
    const [birthday, setBirthday] = useState(DateTime.fromISO('1900-01-01T00:00:00.000Z'));
    const { colorScheme } = useColorScheme();

    const [tempUsername, setTempUserName] = useState(username);
    const [tempName, setTempName] = useState(name);
    const [tempBirthday, setTempBirthday] = useState(birthday);

    const [signInModalVisible, setSignInModalVisible] = useState(false);
    const [mergeCalendarModalVisible, setMergeCalendarModalVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const { data: calendars, isLoading } = useMyCalendars();


    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleSave = () => {
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setTempUserName(username);
        setTempName(name);
        setTempBirthday(birthday);
    };

    const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser({});

    const globColor = colorScheme == "light" ? "black" : "white";
    const globColorInverse = colorScheme == "light" ? "white" : "black";

    const { user } = useSession();
    if (!user) {
        return <Text className="text-primary">Loading...</Text>;
    }

    
    type MergeCalendarModalProps = {
        visible: boolean;
        onClose: () => void;
    };

    const MergeCalendarModal: React.FC<MergeCalendarModalProps> = ({ visible, onClose }) => {
        return (
            <Modal animationType='fade' transparent={false} visible={visible} onRequestClose={onClose}>
                <View className='flex-1 justify-center items-center bg-black/50'>
                    <View className='w-[90vw] max-h-[80vh] bg-background rounded-2xl p-6 shadow-lg'>
                        <Text className='text-xl font-bold mb-3 text-center'>Merge Calendars</Text>

                        <Text className='text-foreground mb-5 text-base text-center'>Select calendars to merge with your online account{"\n"}
                        <Text className='text-red-600 font-medium'>(calendars not selected will be deleted)</Text>
                        </Text>
                        

                        <ScrollView className='max-h-96' contentContainerClassName='pb-2'>
                            <View className='flex-col space-y-3'>
                                {calendars?.map((calendar, i) => (
                                    <CalendarItem
                                        checked={true}
                                        key={calendar.calendar_id}
                                        calendarName={calendar.title}
                                        calendarColor={calendar.color}
                                        editMode={false}
                                        onPress={() => { }}
                                    />
                                ))}
                            </View>
                        </ScrollView>

                        <View className='flex-row justify-between mt-6 space-x-3'>
                            <Button labelClasses='font-secondary' onPress={onClose}>Cancel</Button>
                            <Button labelClasses='font-secondary' onPress={onClose}>Merge Selected</Button>
                        </View>
                    </View>
                </View>
            </Modal>
        );

    }

    return (
        <View>
            <GuestSignInModal
                visible={signInModalVisible}
                onClose={() => setSignInModalVisible(false)}
            />

            <MergeCalendarModal
                visible={mergeCalendarModalVisible}
                onClose={() => setMergeCalendarModalVisible(false)}
                />

            <View className="flex-row justify-between items-center ml-1 mr-1">
                {isPresented && (
                    <Button onPress={() => router.back()}>
                        Go Back
                    </Button>
                )}
                <Text className="text-2xl font-bold">User Profile</Text>
                <View className="flex-row w-16 justify-end gap-6">
                    <TouchableOpacity onPress={handleEditToggle}>
                        <Feather name="edit-2" className="mt-[1]" size={24} color={globColor} />
                    </TouchableOpacity>
                    <ConfirmDelete onDelete={() => {deleteUser(user.user_id)}} buttonClass='mr-4' />
                </View>
            </View>

            <View className="bg-gray-50 rounded-xl p-6 shadow-md">
                {isEditing ? (
                    <View className="space-y-4">
                        <Text className="text-foreground font-medium text-base">Username</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3 text-foreground"
                            style={{ backgroundColor: globColorInverse }}
                            value={tempUsername}
                            onChangeText={setTempUserName}
                            placeholder="Username"
                        />

                        <Text className="text-foreground font-medium text-base mt-2">Name</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3 text-foreground"
                            style={{ backgroundColor: globColorInverse }}
                            value={tempName}
                            onChangeText={setTempName}
                            placeholder="Name"
                        />

                        <Text className="text-foreground font-medium text-base mt-2">Birthday</Text>
                        <View className="border border-gray-300 rounded-lg" style={{ backgroundColor: globColorInverse }}>
                            <Text className="text-foreground font-medium text-base">Placeholder for Date Time Picker</Text>
                        </View>

                        <View className='flex-row items-center gap-8 justify-center mt-10'>
                            <Button onPress={handleSave}
                                labelClasses="text-background"
                            >
                                Save Changes
                            </Button>

                            <Button onPress={handleCancel}
                                labelClasses="text-background"
                            >
                                Cancel
                            </Button>
                        </View>
                    </View>
                ) : (
                    <View>
                        <View className="mt-4">
                            <View className="space-y-4">
                                <View className="flex-row border-b border-gray-200 p-2 ">
                                    <Text className="text-foreground text-xl font-medium w-1/3">Username</Text>
                                    <Text className="text-foreground text-xl font-semibold">{username}</Text>
                                </View>

                                <View className="flex-row border-b border-gray-200 p-2">
                                    <Text className="text-foreground text-xl font-medium w-1/3">Name</Text>
                                    <Text className="text-foreground text-xl font-semibold">{name}</Text>
                                </View>

                                <View className="flex-row border-b border-gray-200 p-2">
                                    <Text className="text-foreground text-xl font-medium w-1/3">Birthday</Text>
                                    {Platform.OS === 'android' && (
                                        <TouchableOpacity
                                            className='bg-gray-200 px-4 py-2 rounded-lg flex flex-row items-center space-x-2'
                                            onPress={() => setShowDatePicker(true)}
                                        >
                                            <Text className='text-primary font-medium'>{birthday.toLocaleString(DateTime.DATE_MED)}</Text>
                                        </TouchableOpacity>
                                    )}
                                    {(showDatePicker || Platform.OS === "ios") && (
                                        <DateTimePicker
                                            value={birthday?.toJSDate()}
                                            mode={"date"}
                                            onChange={(e, selectedDate) => {
                                                if (selectedDate && e.type === "set") {
                                                    const luxonDate = DateTime.fromJSDate(selectedDate);
                                                    setBirthday(luxonDate);
                                                }
                                                setShowDatePicker(false);
                                            }}
                                        />
                                    )}
                                </View>
                            </View>
                        </View>

                        <View className='flex-col items-center justify-center'>
                            <Button className='m-8 mr-10 ml-10' onPress={() => setSignInModalVisible(!signInModalVisible)}>Sign-In</Button>
                            <Button onPress={() => setMergeCalendarModalVisible(!mergeCalendarModalVisible)}>Merge Calendars</Button>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
}