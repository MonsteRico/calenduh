import { Text, View, Modal } from 'react-native';
import { Button } from '@/components/Button';

interface CalendarDefaultNotificationModalProps {
    visible: boolean;
    notification: string;
    onClose: () => void;
    onNotificationChange: (notification: string) => void;
}

function CalendarDefaultNotificationModal({ visible, notification, onClose, onNotificationChange }: CalendarDefaultNotificationModalProps) {

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
                        <Button onPress={onClose} className='bg-transparent'>
                            <Text className="text-secondary-foreground text-2xl">X</Text>
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    )
}