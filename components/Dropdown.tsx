import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Modal,
	ScrollView,
	TouchableWithoutFeedback,
	Platform,
	StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { cn } from "@/lib/utils"; // Assuming you have a utils file with cn

interface DropdownProps<T> {
	options: T[];
	renderItem: (item: T) => React.ReactNode;
	onSelect: (item: T) => void;
	label?: string;
	defaultValue?: T;
}

function Dropdown<T>({ options, renderItem, onSelect, label, defaultValue }: DropdownProps<T>) {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedItem, setSelectedItem] = useState<T | undefined>(defaultValue);

	const toggleModal = useCallback(() => {
		setIsModalVisible(!isModalVisible);
	}, [isModalVisible]);

	const handleSelectItem = useCallback(
		(item: T) => {
			setSelectedItem(item);
			onSelect(item);
			toggleModal();
		},
		[onSelect, toggleModal]
	);

	useEffect(() => {
        setSelectedItem(defaultValue);
    }, [defaultValue]);

	const selectedItemContent = useMemo(() => {
		if (selectedItem) {
			return renderItem(selectedItem);
		}
		return null;
	}, [selectedItem, renderItem]);

	return (
		<View>
			{label && <Text className="text-sm text-gray-500">{label}</Text>}
			<TouchableOpacity
				className={cn("flex-row items-center justify-between rounded-md border border-input bg-muted px-4 py-2")}
				onPress={toggleModal}
			>
				{selectedItemContent ? selectedItemContent : <Text className="text-muted-foreground">Select an option</Text>}
				<MaterialIcons name="arrow-drop-down" size={24} color="#64748b" />
			</TouchableOpacity>

			<Modal visible={isModalVisible} animationType="fade" transparent={true}>
				<TouchableWithoutFeedback onPress={toggleModal}>
					<View className="flex-1 items-center justify-center bg-black/50">
						<TouchableWithoutFeedback>
							<View className="max-h-96 w-4/5 rounded-md bg-muted">
								<ScrollView>
									{options.map((item, index) => (
										<TouchableOpacity
											key={index}
											className={cn("border-b border-input px-4 py-3", index === options.length - 1 && "border-b-0")}
											onPress={() => handleSelectItem(item)}
										>
											{renderItem(item)}
										</TouchableOpacity>
									))}
								</ScrollView>
								<TouchableOpacity className="items-center rounded-b-md bg-secondary px-4 py-3" onPress={toggleModal}>
									<Text className="text-secondary-foreground">Close</Text>
								</TouchableOpacity>
							</View>
						</TouchableWithoutFeedback>
					</View>
				</TouchableWithoutFeedback>
			</Modal>
		</View>
	);
}

export default Dropdown;
