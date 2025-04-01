import { Button } from "@/components/Button";
import { router } from "expo-router";
import { Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Checkbox } from "@/components/Checkbox";
import { Accordion } from "@/components/Accordion";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCalendars } from "@/hooks/calendar.hooks";
import { useSQLiteContext } from "expo-sqlite";
import { getCalendarsFromDB } from "@/lib/calendar.helpers";
import { useIsConnected } from "@/hooks/useIsConnected";
import { useEnabledCalendarIds } from "@/hooks/useEnabledCalendarIds";
import { setEnabled } from "react-native/Libraries/Performance/Systrace";
import { DismissKeyboardView } from "@/components/DismissKeyboardView";
import { JoinGroupModal } from "@/components/JoinGroupModal";
import { CreateGroupModal } from '@/components/CreateGroupModal';
import { ViewGroupModal } from "@/components/ViewGroupModal";
import { Group } from '@/types/group.types';
import { EditGroupModal } from '@/components/EditGroupModal';
import { useMyGroups } from "@/hooks/group.hooks";
import { Feather } from '@expo/vector-icons';

export default function ManageGroups() {
    const isPresented = router.canGoBack();
    const queryClient = useQueryClient();
    const { data: groups, isLoading } = useMyGroups();
    const isConnected = useIsConnected();
    const db = useSQLiteContext();
    const [openCreateGroup, setOpenCreateGroup] = useState(false);
    const [openJoinGroup, setOpenJoinGroup] = useState(false);
    const [openViewGroup, setOpenViewGroup] = useState(false);
    const [openEditGroup, setOpenEditGroup] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group>({
        group_id: "",
        name: "",
		invite_code: "",
        calendar_ids: null,
    });
    const { setEnabledCalendarIds } = useEnabledCalendarIds();

    return (
        <DismissKeyboardView className="flex-1 bg-background">
            {/* Modals */}
            <JoinGroupModal
                visible={openJoinGroup}
                onClose={() => setOpenJoinGroup(false)}
                setGroupCode={(code) => {
                    //TODO: Handle group joining with code - also might want to move this logic into the modal
                    console.log(code);
                }}
            />
            <CreateGroupModal
                visible={openCreateGroup}
                onClose={() => setOpenCreateGroup(false)}
            />
            <ViewGroupModal
                visible={openViewGroup}
                onClose={() => setOpenViewGroup(false)}
                openEditGroup={() => setOpenEditGroup(true)}
                group={selectedGroup}  
            />
            <EditGroupModal
                visible={openEditGroup}
                onClose={() => {
                    setOpenEditGroup(false)
                    setOpenViewGroup(true)
                }}
                group={selectedGroup}
            />

            {/* Header */}
            <View className="px-4 pt-6 pb-4 bg-primary/5">
                <Text className="text-3xl font-bold text-primary mb-6">Groups</Text>
                <View className="flex-row justify-between">
                    <Button
                        className="flex-1 mr-2 bg-primary"
                        labelClasses="text-white font-medium"
                        onPress={() => {setOpenCreateGroup(true)}}
                    >
                        Create Group
                    </Button>
                    <Button
                        className="flex-1 ml-2 bg-primary"
                        labelClasses="text-white font-medium" 
                        onPress={() => {setOpenJoinGroup(true)}}
                    >
                        Join Group
                    </Button>
                </View>
            </View>

            {/* Groups List */}
            <ScrollView className="flex-1 px-4 pt-4">
                {isLoading ? (
                    <View className="items-center justify-center py-12">
                        <ActivityIndicator size="large" color="#6366f1" />
                        <Text className="text-center text-gray-500 mt-4">Loading your groups...</Text>
                    </View>
                ) : groups && groups.length > 0 ? (
                    <View className="space-y-3">
                        {groups.map((group) => (
                            <TouchableOpacity 
                                key={group.group_id}
                                onPress={() => {
                                    setSelectedGroup(group);
                                    setOpenViewGroup(true);
                                }}
                                className="bg-white rounded-xl p-4 flex-row justify-between items-center shadow-sm border border-gray-100"
                            >
                                <View className="flex-1">
                                    <Text className="text-lg font-semibold text-gray-800">{group.name}</Text>
                                    {/*<Text className="text-sm text-gray-500 mt-1">
                                        {group.calendar_ids ? `${group.calendar_ids.length} calendars` : 'No calendars'}
                                    </Text> */}
                                </View>
                                <Feather name="chevron-right" size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View className="items-center justify-center py-12">
                        <View className="bg-gray-100 rounded-full p-4 mb-4">
                            <Feather name="users" size={24} color="#6366f1" />
                        </View>
                        <Text className="text-lg font-semibold text-gray-800 text-center">No Groups Yet</Text>
                        <Text className="text-gray-500 text-center mt-2 mb-6">Create or join a group to get started with collaborative scheduling.</Text>
                        <View className="flex-row">
                            <Button
                                className="mr-2 bg-primary"
                                labelClasses="text-white font-medium"
                                onPress={() => {setOpenCreateGroup(true)}}
                            >
                                Create Group
                            </Button>
                            <Button
                                className="ml-2 bg-secondary"
                                labelClasses="text-white font-medium"
                                onPress={() => {setOpenJoinGroup(true)}}
                            >
                                Join Group
                            </Button>
                        </View>
                    </View>
                )}
            </ScrollView>
        </DismissKeyboardView>
    );
}