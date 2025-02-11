import { SessionProvider } from "@/hooks/context";
import { Slot, Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
// Import your global CSS file
import "../global.css";
import { useColorScheme } from "nativewind";
import { View } from "react-native";
import { cn } from "@/lib/utils";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Create a client
const queryClient = new QueryClient();
export default function RootLayout() {
	const { colorScheme } = useColorScheme();
	return (
		<QueryClientProvider client={queryClient}>
			<GestureHandlerRootView>
				<SessionProvider>
					<SafeAreaProvider>
						<SafeAreaView className={cn("flex-1 bg-background", colorScheme === "dark" ? "dark" : "")}>
							<StatusBar style="auto" />
							<Slot />
						</SafeAreaView>
					</SafeAreaProvider>
				</SessionProvider>
			</GestureHandlerRootView>
		</QueryClientProvider>
	);
}
