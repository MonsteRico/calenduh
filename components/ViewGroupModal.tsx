import { Text, View, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Button } from '@/components/Button';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'nativewind';
import Feather from '@expo/vector-icons/Feather';
import { Group } from '@/types/group.types';
import { EditGroupModal } from '@/components/EditGroupModal'
import { useGroupCalendars } from '@/hooks/calendar.hooks';
import { useLeaveGroup } from '@/hooks/group.hooks';

interface ViewGroupModalProps {
    visible: boolean;
    onClose: () => void;
    openEditGroup: () => void;
    group: Group;
}

function ViewGroupModal({ visible, onClose, group, openEditGroup }: ViewGroupModalProps) {
    const { colorScheme } = useColorScheme();
    const [groupName, setGroupName] = useState(group.name)
    const [groupShareCode, setGroupShareCode] = useState(group.invite_code)
    const [editModalOpen, setEditModalOpen] = useState(false);
    const { data: group_calendars, isLoading} = useGroupCalendars(group.group_id);
    const { mutate } = useLeaveGroup();


    //TODO: when group name is edited - does not immediately propagate to this view - don't know how to fix

    const onModalClose = () => {
        onClose();
    }

    const openEditModal = () => {
        onClose();
        openEditGroup();
    }

    const leaveGroup = () => {
        mutate(group);
        onClose();
    }

    useEffect(() => {
        setGroupName(group.name);
        setGroupShareCode(group.invite_code);
    }, [group]);

    return (
        <>
            <EditGroupModal
                visible={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                group={group}
            />
            <Modal
                animationType='fade'
                transparent={true}
                visible={visible}
                onRequestClose={onModalClose}
            >
                <View className='flex-1 items-center justify-center bg-black/50'>
                    <View className='w-[85vw] rounded-xl bg-background shadow-xl'>
                        <View className='flex-row items-center justify-between border-b border-gray-200 p-4'>
                            <TouchableOpacity
                                onPress={onModalClose}
                                className='h-8 w-8 items-center justify-center rounded-full'
                            >
                                <Text className='text-xl text-foreground'>✕</Text>
                            </TouchableOpacity>
                            <Text className='flex-1 text-center text-xl font-bold text-foreground'>{group.name}</Text>
                            <TouchableOpacity
                                onPress={openEditModal}
                                className='h-8 w-8 items-center justify-center rounded-full'
                            >
                                <Feather
                                    name='edit-2'
                                    size={24}
                                    color={colorScheme === 'dark' ? 'white' : 'black'}
                                />
                            </TouchableOpacity>
                        </View>

                        <View className='p-6 space-y-6'>
                            <View className='bg-muted/30 rounded-lg p-4'>
                                <Text className='text-sm text-foreground/60 mb-1'>Group Share Code</Text>
                                <Text className='text-xl font-semibold text-foreground'>{group.invite_code}</Text>
                            </View>

                            <View className='space-y-2'>
                                <Text className='text-lg font-semibold text-foreground mb-2'>Group Calendars</Text>
                                <ScrollView
                                    className='max-h-40'
                                    showsVerticalScrollIndicator={true}
                                    contentContainerClassName='pb-2'
                                >
                                    {group_calendars?.map((calendar) => (
                                        <View key={calendar.calendar_id} className='flex-row items-center py-3 border-b border-gray-200/30'>
                                            <View className='w-6 h-6 rounded-full mr-4' style={{ backgroundColor: calendar.color }} />
                                            <Text className='text-base text-foreground'>{calendar.title}</Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>

                        <View className='p-6 pt-2'>
                            <Button
                                className='bg-destructive w-full'
                                onPress={leaveGroup}
                            >
                                <View className='py-2 px-4'>
                                    <Text className='text-white font-medium text-center'>Leave Group</Text>
                                </View>
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    )
}

export { ViewGroupModal };