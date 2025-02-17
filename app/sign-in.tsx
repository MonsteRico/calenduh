import { router } from "expo-router";
import { Text, View } from "react-native";

import { useSession } from "../hooks/context";
import * as AppleAuthentication from "expo-apple-authentication";
import server from "@/constants/serverAxiosClient";
import { Button } from "@/components/Button";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import  * as AuthSession from "expo-auth-session";
import * as Crypto from "expo-crypto";
WebBrowser.maybeCompleteAuthSession();
const redirectUri = AuthSession.makeRedirectUri()

export default function SignIn() {
	const { signIn } = useSession();

  useEffect(() => {
    WebBrowser.warmUpAsync();

    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);


  const [_googleRequest, googleResult, googleSignIn] = AuthSession.useAuthRequest(
		{
			clientId: "calenduh",
			redirectUri,
			state: Crypto.randomUUID().toString()
		},
		{
			authorizationEndpoint: `${process.env.EXPO_PUBLIC_SERVER_URL}/auth/google/login`,
		}
	);

	  const [_discordRequest, discordResult, discordSignIn] = AuthSession.useAuthRequest(
			{
				clientId: "calenduh",
				redirectUri,
				state: Crypto.randomUUID().toString(),
			},
			{
				authorizationEndpoint: `${process.env.EXPO_PUBLIC_SERVER_URL}/auth/discord/login`,
			}
		);

	useEffect(() => {
		if (!googleResult) return;
		console.log("we have a result");
		console.log("result", googleResult);
		if (googleResult.type !== "success") return;
		console.log("result was success", googleResult);
		signIn(googleResult.params.sessionId);
	}, [googleResult]);

		useEffect(() => {
			if (!discordResult) return;
			console.log("we have a result");
			console.log("result", discordResult);
			if (discordResult.type !== "success") return;
			console.log("result was success", discordResult);
			signIn(discordResult.params.sessionId);
		}, [discordResult]);

	return (
		<View className="justify-content-center align-items-center flex-1">
			<Text className="text-4xl text-foreground">Sign In</Text>
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
						const sessionId = response.data.sessionId;
						signIn(sessionId);
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
					googleSignIn();
				}}
			>
				Google OAuth
			</Button>
			<Button
				onPress={() => {
					discordSignIn();
				}}
			>
				Discord OAuth
			</Button>
			<Button
				onPress={() => {
					signIn("test");
				}}
			>
				Fake Sign In
			</Button>
		</View>
	);
}
