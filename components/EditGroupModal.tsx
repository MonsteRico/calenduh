import { Text, View, Modal, TouchableOpacity } from 'react-native';
import { Button } from '@/components/Button';
import { useState, useEffect } from 'react';
import { useColorScheme } from 'nativewind';
import { Input } from '@/components/Input';
import { DismissKeyboardView } from './DismissKeyboardView';
import { Group } from '@/types/group.types';
import { useUpdateGroup } from '@/hooks/group.hooks';

interface EditGroupModalProps {
    visible: boolean;
    onClose: () => void;
    group: Group;
}

function EditGroupModal({ visible, onClose, group }: EditGroupModalProps) {
    const [newName, setNewName] = useState(group.name);
    const { mutate } = useUpdateGroup();

    useEffect(() => {
        setNewName(group.name);
    }, [group]);

    const onModalClose = () => {
        setNewName(group.name);
        onClose();
    }

    const onSubmit = () => {
        if (newName.trim() === "") {
            return;
        }
        mutate({
            group_id: group.group_id,
            name: newName,
        });
        onModalClose();
    }
    return (
        < Modal
            animationType='fade'
            transparent={true}
            visible={visible}
            onRequestClose={onModalClose}
        >
            <DismissKeyboardView className="flex-1">
                <View className='flex-1 items-center justify-center bg-black/50'>
                    <View className='w-[85vw] rounded-xl bg-background shadow-xl'>
                        <View className='flex-row items-center justify-between border-b border-gray-200 p-4'>
                            <Text className='text-xl font-bold text-foreground'>Edit Group</Text>
                            <TouchableOpacity
                                onPress={onModalClose}
                                className='h-8 w-8 items-center justify-center rounded-full'
                            >
                                <Text className="text-xl text-foreground">✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View className='p-6'>
                            <Input
                                label='Group Name'
                                className='mb-6'
                                value={newName}
                                onChangeText={setNewName}
                                placeholder='Enter Group Name'
                            />

                        </View>

                        <View className='flex-row items-center justify-end border-t border-gray-200 p-4'>
                            <Button
                                variant='secondary'
                                onPress={onModalClose}
                                className='mr-3'
                            >
                                Cancel
                            </Button>
                            <Button
                                onPress={() => {
                                    onSubmit();
                                }}
                                disabled={!newName.trim()}
                            >
                                Save
                            </Button>
                        </View>
                    </View>
                </View>
            </DismissKeyboardView>
        </Modal >
    );
}

export { EditGroupModal };
