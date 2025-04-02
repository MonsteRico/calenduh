import { Text, View, Modal, Switch } from 'react-native';
import { Button } from '@/components/Button';
import { useMemo, useState, useEffect } from 'react'
import RadioGroup, {RadioButtonProps} from 'react-native-radio-buttons-group'
import { NotificationTimes } from '@/constants/notificationTimes';

interface GlobalNotificationSettingsModalProps {
    visible: boolean;
    firstNotification: number | null;
    secondNotification: number | null;
    onClose: () => void;
    onSave: (firstNotif: number | null, secondNotif: number | null) => void;
}

function GlobalNotificationSettingsModal({ visible, firstNotification, secondNotification, onClose, onSave }: GlobalNotificationSettingsModalProps) {
    const [firstSelectedId, setFirstSelectedId] = useState<string | undefined>();
    const [secondSelectedId, setSecondSelectedId] = useState<string | undefined>();
    const [enableSecondNotification, setEnableSecondNotification] = useState(false);

    const notificationOptions: RadioButtonProps[] = useMemo(() => ([
        { id: '1', label: 'At time of event', value: NotificationTimes.TIME_OF_EVENT.toString() },
        // { id: '2', label: '5 minutes before', value: (5 * 60 * 1000).toString() }, add later when 5 min is supported
        { id: '3', label: '15 minutes before', value: NotificationTimes.FIFTEEN_MINUTES_MS.toString() },
        { id: '4', label: '30 minutes before', value: NotificationTimes.THIRTY_MINUTES_MS.toString() },
        { id: '5', label: '1 hour before', value: NotificationTimes.ONE_HOUR_MS.toString() },
        { id: '6', label: '1 day before', value: NotificationTimes.ONE_DAY_MS.toString() },
        { id: '7', label: 'None', value: 'null' }
    ]), []);

    useEffect(() => {
        const firstButton = notificationOptions.find(btn => btn.value === (firstNotification?.toString() ?? 'null'));
        if (firstButton) {
            setFirstSelectedId(firstButton.id);
        }

        if (secondNotification !== null) {
            setEnableSecondNotification(true);
            const secondButton = notificationOptions.find(btn => btn.value === secondNotification.toString());
            if (secondButton) {
                setSecondSelectedId(secondButton.id);
            }
        }
    }, [firstNotification, secondNotification, notificationOptions]);

    const handleSave = () => {
        const firstNotifValue = firstSelectedId ? notificationOptions.find(btn => btn.id === firstSelectedId)?.value : null;
        
        let secondNotifValue = null;
        
        if (enableSecondNotification && secondSelectedId) {
            secondNotifValue = notificationOptions.find(btn => btn.id === secondSelectedId)?.value;
        }

        onSave(
            firstNotifValue === 'null' ? null : Number(firstNotifValue),
            enableSecondNotification ? (secondNotifValue === 'null' ? null : Number(secondNotifValue)) : null
        );
        onClose();
    };

    return (
        <Modal
            animationType='fade'
            transparent={true}
            visible={visible}
            onRequestClose={onClose}>
            <View className='flex-1 items-center justify-center bg-black/50'>
                <View className='bg-background rounded-md w-80 p-6 shadow-lg'>
                    <View className='flex-row justify-between items-center mb-4'>
                        <Text className="text-2xl text-secondary-foreground">Notification Settings</Text>
                        <Button onPress={onClose} className='bg-transparent'>
                            <Text className="text-secondary-foreground text-2xl">X</Text>
                        </Button>
                    </View>

                    <Text className="text-lg font-medium mb-2 text-white">First Notification</Text>
                    <RadioGroup
                        radioButtons={notificationOptions.map(button => ({
                            ...button,
                            labelStyle: { color: 'white' }
                        }))}
                        onPress={setFirstSelectedId}
                        selectedId={firstSelectedId}
                        containerStyle={{
                            alignItems: 'flex-start',
                            gap: 8,
                            marginBottom: 20
                        }}
                    />

                    <View className="flex-row items-center mb-2">
                        <Text className="text-lg font-medium mr-2 text-white">Enable Second Notification</Text>
                        <Switch 
                            value={enableSecondNotification}
                            onValueChange={setEnableSecondNotification}
                        />
                    </View>

                    {enableSecondNotification && (
                        <>
                            <Text className="text-lg font-medium mb-2 text-white">Second Notification</Text>
                            <RadioGroup
                                radioButtons={notificationOptions.map(button => ({
                                    ...button,
                                    labelStyle: { color: 'white' }
                                }))}
                                onPress={setSecondSelectedId}
                                selectedId={secondSelectedId}
                                containerStyle={{
                                    alignItems: 'flex-start',
                                    gap: 8,
                                    marginBottom: 20
                                }}
                            />
                        </>
                    )}

                    <Button onPress={handleSave} className="mt-4">
                        Save Settings
                    </Button>
                </View>
            </View>
        </Modal>
    )
}

export { GlobalNotificationSettingsModal }