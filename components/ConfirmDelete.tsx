import React, { useState } from 'react';
import { Text, View, Modal, TouchableOpacity } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Button } from '@/components/Button';
import { cn } from '@/lib/utils';

interface ConfirmDeleteProp
    extends React.ComponentPropsWithoutRef<typeof TouchableOpacity> {
    onDelete: () => void;
    size?: number;
    color?: string;
    buttonClass?: string;
    modalClass?: string;
    title?: string;
}

function ConfirmDelete({
    onDelete,
    size = 24,
    color = 'red',
    buttonClass,
    modalClass,
    title = "Are you sure you want to delete this?",
    ...props
}: ConfirmDeleteProp) {
    const [modalVisible, setModalVisible] = useState(false);
    const [deletedVisible, setDeletedVisible] = useState(false);

    return (
        <View>
            <TouchableOpacity
                className={cn(buttonClass)}
                onPress={() => setModalVisible(true)}
                {...props}
            >
                <Feather name='trash' size={size} color={color} />
            </TouchableOpacity>

            <Modal
                animationType='fade'
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                    className="flex-1 justify-center items-center bg-black/50"
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                        className={cn(
                            "bg-background rounded-lg p-6 m-4 w-5/6 shadow-lg",
                            modalClass
                        )}
                    >
                        <View className="flex-col gap-6">
                            <Text className="text-foreground font-medium text-xl text-center">
                                {title}
                            </Text>

                            <View className="flex-row justify-center gap-4">
                                <Button
                                    variant="secondary"
                                    onPress={() => setModalVisible(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onPress={() => {
                                        onDelete();
                                        setModalVisible(false);
                                        setDeletedVisible(true);
                                    }}
                                    className="flex-1"
                                >
                                    Delete
                                </Button>
                            </View>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
            
            <Modal
                animationType='fade'
                transparent={true}
                visible={deletedVisible}
                onRequestClose={() => setDeletedVisible(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setDeletedVisible(false)}
                    className="flex-1 justify-center items-center bg-black/50"
                >
                    <View className="bg-background rounded-lg p-4 m-4 w-5/6 shadow-lg">
                        <Text className="text-green-500 font-bold text-lg text-center">
                            Account deleted. Goodbye 😢
                        </Text>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

export { ConfirmDelete };