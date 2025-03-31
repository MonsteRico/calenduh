import { router } from "expo-router";
import { Text, View, TextInput, Switch } from "react-native";
import { Button } from "@/components/Button";
import { useState } from "react";
//import { useCreateGroup } from "@/hooks/groups.hooks";
import { useSession } from "@/hooks/authContext";
import { Input } from "@/components/Input";
import { DismissKeyboardView } from "@/components/DismissKeyboardView";
import * as Clipboard from 'expo-clipboard';


export default function CreateGroup() {
    //TODO: Actually get group data and make group get saved when creating calendar
    const isPresented = router.canGoBack();
    const [groupName, setGroupName] = useState("");
    //const { mutate } = useCreateGroup();
    const { user } = useSession();

    if (!user) {
        return <Text className="text-primary">Loading...</Text>;
    }

    return (
        <DismissKeyboardView className="flex-1 bg-background">
            <View className="m-2 flex-row items-center">
                {isPresented && (
                    <Button
                        onPress={() => {
                            router.back();
                        }}
                        className="text-primary"
                    >
                        Cancel
                    </Button>
                )}
                <Text className="items-center pl-5 text-3xl font-bold text-primary">Create Group</Text>
            </View>

            <View className="mt-5 flex flex-col gap-2 px-8">
                <Input
                    label="Name:"
                    className="text-primary"
                    value={groupName}
                    onChangeText={setGroupName}
                    placeholder="Group Name"
                />

                <View className="mt-6">
                    <Button
                        onPress={() => {
                            //Make the groupID here??
                            const id = "";
                            // mutate({
                            //     group_id: id,
                            //     groupName: groupName,
                            // });
                            Clipboard.setStringAsync(id).then(() => {
                                alert(`Group ID: ${id} has been copied to your clipboard!`);
                            });
                            router.back();
                        }}
                    >
                        Create Group
                    </Button>
                </View>
            </View>
        </DismissKeyboardView>
    );
}