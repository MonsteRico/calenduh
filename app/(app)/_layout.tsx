import { Text, View } from "react-native";
import { Redirect, Slot, Stack } from "expo-router";
import { useSession } from "@/hooks/context";
import { useColorScheme } from "nativewind";
import { cn } from "@/lib/utils";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

export default function AppLayout() {
	const { session, isLoading } = useSession();
	const { colorScheme } = useColorScheme();

  useEffect(() => {
    console.log("session",session);
  }, [session]);

	// You can keep the splash screen open, or render a loading screen like we do here.
	if (isLoading) {
		return <Text style={{ color: "#fac806", fontSize: 45 }}>Loading...</Text>;
	}

	// Only require authentication within the (app) group's layout as users
	// need to be able to access the (auth) group and sign in again.
	if (!session) {
		console.log("session is null");
		// On web, static rendering will stop here as the user is not authenticated
		// in the headless Node process that the pages are rendered in.
		return <Redirect href="/sign-in" />;
	}

	// This layout can be deferred because it's not the root layout.
	return (
		<View className={cn("flex-1 native:my-16 native:mx-4", colorScheme === "dark" ? "dark" : "")}>
			<Slot screenOptions={{ headerShown: false }} />
		</View>
	);
}
