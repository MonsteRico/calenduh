import { Text, View, Modal, TouchableOpacity, Alert } from "react-native";
import { Button } from "@/components/Button";
import { useState, useEffect, useMemo } from "react";
import { useColorScheme } from "nativewind";
import { Input } from "@/components/Input";
import { DismissKeyboardView } from "./DismissKeyboardView";
import { useCreateSubscription, useUnsubscribeCalendar } from "@/hooks/calendar.hooks";
import { Calendar } from "@/types/calendar.types";
import { calendarColors } from "./CalendarColorModal";

interface ToggleByTouchProps {
	visible: boolean;
	onClose: () => void;
	cal: Calendar;
	sub_cals: Calendar[];
}

function ToggleByTouch({ visible, onClose, cal, sub_cals }: ToggleByTouchProps) {
	const [code, setCode] = useState("");
	const { mutate: sub } = useCreateSubscription();

	const onModalClose = () => {
		setCode("");
		onClose();
	};

	const { mutate: unsubscribe, isPending: isUnsubscribing } = useUnsubscribeCalendar({
		onSuccess: () => {
			onModalClose;
		},
	});

	const onSubscribe = () => {
        if (!cal || !cal.invite_code) {
            return;
        }
		sub(
			{ invite_code: cal.invite_code },
			{
				onSuccess: () => {
					onModalClose();
				},
				onError: () => {
					Alert.alert("Join Failed", "Failed to subscribe to calendar.", [{ text: "OK" }]);
				},
			}
		);
	};

	const onUnsubscribe = () => {
		if (cal) {
			unsubscribe(cal.calendar_id);
		}
	};

	return (
		<Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onModalClose}>
			<DismissKeyboardView className="flex-1">
				<View className="flex-1 items-center justify-center bg-black/50">
					<View className="w-[85vw] rounded-xl bg-background shadow-xl">
						<View className="flex-row items-center justify-between border-b border-gray-200 p-4">
							<Text className="text-xl font-bold text-foreground">View Public Calendar</Text>
							<TouchableOpacity onPress={onModalClose} className="h-8 w-8 items-center justify-center rounded-full">
								<Text className="text-xl text-foreground">✕</Text>
							</TouchableOpacity>
						</View>

						<View className="px-6 py-6">
							<View className="mb-6">
								<Text className="mb-1 text-sm text-muted-foreground">Calendar Name</Text>
								<Text className="text-xl font-semibold text-primary">{cal.title}</Text>
							</View>

							<View className="mb-6">
								<Text className="mb-2 text-sm text-muted-foreground">Color</Text>
								<View className="flex-row items-center">
									<View
										className="mr-3 h-6 w-6 rounded-full border border-border"
										style={{ backgroundColor: cal.color }}
									/>
									<Text className="text-primary">
										{calendarColors.find((color) => color.hex === cal.color)?.name || "Custom"}
									</Text>
								</View>
							</View>

							<View className="mb-8">
								<Text className="mb-2 text-sm text-muted-foreground">Share Code</Text>
								<View className="rounded bg-muted p-3">
									<Text className="font-mono text-primary">{cal.invite_code}</Text>
								</View>
							</View>

							{sub_cals.some((sub) => sub.calendar_id === cal.calendar_id) ? (
								<Button
									onPress={() => onUnsubscribe()}
									labelClasses="text-destructive-foreground font-medium"
									variant="destructive"
									className="w-full"
								>
									Unsubscribe
								</Button>
							) : (
								<Button onPress={() => onSubscribe()} labelClasses="text-foreground font-medium" className="w-full">
									Subscribe
								</Button>
							)}
						</View>
					</View>
				</View>
			</DismissKeyboardView>
		</Modal>
	);
}

export { ToggleByTouch };
