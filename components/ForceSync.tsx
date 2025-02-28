import FontAwesome from "@expo/vector-icons/FontAwesome";

import { useSync } from "@/hooks/sync";
import { useSyncing } from "@/hooks/sync";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated";
import { useIsConnected } from "@/hooks/useIsConnected";
import { useColorScheme } from "nativewind";

export default function ForceSync() {
	const { syncing } = useSyncing();
	const { mutate: sync } = useSync();
	const rotation = useSharedValue(0);
	const isConnected = useIsConnected();
	const { colorScheme } = useColorScheme();

	const iconColor = colorScheme == "light" ? "white" : "black";

	useEffect(() => {
		if (syncing) {
			rotation.value = withRepeat(
				withTiming(360, {
					duration: 1000,
					easing: Easing.linear,
				}),
				-1
			);
		} else {
			rotation.value = 0;
		}
	}, [syncing]);

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ rotate: `${rotation.value}deg` }],
		};
	});

	useEffect(() => {
		const oneMinuteTimer = setInterval(() => {
			sync();
		}, 1000 * 60);
		return () => clearInterval(oneMinuteTimer);
	}, []);

	useEffect(() => {
		if (isConnected) {
			sync();
		}
	}, [isConnected]);

	return (
		<Button
			onPress={() => {
				sync();
			}}
		>
			<Animated.View style={animatedStyle}>
				<FontAwesome name="refresh" size={18} color={iconColor} />
			</Animated.View>
		</Button>
	);
}
