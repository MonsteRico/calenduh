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

	const flashListRef = useRef<FlashList<any>>(null);
	const { value: dayBeingViewed, setValue: setDayBeingViewed } = useCurrentViewedDay();

	const previousMonth = dayBeingViewed.minus({ month: 1 });
	const nextMonth = dayBeingViewed.plus({ month: 1 });

	const [monthData, setMonthData] = useStateWithCallbackLazy([
		{ month: previousMonth.month, year: previousMonth.year },
		{ month: dayBeingViewed.month, year: dayBeingViewed.year },
		{ month: nextMonth.month, year: nextMonth.year },
	]);

	const screenWidth = Dimensions.get("window").width;
	const monthHeight = Platform.OS === "web" ? Dimensions.get("window").height - 150 : screenWidth * 0.9;

	const [todayIndex, setTodayIndex] = useState(
		monthData.findIndex((monthData) => monthData.month == today.month && monthData.year == today.year)
	);

	const [_currentIndex, setCurrentIndex] = useState(todayIndex);

	useEffect(() => {
		setTodayIndex(monthData.findIndex((monthData) => monthData.month == today.month && monthData.year == today.year));
	}, [monthData]);

	function appendData() {
		setMonthData((prev) => {
			const newData = [...prev];
			const lastMonthWeHave = DateTime.fromObject({
				year: newData[newData.length - 1].year,
				month: newData[newData.length - 1].month,
			}) as DateTime<true>;
			const nextMonthWeNeed = lastMonthWeHave.plus({ month: 1 });
			newData.push({ month: nextMonthWeNeed.month, year: nextMonthWeNeed.year });
			return newData;
		});
	}

	function prependData() {
		setMonthData(
			(prev) => {
				const newData = [...prev];
				const firstMonthWeHave = DateTime.fromObject({
					year: newData[0].year,
					month: newData[0].month,
				}) as DateTime<true>;
				const previousMonthWeNeed = firstMonthWeHave.minus({ month: 1 });
				newData.unshift({ month: previousMonthWeNeed.month, year: previousMonthWeNeed.year });
				return newData;
			},
			() => {
				goToIndex(1, false);
			}
		);
	}

	function goToIndex(index: number, animated = true) {
		if (flashListRef.current) {
			flashListRef.current.scrollToIndex({ index, animated });
		}
	}

	const onViewableItemsChanged = ({ viewableItems, changed }: { viewableItems: any; changed: any[] }) => {
		if (changed.length < 2) {
			return;
		}
		const currentIndex = changed[0].index;
		setCurrentIndex(currentIndex);
		const previousIndex = changed[1].index;
		console.log("currentIndex", currentIndex);
		console.log("previousIndex", previousIndex);
		if (currentIndex > previousIndex) {
			setDayBeingViewed(dayBeingViewed.plus({ month: 1 }));
		}
		if (currentIndex < previousIndex) {
			setDayBeingViewed(dayBeingViewed.minus({ month: 1 }));
		}
	};

	function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>): void {
		// if distanceFromStart.x === 0 we reach the start of the list
		const distanceFromStart: NativeScrollPoint = event.nativeEvent.contentOffset;
		if (distanceFromStart.x === 0) prependData();
	}

	return (
		<View className="flex min-h-screen w-full flex-col items-center">
			<View
				style={{
					width: screenWidth,
					height: monthHeight + 75,
					flexDirection: "row",
				}}
			>
				{monthData && screenWidth > 0 && monthHeight > 0 && (
					<FlashList
						estimatedItemSize={screenWidth}
						ref={flashListRef}
						horizontal
						snapToInterval={screenWidth}
						snapToAlignment="start"
						decelerationRate={"fast"}
						data={monthData}
						renderItem={({ item, index }) => <Month month={item.month} year={item.year} key={index} />}
						keyExtractor={(item, index) => index.toString()}
						initialScrollIndex={todayIndex}
						// getItemLayout={(data, index) => ({
						// 	length: screenWidth,
						// 	offset: screenWidth * index,
						// 	index,
						// })}
						onEndReachedThreshold={0.5}
						onEndReached={appendData}
						onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>): void => {
							handleScroll(event);
						}}
						disableIntervalMomentum
						onViewableItemsChanged={onViewableItemsChanged}
						viewabilityConfig={{
							itemVisiblePercentThreshold: 50,
						}}
					/>
				)}
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
					<Text className="text-primary-foreground">Create Event</Text>
				</Button>
			</View>
		</View>
	);
}
