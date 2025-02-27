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
import { SQLiteDatabase, SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { migrateDbIfNeeded } from "@/lib/migrate";
import * as Network from "expo-network";
import { Text } from "react-native";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import * as SQLite from "expo-sqlite";
import { IsConnected } from "@/hooks/useIsConnected";
// Create a client
const queryClient = new QueryClient();
const db = SQLite.openDatabaseSync("local.db");
export default function RootLayout() {
	const networkState = Network.useNetworkState();

	const { colorScheme } = useColorScheme();

	useDrizzleStudio(db);


	if (Object.keys(networkState).length == 0 || networkState.isConnected == undefined) {
		return <Text>Loading...</Text>;
	}


	return (
		<IsConnected.Provider value={{value: networkState.isConnected}}>
		<SQLite.SQLiteProvider databaseName={`local.db`} onInit={migrateDbIfNeeded}>
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
		</SQLite.SQLiteProvider>
		</IsConnected.Provider>
	);
}
