// DrawerMenu.tsx
import { useColorScheme } from "nativewind";
import React, { ReactNode } from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface DrawerMenuProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
}

const DrawerMenu: React.FC<DrawerMenuProps> = ({ isOpen, onClose, title, children }) => {
    const { colorScheme } = useColorScheme();
	return (
		<View
			className={`absolute left-0 top-0 h-full w-80 text-primary border-r border-gray-300 bg-background z-40 p-4 transition-transform ${
				isOpen ? "translate-x-0" : "-translate-x-80"
			}`}
		>
			<View className="mb-4 flex-row items-center justify-between">
				<Text className="text-xl font-bold text-primary">{title}</Text>
				<TouchableOpacity onPress={onClose} className="p-4 bg-white rounded-md">
					<Text className="text-blue-500">X</Text>
				</TouchableOpacity>
			</View>
			<View className="flex flex-col items-center ">{children}</View>
		</View>
	);
};

export default DrawerMenu;
