import {
	Dimensions,
	FlatList,
	NativeScrollEvent,
	NativeScrollPoint,
	NativeSyntheticEvent,
	Platform,
	Pressable,
	Text,
	View,
} from "react-native";
import { DateTime } from "luxon";
import { useSession } from "@/hooks/authContext";
import Month from "@/components/Month";
import { useSharedValue } from "react-native-reanimated";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { FlashList } from "@shopify/flash-list";
import { useCurrentViewedDay } from "@/hooks/useCurrentViewedDay";
import useStateWithCallbackLazy from "@/hooks/useStateWithCallbackLazy";
import Divider from "@/components/Divider";
import { router } from "expo-router";
import DrawerMenu from "@/components/DrawerMenu";
import CalendarsList from "./calendarsList";

export default function MonthScreen() {
	const today = DateTime.now();
	const { signOut } = useSession();

	const { dayBeingViewed, setDayBeingViewed } = useCurrentViewedDay();

	const screenWidth = Dimensions.get("window").width;
	const monthHeight = Platform.OS === "web" ? Dimensions.get("window").height - 150 : screenWidth * 0.9;

	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	const toggleDrawer = () => {
		setIsDrawerOpen(!isDrawerOpen);
	};

	return (
		<View className="flex min-h-screen w-full flex-col items-center p-1">
			<DrawerMenu title="Calendars" isOpen={isDrawerOpen} onClose={toggleDrawer}>
				<CalendarsList toggleDrawer={toggleDrawer} />
			</DrawerMenu>
			<View className="flex w-full flex-row justify-between">
				<Button
					onPress={() => {
						toggleDrawer();
					}}
				>
					Calendars
				</Button>
				<Button onPress={() => {}}>Force Sync</Button>
			</View>{" "}
			<View
				style={{
					width: screenWidth,
					height: monthHeight + 75,
					flexDirection: "row",
				}}
			>
				<Month month={dayBeingViewed.month} year={dayBeingViewed.year} />
			</View>
			<Divider className="my-4" />
			<View className="flex flex-row justify-center gap-4">
				<Button
					onPress={() => {
						signOut();
					}}
				>
					<Text className="text-primary-foreground">Sign Out</Text>
				</Button>
				<Button
					onPress={() => {
						router.navigate("/createEvent");
					}}
				>
					<Text className="text-primary-foreground">Create Event</Text>
				</Button>
			</View>
		</View>
	);
}
