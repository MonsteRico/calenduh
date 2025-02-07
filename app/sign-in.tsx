import { router } from "expo-router";
import { Text, View } from "react-native";

import { useSession } from "../hooks/context";
import * as AppleAuthentication from "expo-apple-authentication";
import server from "@/constants/serverAxiosClient";
import { Button } from "@/components/Button";
export default function SignIn() {
	const { setAppSession } = useSession();

	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<Text className="text-foreground text-4xl">Sign In</Text>
			<Text className="text-2xl text-red-500">Test</Text>
			<AppleAuthentication.AppleAuthenticationButton
				buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
				buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
				style={{ width: 300, height: 50 }}
				onPress={async () => {
					try {
						const credential: AppleAuthentication.AppleAuthenticationCredential = await AppleAuthentication.signInAsync(
							{
								requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
							}
						);
						const response = await server.post("/auth/apple/login", credential);
						const loginData = response.data;
						console.log("loginData", loginData);
						setAppSession(loginData);
					} catch (error: any) {
						if (error.code === "ERR_CANCELED") {
							console.error("Continue was cancelled.");
						} else {
							console.error("Error message", error.message);
							console.error("FUll error", error);
						}
					}
				}}
			/>
			<Button
				onPress={() => {
					setAppSession({
						session: {
							id: "test",
							user_id: "test",
							type: "test",
							access_token: "test",
							refresh_token: "test",
							expires_on: 1234567890,
						},
						user: {
							id: "test",
							email: "test@test.com",
							username: "test",
						},
					});
				}}
			>
				Fake Sign In
			</Button>
		</View>
	);
}
