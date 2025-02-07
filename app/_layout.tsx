import { SessionProvider } from "@/hooks/context";
import { Slot, Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
// Import your global CSS file
import "../global.css";
import { useColorScheme } from "nativewind";
import { View } from "react-native";
import { cn } from "@/lib/utils";

// Create a client
const queryClient = new QueryClient();
export default function RootLayout() {
	const {colorScheme} = useColorScheme();
	return (
		<QueryClientProvider client={queryClient}>
			<SessionProvider>
			<View className={cn("flex-1 native:my-16 native:mx-4", colorScheme === "dark" ? "dark" : "")}>
				<StatusBar style="auto" />
					<Slot />
				</View>
			</SessionProvider>
		</QueryClientProvider>
	);
}
