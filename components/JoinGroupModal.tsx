import { Text, View, Modal, TouchableOpacity, Alert } from 'react-native';
import { Button } from '@/components/Button';
import { useState } from 'react';
import { useColorScheme } from 'nativewind';
import { Input } from '@/components/Input';
import { DismissKeyboardView } from './DismissKeyboardView';
import { useJoinGroup } from '@/hooks/group.hooks';

interface JoinGroupModalProps {
    visible: boolean;
    onClose: () => void;
}

function JoinGroupModal({ visible, onClose }: JoinGroupModalProps) {
    const { colorScheme } = useColorScheme();
    const [code, setCode] = useState("");
    const { mutate } = useJoinGroup();

    const onModalClose = () => {
        setCode("");
        onClose();
    };

    const onSubmit = () => {
        if (!code || code.trim() === "") {
            return;
        }

        mutate(
            { invite_code: code },
            {
                onSuccess: () => {
                    onModalClose();
                },
                onError: () => {
                    Alert.alert(
                        "Join Failed",
                        "Failed to join group. Please check the code and try again.",
                        [{ text: "OK" }]
                    );
                },
            }
        );
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onModalClose}
        >
            <DismissKeyboardView className="flex-1">
                <View className="flex-1 items-center justify-center bg-black/50">
                    <View className="w-[85vw] rounded-xl bg-background shadow-xl">
                        <View className="flex-row items-center justify-between border-b border-gray-200 p-4">
                            <Text className="text-xl font-bold text-foreground">Join Group</Text>
                            <TouchableOpacity
                                onPress={onModalClose}
                                className="h-8 w-8 items-center justify-center rounded-full"
                            >
                                <Text className="text-xl text-foreground">✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="p-6">
                            <Input
                                label="Group Code"
                                className="mb-6"
                                value={code}
                                onChangeText={setCode}
                                placeholder="Enter Group Code"
                            />
                        </View>

                        <View className="flex-row items-center justify-end border-t border-gray-200 p-4">
                            <Button
                                variant="secondary"
                                onPress={onModalClose}
                                className="mr-3"
                            >
                                Cancel
                            </Button>
                            <Button onPress={onSubmit} disabled={!code.trim()}>
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
