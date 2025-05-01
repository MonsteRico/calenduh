// DrawerMenu.tsx
import { cn } from "@/lib/utils";
import { useColorScheme } from "nativewind";
import React, { ReactNode } from "react";
import { View, Text, TouchableOpacity, Pressable } from "react-native";

interface DrawerMenuProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
}

const DrawerMenu: React.FC<DrawerMenuProps> = ({ isOpen, onClose, title, children }) => {
	return (
		<View className="absolute left-0 top-0 flex h-full w-full flex-row">
			<View
				onTouchMove={() => {
					if (!isOpen) return
					onClose();
				}}
				className={`z-40 h-full w-[60%] border-r border-gray-300 bg-background p-4 text-primary transition-transform ${
					isOpen ? "translate-x-0" : "-translate-x-[100%]"
				}`}
			>
				<View className="mb-4 flex-row items-center justify-between">
					<Text className="text-xl font-bold text-primary">{title}</Text>
					<TouchableOpacity onPress={onClose} className="rounded-md bg-white p-4">
						<Text className="text-blue-500">X</Text>
					</TouchableOpacity>
				</View>
				<View className="flex flex-col items-center">{children}</View>
			</View>

			<View 
			onTouchMove={() => {
				if (!isOpen) return;
				onClose();
			}}
			 className={cn("z-40 h-full w-[40%]", isOpen ? "" : "-translate-x-[300%]")}>
				<Pressable
				className="w-full h-full"
					onPress={(e) => {
						e.preventDefault();
						e.stopPropagation();
						onClose();
					}}
				></Pressable>
			</View>
		</View>
	);
};

export default DrawerMenu;
