import { SessionProvider } from "@/hooks/context";
import { Slot, Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import your global CSS file
import "../global.css";

// Create a client
const queryClient = new QueryClient();
export default function RootLayout() {
	return (
		<QueryClientProvider client={queryClient}>
			<SessionProvider>
				<Slot />
			</SessionProvider>
		</QueryClientProvider>
	);
}
