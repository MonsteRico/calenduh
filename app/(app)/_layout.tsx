import { Text, View } from "react-native";
import { Redirect, Slot, Stack, Tabs } from "expo-router";
import { useSession } from "@/hooks/authContext";
import { useColorScheme } from "nativewind";
import { cn } from "@/lib/utils";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { DayBeingViewedContext } from "@/hooks/useCurrentViewedDay";
import { DateTime } from "luxon";
import { EnabledCalendarIdsContext } from "@/hooks/useEnabledCalendarIds";
import { useIsConnected } from "@/hooks/useIsConnected";
import * as Network from "expo-network";
import Storage from "expo-sqlite/kv-store";
import { SyncContext } from "@/hooks/sync";
import CustomTabBar from "@/components/CustomTabBar";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
export default function AppLayout() {
	const networkState = Network.useNetworkState();
	const { sessionId, isLoading, user } = useSession();
	const { colorScheme } = useColorScheme();

	const [dayBeingViewed, setDayBeingViewed] = useState(DateTime.now());
	const [enabledCalendarIds, setEnabledCalendarIds] = useState<string[]>(
		JSON.parse(Storage.getItemSync("enabledCalendarIds") ?? "[]")
	);
	const [syncing, setIsSyncing] = useState(false);
	useEffect(() => {
		console.log("sessionId", sessionId);
	}, [sessionId]);

	useEffect(() => {
		Storage.setItemSync("enabledCalendarIds", JSON.stringify(enabledCalendarIds));
	}, [enabledCalendarIds]);

	useEffect(() => {
		console.log("enabledCalendarIds", enabledCalendarIds);
	}, [enabledCalendarIds]);

	// You can keep the splash screen open, or render a loading screen like we do here.
	if (isLoading) {
		return <Text style={{ color: "#fac806", fontSize: 45 }}>Loading...</Text>;
	}

	// Only require authentication within the (app) group's layout as users
	// need to be able to access the (auth) group and sign in again.
	if (!sessionId) {
		console.log("no sessionId");
		// On web, static rendering will stop here as the user is not authenticated
		// in the headless Node process that the pages are rendered in.
		return <Redirect href="/sign-in" />;
	}

	if (networkState.isConnected == undefined) {
		return <Text>Loading...</Text>;
	}

	if (!user) {
		return <Text>Loading...</Text>;
	}

	// This layout can be deferred because it's not the root layout.
	return (
		<SyncContext.Provider
			value={{
				syncing,
				setSyncing: setIsSyncing,
			}}
		>
			<DayBeingViewedContext.Provider
				value={{
					value: dayBeingViewed,
					setValue: setDayBeingViewed,
				}}
			>
				<EnabledCalendarIdsContext.Provider
					value={{
						value: enabledCalendarIds,
						setValue: setEnabledCalendarIds,
					}}
				>
					<Tabs
						screenOptions={{
							headerShown: false,
							sceneStyle: { flex: 1, backgroundColor: colorScheme === "dark" ? "#030711" : "white" },
						}}
						tabBar={(props) => <CustomTabBar {...props} />}
					>
						<Tabs.Screen
							name="manageGroups"
							options={{
								tabBarIcon: ({ focused }) => {
									return <FontAwesome6 name="user-group" size={24} color={focused ? "blue" : "black"} />;
								},
								tabBarLabel: "",
							}}
						/>
						<Tabs.Screen
							name="browsePublicCalendars"
							options={{
								tabBarIcon: ({ focused }) => {
									return <MaterialCommunityIcons name="calendar-search" size={24} color={focused ? "blue" : "black"} />;
								},
								tabBarLabel: "",
							}}
						/>
						<Tabs.Screen
							name="(index)"
							options={{
								popToTopOnBlur: true,
								tabBarIcon: (props) => {
									if (props.focused) {
										return <MaterialIcons name="add-circle" size={48} color="blue" />;
									}

									return <AntDesign name="calendar" size={24} color="black" />;
								},
								tabBarLabel: "",
							}}
						/>
						<Tabs.Screen
							name="profileView"
							options={{
								tabBarIcon: ({ focused }) => {
									return <FontAwesome name="user-circle" size={24} color={focused ? "blue" : "black"} />;
								},
								tabBarLabel: "",
							}}
						/>
						<Tabs.Screen
							name="testButtons"
							options={{
								tabBarIcon: ({ focused }) => {
									return <MaterialCommunityIcons name="test-tube" size={24} color={focused ? "blue" : "black"} />;
								},
								tabBarLabel: "",
							}}
						/>
					</Tabs>
				</EnabledCalendarIdsContext.Provider>
			</DayBeingViewedContext.Provider>
		</SyncContext.Provider>
	);
}
