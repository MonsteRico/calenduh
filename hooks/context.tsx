import { useContext, createContext, type PropsWithChildren } from "react";
import { Platform } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import server from "@/constants/serverAxiosClient";
import { router } from "expo-router";

const AuthContext = createContext<{
	setAppSession: (userData: { user: string }) => void;
	signOut: () => void;
	session?: {
		user: string;
	} | null;
	isLoading: boolean;
}>({
	setAppSession: (userData: { user: string }) => null,
	signOut: () => null,
	session: null,
	isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
	const value = useContext(AuthContext);
	if (process.env.NODE_ENV !== "production") {
		if (!value) {
			throw new Error("useSession must be wrapped in a <SessionProvider />");
		}
	}

	return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
	// check for preexisting session DIFFERENT ON WEB AND MOBILE
	const { data: session, isLoading } = useQuery({
		queryKey: ["session"],
		queryFn: async () => {
			console.log("fetching session");
			if (Platform.OS === "web") {
				return { user: "test" };

				// try to fetch session from server
				const response = await server.get("/session");
				if (response.status === 200) {
					return response.data;
				}
			} else {
				const stringifiedSession = await SecureStore.getItemAsync("session");
				if (stringifiedSession) {
					return JSON.parse(stringifiedSession);
				}
				return null;
			}
		},
	});

	const queryClient = useQueryClient();

	return (
		<AuthContext.Provider
			value={{
				setAppSession: (session: { user: string }) => {
					if (Platform.OS !== "web") {
						SecureStore.setItem("session", JSON.stringify(session));
					}
					// session was set on server (since we received the session from the server)
					// so we need to refresh the query to get the new session
					queryClient.invalidateQueries({
						queryKey: ["session"],
					});
					router.replace("/");
				},
				signOut: () => {
					if (Platform.OS === "web") {
						// sign out of server
					} else {
						SecureStore.deleteItemAsync("session");
					}
					// navigate to sign in page
					router.replace("/sign-in");
				},
				session,
				isLoading,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
