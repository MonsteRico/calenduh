import { Text, View, Modal, TextInput } from 'react-native';
import { useState } from 'react';
import { Button } from '@/components/Button';

interface CalendarNameModalProps {
    visible: boolean;
    name: string;
    onClose: () => void;
    onNameChange: (name: string) => void;
}

function CalendarNameModal({ visible, name, onClose, onNameChange }: CalendarNameModalProps) {
    const [tempName, setTempName] = useState(name);

    const handleNameChange = () => {
        onNameChange(tempName);
    }

    return (
        <Modal
            animationType='fade'
            transparent={true}
            visible={visible}
            onRequestClose={onClose}>
                <View className='flex-1 items-center mt-[5%]'>
                    <View className='bg-background rounded-md w-80 h-[120] shadow-lg'>
                        <View className="flex-row justify-between items-center ml-5 mr-2">
                            <Text className='text-2xl text-secondary-foreground'>Calendar Name</Text>
                            <Button onPress={onClose} className='bg-transparent'>
                                <Text className="text-secondary-foreground text-2xl">X</Text>
                            </Button>
                        </View>

                        <View className="items-center justify-center flex-1">
                            <TextInput value={tempName} onChangeText={setTempName} onBlur={handleNameChange} className='text-2xl text-secondary-foreground border w-60 border-gray-400 p-1'/>
                        </View>
                    </View>
                </View>
            </Modal>

    )
}

export { CalendarNameModal };