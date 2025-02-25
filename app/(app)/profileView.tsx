import { Button } from "@/components/Button";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Input } from "@/components/Input";
import { useState } from "react";


export default function ProfileView({ user }) {
    const isPresented = router.canGoBack();
    
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState(user);

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
                    <Input className="text-primary" value={userData.Username} onChange={(e) => setUserData({ ...userData, username: e.target.value })} placeholder="Username" />

                    <Text className="text-primary">Name:</Text>
                    <Input className="text-primary" value={userData.name} onChange={(e) => setUserData({ ...userData, name: e.target.value })} placeholder="Name" />

                    <Text className="text-primary">Birthday:</Text>
                    <DateTimePicker
                        mode="single"
                        date={userData.birthday}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    />

                    <Button onPress={handleSave}>
                            Confirm
                    </Button>
                </>
            ) : (
                <>
                    <Text className="text-primary">Username: {userData.Username} </Text>
                    <Text className="text-primary">Name: {userData.name} </Text>
                    <Text className="text-primary">Birthday: {userData.Birthday} </Text>
                </>
            )}

        </View>)
}