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
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { FlashList } from "@shopify/flash-list";
import { useCurrentViewedDay } from "@/hooks/useCurrentViewedDay";
import useStateWithCallbackLazy from "@/hooks/useStateWithCallbackLazy";
import Divider from "@/components/Divider";
import { router } from "expo-router";
import server from "@/constants/serverAxiosClient";
import DrawerMenu from "@/components/DrawerMenu";
import CalendarsList from "./calendarsList";
import { useEnabledCalendarIds } from "@/hooks/useEnabledCalendarIds";
import { useCalendars, useMyCalendars } from "@/hooks/calendar.hooks";
import { useDbVersion } from "@/hooks/useDbVersion";

export default function MonthScreen() {
	const { data: calendars, isLoading } = useCalendars();

	const dbVersion = useDbVersion();

	const today = DateTime.now();
	const { signOut } = useSession();

	const flashListRef = useRef<FlashList<any>>(null);
	const { dayBeingViewed, setDayBeingViewed } = useCurrentViewedDay();

	const { enabledCalendarIds } = useEnabledCalendarIds();

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

	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	const toggleDrawer = () => {
		setIsDrawerOpen(!isDrawerOpen);
	};

	if (isLoading) return <Text>Loading...</Text>;

	console.log("calendars", calendars);

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
			</View>
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
						router.navigate("/profileView");
					}}
				>
					Profile
				</Button>
				<Button
					onPress={() => {
						signOut();
					}}
				>
					Sign Out
				</Button>
				<Button
					onPress={() => {
						router.navigate("/createEvent");
					}}
				>
					Create Event
				</Button>
				<Button
					onPress={() => {
						router.navigate("/testButtons");
					}}
				>
					Test Buttons
				</Button>
			</View>
			<View className="flex flex-row justify-center gap-4">
				<Text className="text-primary">Enabled Calendars: {enabledCalendarIds.length}</Text>
				{enabledCalendarIds.map((calendarId) => (
					<Text className="text-primary" key={calendarId}>
						{calendarId}
					</Text>
				))}
				<Text className="text-primary">Db Version: {dbVersion}</Text>
			</View>
		</View>
	);
}
