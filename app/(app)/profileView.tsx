import { Button } from "@/components/Button";
import { router } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from "react-native";
import { Input } from "@/components/Input";
import { useState } from "react";
import DateTimePicker from 'react-native-ui-datepicker';
import dayjs from 'dayjs';
import React from "react";
import Feather from '@expo/vector-icons/Feather'
import { useColorScheme } from "nativewind";


export default function ProfileView() {
    const isPresented = router.canGoBack();
    
    const [isEditing, setIsEditing] = useState(false);
    const [username, setUserName] = useState("");
    const [name, setName] = useState("");
    const [birthday, setBirthday] = React.useState(dayjs());
    const { colorScheme } = useColorScheme();

    const [tempUsername, setTempUserName] = useState(username);
    const [tempName, setTempName] = useState(name);
    const [tempBirthday, setTempBirthday] = useState(birthday);


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

    const handleDelete = () => {
        console.log("Account deleted");
    };
    const globColor = colorScheme == "light" ? "black" : "white";
    const globColorInverse = colorScheme == "light" ? "white" : "black";
    return (
        <View>
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
                    <TouchableOpacity onPress={handleDelete} className='mr-4'>
                        <Feather name="trash" size={24} color="red" />
                    </TouchableOpacity>
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
                    <View className="space-y-6">
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
                                <Text className="text-foreground text-xl font-semibold">
                                    {birthday?.format ? birthday.format("MM-DD-YYYY") : "N/A"}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
}