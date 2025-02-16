import { Text, View, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Button } from '@/components/Button';

interface CalendarColorModalProps {
    visible: boolean;
    color: string;
    onClose: () => void;
    onColorChange: (color: string) => void;
}

const calendarColors = [
    { name: "Ruby Red", hex: "#E63946" },
    { name: "Coral", hex: "#FF6B6B" },
    { name: "Peach", hex: "#FFA07A" },
    { name: "Tangerine", hex: "#FF9F1C" },
    { name: "Marigold", hex: "#FFBF3F" },
    { name: "Sunflower", hex: "#FFD93D" },
    { name: "Sage", hex: "#8DB580" },
    { name: "Mint", hex: "#95D5B2" },
    { name: "Forest", hex: "#2D6A4F" },
    { name: "Turquoise", hex: "#40B3A2" },
    { name: "Sky Blue", hex: "#90CAF9" },
    { name: "Ocean", hex: "#4B89AC" },
    { name: "Cobalt", hex: "#2B4F81" },
    { name: "Lavender", hex: "#9D8FD0" },
    { name: "Plum", hex: "#9B4F96" },
    { name: "Magenta", hex: "#C74B76" },
    { name: "Rose", hex: "#E091A9" }
]

function CalendarColorModal({ visible, color, onClose, onColorChange }: CalendarColorModalProps) {
    const handleColorChange = (color: string) => {
        onColorChange(color);
        onClose();

    }

    return (
        <Modal
            animationType='fade'
            transparent={true}
            visible={visible}
            onRequestClose={onClose}>
            <View className='flex-1 items-center mt-[10%]'>
                <View className='bg-background rounded-md w-80 h-[400] shadow-lg'>
                    <View className='flex-row justify-between items-center ml-5 mr-2 p-2'>
                        <Text className='text-2xl text-secondary-foreground'>Calendar Color</Text>
                        <Button onPress={onClose} className='bg-transparent'>
                            <Text className="text-secondary-foreground text-2xl">X</Text>
                        </Button>
                    </View>
                    <View className="flex-1">
                        <ScrollView
                            className="px-4 py-2"
                            contentContainerStyle={{ gap: 8 }}
                        >
                            {calendarColors.map((color) => (
                                <TouchableOpacity key={color.name} onPress={() => handleColorChange(color.hex)}>
                                    <View key={color.name} className="flex-row items-center justify-between">
                                        <Text className="text-2xl text-secondary-foreground">{color.name}</Text>
                                        <View className="w-10 h-10 rounded-full ml-2" style={{ backgroundColor: color.hex }} />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </View>
        </Modal>
    )
}
export { CalendarColorModal }