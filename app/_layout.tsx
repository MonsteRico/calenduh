import { SessionProvider } from "@/hooks/authContext";
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
							<Stack
								screenOptions={{
									headerShown: false,
									contentStyle: { flex: 1, backgroundColor: colorScheme === "dark" ? "#030711" : "white" },
								}}
							>
								<Stack.Screen name="app" /> {/* <= important! */}
							</Stack>
						</SafeAreaView>
					</SafeAreaProvider>
				</SessionProvider>
			</GestureHandlerRootView>
		</QueryClientProvider>
	);
}
