import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform, ViewStyle, TextStyle, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link, router } from "expo-router";

interface TabBarProps {
	state: any;
	descriptors: any;
	navigation: any;
	screenOptions?: {
		tabBarActiveTintColor?: string;
		tabBarInactiveTintColor?: string;
		tabBarStyle?: ViewStyle;
		tabBarLabelStyle?: TextStyle;
	};
}

const CustomTabBar = ({ state, descriptors, navigation, screenOptions }: TabBarProps) => {
	const { bottom } = useSafeAreaInsets();
	const isIos = Platform.OS === "ios";

	const defaultActiveTintColor = screenOptions?.tabBarActiveTintColor || "blue";
	const defaultInactiveTintColor = screenOptions?.tabBarInactiveTintColor || "gray";
	const defaultTabBarStyle = screenOptions?.tabBarStyle || {};
	const defaultTabBarLabelStyle = screenOptions?.tabBarLabelStyle || {};

	return (
		<View style={[styles.tabBarContainer, { height: isIos ? 20 + bottom : 70 }, defaultTabBarStyle]}>
			{state.routes.map((route: any, index: number) => {
				const { options } = descriptors[route.key];
				const label =
					options.tabBarLabel !== undefined
						? options.tabBarLabel
						: options.title !== undefined
							? options.title
							: route.name;

				const isFocused = state.index === index;

				const onPress = () => {
					const event = navigation.emit({
						type: "tabPress",
						target: route.key,
						canPreventDefault: true,
                        alreadyFocused: isFocused
					});

					if (!isFocused && !event.defaultPrevented) {
						navigation.navigate(route.name);
					}

                    if (isFocused && route.name == "(index)") {
                        router.push("./createEvent")
                    }
				};

				const onLongPress = () => {
					navigation.emit({
						type: "tabLongPress",
						target: route.key,
					});
				};

				return (
					<TouchableOpacity
						key={route.key}
						accessibilityRole="button"
						accessibilityState={isFocused ? { selected: true } : {}}
						accessibilityLabel={options.tabBarAccessibilityLabel}
						testID={options.tabBarTestID}
						onPress={onPress}
						onLongPress={onLongPress}
						style={styles.tabItem}
					>
						{options.tabBarIcon &&
							options.tabBarIcon({
								focused: isFocused,
								color: isFocused ? defaultActiveTintColor : defaultInactiveTintColor,
								size: 12,
							})}
						{label.trim() !== ""  && <Text
							style={{
								color: isFocused ? defaultActiveTintColor : defaultInactiveTintColor,
								...defaultTabBarLabelStyle,
							}}
						>
							{label}
						</Text>}
					</TouchableOpacity>
				);
			})}
		</View>
	);
};

const styles = StyleSheet.create({
	tabBarContainer: {
		flexDirection: "row",
		backgroundColor: "white",
		borderTopWidth: 1,
		borderTopColor: "#E5E5E5",
	},
	tabItem: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 1,
	},
});

export default CustomTabBar;
