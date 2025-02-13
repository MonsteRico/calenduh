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
import { useSession } from "@/hooks/context";
import Month from "@/components/Month";
import Carousel from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { FlashList } from "@shopify/flash-list";
import { useCurrentViewedDay } from "@/hooks/useCurrentViewedDay";
import useStateWithCallbackLazy from "@/hooks/useStateWithCallbackLazy";
import Divider from "@/components/Divider";
import { router } from "expo-router";

export default function MonthScreen() {
	const today = DateTime.now();
	const { signOut } = useSession();

	const { value: dayBeingViewed, setValue: setDayBeingViewed } = useCurrentViewedDay();

	const screenWidth = Dimensions.get("window").width;
	const monthHeight = Platform.OS === "web" ? Dimensions.get("window").height - 150 : screenWidth * 0.9;

	return (
		<View className="flex min-h-screen w-full flex-col items-center">
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
				<Button
					onPress={() => {
						router.navigate("/calendarsList");
					}}
				>
					<Text className="text-primary-foreground">Calendar List</Text>
				</Button>
			</View>
		</View>
	);
}
