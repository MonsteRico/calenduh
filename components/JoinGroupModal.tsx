import { Text, View, Modal, TouchableOpacity } from 'react-native';
import { Button } from '@/components/Button';
import { useState } from 'react';
import { useColorScheme } from 'nativewind';
import { Input } from '@/components/Input';
import { DismissKeyboardView } from './DismissKeyboardView';

interface JoinGroupModalProps {
    visible: boolean;
    onClose: () => void;
    setGroupCode: (code: string) => void;
}

function JoinGroupModal({ visible, onClose, setGroupCode }: JoinGroupModalProps) {
    const { colorScheme } = useColorScheme();
    const [code, setCode] = useState("");

    const onModalClose = () => {
        setCode("");
        onClose();
    }

    return (
        <Modal
            animationType='fade'
            transparent={true}
            visible={visible}
            onRequestClose={onModalClose}
        >
            <DismissKeyboardView className="flex-1">
                <View className='flex-1 items-center justify-center bg-black/50'>
                    <View className='w-[85vw] rounded-xl bg-background shadow-xl'>
                        <View className='flex-row items-center justify-between border-b border-gray-200 p-4'>
                            <Text className='text-xl font-bold text-foreground'>Join Group</Text>
                            <TouchableOpacity
                                onPress={onModalClose}
                                className='h-8 w-8 items-center justify-center rounded-full'
                            >
                                <Text className="text-xl text-gray-500">✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View className='p-6'>
                            <Input
                                label='Group Code'
                                className='mb-6'
                                value={code}
                                onChangeText={setCode}
                                placeholder='Enter Group Code'
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
                                    setGroupCode(code);
                                    onModalClose();
                                }}
                                disabled={!code.trim()}
                            >
                                Join
                            </Button>
                        </View>
                    </View>
                </View>
            </DismissKeyboardView>
        </Modal>
    );
}

export { JoinGroupModal };