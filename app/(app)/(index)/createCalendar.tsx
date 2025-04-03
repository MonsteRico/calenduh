import { router } from "expo-router";
import { Text, View, TextInput, Switch } from "react-native";
import { Button } from "@/components/Button";
import { useState } from "react";
import { calendarColors } from "@/components/CalendarColorModal";
import Dropdown from '@/components/Dropdown';
import { useCreateCalendar, useCreateGroupCalendar } from "@/hooks/calendar.hooks";
import { useSession } from "@/hooks/authContext";
import { Input } from "@/components/Input";
import { DismissKeyboardView } from "@/components/DismissKeyboardView";
import { Group } from "@/types/group.types";
import { useMyGroups } from "@/hooks/group.hooks";
import { useIsConnected } from "@/hooks/useIsConnected";

function getRandomItem<T>(list: T[]): T {
    return list[Math.floor(Math.random() * list.length)];
}

export default function CreateCalendar() {
    const isPresented = router.canGoBack();
    const [calendarName, setCalendarName] = useState("");
    const [calendarColorHex, setCalendarColor] = useState(getRandomItem(calendarColors).hex);
    const [isPublic, setIsPublic] = useState(false);
    const [isGroup, setIsGroup] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);


    const { data: groups, isLoading } = useMyGroups();
    const { mutate: normalCreate } = useCreateCalendar();
    const { mutate: groupCreate } = useCreateGroupCalendar();
    const { user } = useSession();
    const isConnected = useIsConnected();
    console.log(isConnected);

    if (!user) {
        return <Text className="text-primary">Loading...</Text>;
    }

    const onSubmit = () => {
        if (calendarName.trim() === "") {
            return;
        }
        if (selectedGroup !== null && selectedGroup.group_id !== null) {
            groupCreate({
                group_id: selectedGroup.group_id,
                title: calendarName,
                color: calendarColorHex,
                is_public: isPublic,
                user_id: user.user_id,
            })
        } else {
            normalCreate({
                group_id: null,
                title: calendarName,
                color: calendarColorHex,
                is_public: isPublic,
                user_id: user.user_id,
            })
        }
        router.back();
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
                <Text className="items-center pl-5 text-3xl font-bold text-primary">Create Calendar</Text>
            </View>

            <View className="mt-5 flex flex-col gap-2 px-8">
                <Input
                    label="Name:"
                    className="text-primary"
                    value={calendarName}
                    onChangeText={setCalendarName}
                    placeholder="Calendar Name"
                />

                <View className="flex-col gap-1">
                    <Text className="text-primary">Color:</Text>
                    <Dropdown<{ hex: string, name: string }>
                        options={calendarColors}
                        renderItem={(calendarColor) => (
                            <View className="flex flex-row items-center gap-2">
                                <View className="h-6 w-6 rounded-full" style={{ backgroundColor: calendarColor.hex }} />
                                <Text className="text-primary">{calendarColor.name}</Text>
                            </View>
                        )}
                        onSelect={(selectedCalendarColor) => {
                            setCalendarColor(selectedCalendarColor.hex);
                        }}
                    />
                </View>

                <View className="flex-row items-center mt-2">
                    <Text className="text-primary">Make Public:</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "#808080" }}
                        thumbColor={isPublic ? "#FFFFFF" : "#F4F4F4"}
                        onValueChange={() => setIsPublic(!isPublic)}
                        value={isPublic}
                        style={{ marginLeft: 10 }}
                    />
                </View>

                {user.user_id !== "localUser" &&
                    <View className='flex-row items-center mt-2'>
                        <Text className='text-primary'>Group Calendar:</Text>
                        <Switch
                            trackColor={{ false: '#767577', true: '#808080' }}
                            thumbColor={isGroup ? '#FFFFFF' : '#F4F4F4'}
                            onValueChange={() => {
                                setIsGroup(!isGroup);
                                if (!isGroup) {
                                    setSelectedGroup(null);
                                }
                            }}
                            value={isGroup}
                            style={{ marginLeft: 10 }}
                        />

                    </View>
                }


                {isGroup &&
                    <View className='mt-5 flex flex-col gap-2'>
                        <Text className='text-primary'>Group Name:</Text>
                        <Dropdown<Group>
                            options={groups || []}
                            renderItem={(group) => (
                                <Text className='text-primary'>{group.name}</Text>
                            )}
                            onSelect={(selectedGroup) => {
                                setSelectedGroup(selectedGroup);
                            }}
                        />
                    </View>
                }

                <View className="mt-6">
                    <Button
                        onPress={onSubmit}
                    >
                        Create Calendar
                    </Button>
                </View>
            </View>
        </DismissKeyboardView>
    );
}