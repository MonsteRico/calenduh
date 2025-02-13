import { router } from "expo-router";
import { Text, View } from "react-native";

import { useSession } from "../hooks/context";
import * as AppleAuthentication from "expo-apple-authentication";
import server from "@/constants/serverAxiosClient";
import { Button } from "@/components/Button";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import  * as AuthSession from "expo-auth-session";
WebBrowser.maybeCompleteAuthSession();
const redirectUri = AuthSession.makeRedirectUri()

export default function SignIn() {
	const { setAppSession } = useSession();

  useEffect(() => {
    WebBrowser.warmUpAsync();

    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);


//   const [request, result, promptAsync] = AuthSession.useAuthRequest(
// 		{
// 			clientId: "native.code",
// 			redirectUri,
// 			scopes: ["openid", "profile", "email", "offline_access"],
// 		},
// 		discovery
// 	);

	return (
		<View className="flex-1 justify-content-center align-items-center">
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
