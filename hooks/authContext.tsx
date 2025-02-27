import { useContext, createContext, type PropsWithChildren } from "react";
import { Platform } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import server from "@/constants/serverAxiosClient";
import { router } from "expo-router";
import { User, Session } from "@/lib/types";
import { useEnabledCalendarIds } from "./useEnabledCalendarIds";

const AuthContext = createContext<{
	signIn: (sessionId: string) => void;
	signOut: () => void;
	sessionId?: string | null;
	isLoading: boolean;
	user?: User | null
}>({
	signIn: (sessionId: string) => null,
	signOut: () => null,
	sessionId: null,
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
	const { data: loginData, isLoading } = useQuery<{ sessionId: string; user: User }>({
		queryKey: ["loginData"],
		queryFn: async () => {
			console.log("fetching session");
			if (Platform.OS === "web") {
				return { sessionId: "test", user: { id: "test", email: "test@test.com", username: "test" } };

				// try to fetch session from server
				const response = await server.get("/session");
				if (response.status === 200) {
					return response.data;
				}
			} else {
				const sessionId = await SecureStore.getItemAsync("sessionId");
				const stringifiedUser = await SecureStore.getItemAsync("user");
				if (sessionId && stringifiedUser) {
					const user = JSON.parse(stringifiedUser);
					// set session-id cookie on server instance as a default header
					server.defaults.headers.Cookie = `sessionId=${sessionId};`;
					console.log("sessionId IN AUTH CONTEXT", sessionId);
					console.log(server.defaults.headers.Cookie);
					return { sessionId, user };
				}
				return null;
			}
		},
	});

	const queryClient = useQueryClient();

	return (
		<AuthContext.Provider
			value={{
				signIn: async (sessionId: string) => {
					if (sessionId === "test") {
						const user = {
							id: "test",
							email: "test@test.com",
							username: "test",
						};
						if (Platform.OS !== "web") {
							SecureStore.setItem("sessionId", JSON.stringify(sessionId));
							SecureStore.setItem("user", JSON.stringify(user));
						}
						// session was set on server (since we received the session from the server)
						// so we need to refresh the query to get the new session
						queryClient.invalidateQueries({
							queryKey: ["loginData"],
						});
						router.replace("/");
					}
					server.defaults.headers.Cookie = `sessionId=${sessionId};`;
					const response = await server.get(`/users/@me`);
					const user = response.data;
					console.log("user", user);
					if (Platform.OS !== "web") {
						SecureStore.setItem("sessionId", JSON.stringify(sessionId));
						SecureStore.setItem("user", JSON.stringify(user));
					}
					// session was set on server (since we received the session from the server)
					// so we need to refresh the query to get the new session
					queryClient.invalidateQueries({
						queryKey: ["loginData"],
					});
					router.replace("/");
				},
				signOut: () => {
					server.post("/auth/logout"); // TODO make this a react query mutation so it can run when reconnect to internet
					if (Platform.OS !== "web")  {
						SecureStore.deleteItemAsync("session");
						SecureStore.deleteItemAsync("user");
					}
					server.defaults.headers.Cookie = "";
					// navigate to sign in page
					router.replace("/sign-in");
				},
				sessionId: loginData?.sessionId,
				user: loginData?.user,
				isLoading,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
