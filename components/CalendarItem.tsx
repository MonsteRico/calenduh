import { Text, Pressable, TouchableOpacity, View } from "react-native";
import { cn } from "../lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import { useState } from 'react';
import { Checkbox } from "@/components/Checkbox";

interface CalendarItemProps extends React.ComponentPropsWithoutRef<typeof TouchableOpacity> {
	calendarName: string;
	calendarColor: string;
	onPress?: () => void;
	checked?: boolean; // parent checked doesn't propogate yet, TODO depending on how we store state information
	editMode?: boolean;
}



function CalendarItem({ calendarName: name, calendarColor: color, editMode=false, checked=false, onPress }: CalendarItemProps) {
	const [isChecked, setIsChecked] = useState(checked);
	return (
		<View>
			{editMode ? (
				<Pressable className="flex-row items-center gap-3 self-start rounded-md w-full bg-transparent active:bg-muted"
					onPress={onPress}>
					<View className="h-5 w-5 rounded-full" style={{ backgroundColor: color }} />
					<Text className="text-lg text-primary">{name}</Text>
				</Pressable>
			) : (
				<Checkbox checked={isChecked} onCheck={setIsChecked} label={name} color={color} checkSymbol={false} labelClasses="text-lg text-primary"/>
			)}
		</View>
	);
}

export { CalendarItem };
