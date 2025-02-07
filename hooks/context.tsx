import { useContext, createContext, type PropsWithChildren } from "react";
import { Platform } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import server from "@/constants/serverAxiosClient";
import { router } from "expo-router";
import { User, Session } from "@/lib/types";

const AuthContext = createContext<{
	setAppSession: (loginData: { session: Session; user: User }) => void;
	signOut: () => void;
	session?: Session | null;
	isLoading: boolean;
	user?: User | null
}>({
	setAppSession: (loginData: { session: Session; user: User }) => null,
	signOut: () => null,
	session: null,
	isLoading: false,
	user: null,
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
	const { data: loginData, isLoading } = useQuery<{ session: Session; user: User }>({
		queryKey: ["session"],
		queryFn: async () => {
			console.log("fetching session");
			if (Platform.OS === "web") {
				return { session: { user_id: "test", id: "test", type: "test", access_token: "test", refresh_token: "test", expires_on: 1234567890 }, user: { id: "test", email: "test@test.com", username: "test" } };

				// try to fetch session from server
				const response = await server.get("/session");
				if (response.status === 200) {
					return response.data;
				}
			} else {
				const stringifiedSession = await SecureStore.getItemAsync("session");
				const stringifiedUser = await SecureStore.getItemAsync("user");
				if (stringifiedSession && stringifiedUser) {
					const session = JSON.parse(stringifiedSession);
					const user = JSON.parse(stringifiedUser);
					return { session, user };
				}
				return null;
			}
		},
	});

	const queryClient = useQueryClient();

	return (
		<AuthContext.Provider
			value={{
				setAppSession: (loginData: { session: Session; user: User }) => {
					if (Platform.OS !== "web") {
						SecureStore.setItem("session", JSON.stringify(loginData.session));
						SecureStore.setItem("user", JSON.stringify(loginData.user));
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
						SecureStore.deleteItemAsync("user");
					}
					// navigate to sign in page
					router.replace("/sign-in");
				},
				session: loginData?.session,
				user: loginData?.user,
				isLoading,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
