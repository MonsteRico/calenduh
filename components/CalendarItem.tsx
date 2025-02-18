import { Text, Pressable, TouchableOpacity, View } from "react-native";
import { cn } from "../lib/utils";
import { type VariantProps, cva } from "class-variance-authority";

interface CalendarItemProps extends React.ComponentPropsWithoutRef<typeof TouchableOpacity> {
	calendarName: string;
	calendarColor: string;
}

function CalendarItem({ calendarName: name, calendarColor: color }: CalendarItemProps) {
	return (
		<Pressable className="flex-row items-center gap-3 self-start rounded-md w-full bg-transparent active:bg-muted px-2 py-3">
			<View className="h-5 w-5 rounded-full" style={{ backgroundColor: color }} />
			<Text className="text-lg text-primary">{name}</Text>
		</Pressable>
	);
}

export { CalendarItem };
