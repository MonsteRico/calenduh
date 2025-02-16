import { Text, View, Modal } from 'react-native';
import { Button } from '@/components/Button';
import { useMemo, useState, useEffect } from 'react'
import RadioGroup, {RadioButtonProps} from 'react-native-radio-buttons-group'

interface CalendarDefaultNotificationModalProps {
    visible: boolean;
    notification: string;
    onClose: () => void;
    onNotificationChange: (notification: string) => void;
}

function CalendarDefaultNotificationModal({ visible, notification, onClose, onNotificationChange}: CalendarDefaultNotificationModalProps) {
    const [selectedId, setSelectedId] = useState<string | undefined>();

    
    const radioButtons: RadioButtonProps[] = useMemo(() => ([
        { id: '1', label: 'None', value: 'none' },
        { id: '2', label: '5 minutes before', value: '5 minutes before' },
        { id: '3', label: '15 minutes before', value: '15 minutes before' },
        { id: '4', label: '30 minutes before', value: '30 minutes before' },
        { id: '5', label: '1 hour before', value: '1 hour before' },
        { id: '6', label: '1 day before', value: '1 day before'}
    ]), []);

    useEffect(() => {
        const button = radioButtons.find(btn => btn.value === notification);
        if (button) {
            setSelectedId(button.id);
        }
    }, [notification, radioButtons]);

    const handleSelection = () => {
        if (selectedId) {
            const selectedButton = radioButtons.find(btn => btn.id === selectedId);
            if (selectedButton?.value) {
                onNotificationChange(selectedButton.value);
            }
        }
        onClose();
    };

    return (
        <Modal
            animationType='fade'
            transparent={true}
            visible={visible}
            onRequestClose={onClose}>
            <View className='flex-1 items-center mt-[15%]'>
                <View className='bg-background rounded-md w-80 h-[400] shadow-lg'>
                    <View className='flex-row justify-between items-center ml-5 mr-2 p-2'>
                        <Text className="text-2xl text-secondary-foreground">Default Notification</Text>
                        <Button onPress={handleSelection} className='bg-transparent'>
                            <Text className="text-secondary-foreground text-2xl">X</Text>
                        </Button>
                    </View>


                    <View className='px-5 w-full'>
                        <RadioGroup
                            radioButtons={radioButtons}
                            onPress={setSelectedId}
                            selectedId={selectedId}
                            containerStyle={{
                                alignItems: 'flex-start',
                                gap: 12
                            }}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export { CalendarDefaultNotificationModal }
