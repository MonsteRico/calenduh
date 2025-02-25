import { Button } from "@/components/Button";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Input } from "@/components/Input";
import { useState } from "react";
import DateTimePicker from 'react-native-ui-datepicker';
import dayjs from 'dayjs';
import React from "react";


export default function ProfileView() {
    const isPresented = router.canGoBack();
    
    const [isEditing, setIsEditing] = useState(false);
    const [username, setUserName] = useState("");
    const [name, setName] = useState("");
    const [birthday, setBirthday] = React.useState(dayjs());

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleSave = () => {
        //PUT /users/:user_id ?
        setIsEditing(false);
    };

    const handleDelete = () => {
        //DELETE /users/:user_id ?
        console.log("Account deleted");
    };

    return (
        <View>
            {isPresented && <Button onPress={() => {
                router.back();
            }}>
                Go Back
            </Button>}
            <Text className="text-primary">User Profile</Text>

            <Button className="text-primary" onPress={handleEditToggle}>
                {isEditing ? "Cancel" : "Edit Profile"}
            </Button>

            <Button className="text-primary" onPress={handleDelete}>
                Delete Account
            </Button>

            {isEditing ? (
                <>
                    <Text className="text-primary">Username:</Text>
                    <Input className="text-primary" value={username} onChangeText={setUserName} placeholder="Username" />

                    <Text className="text-primary">Name:</Text>
                    <Input className="text-primary" value={name} onChangeText={setName} placeholder="Name" />

                    <Text className="text-primary">Birthday:</Text>
                    <DateTimePicker
                        mode="single"
                        date={birthday}
                        onChange={({ date }) => setBirthday(birthday)}
                    />

                    <Button onPress={handleSave}>
                            Confirm
                    </Button>
                </>
            ) : (
                <>
                    <Text className="text-primary">Username: {username} </Text>
                    <Text className="text-primary">Name: {name} </Text>
                    <Text className="text-primary">Birthday: {birthday.format("MM-DD-YYYY")} </Text>
                </>
            )}

        </View>)
}