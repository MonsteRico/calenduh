import { router } from "expo-router";
import { Platform, Text, View, TouchableOpacity } from "react-native";

import { useSession } from "../hooks/authContext";
import * as AppleAuthentication from "expo-apple-authentication";
import server from "@/constants/serverAxiosClient";
import { Button } from "@/components/Button";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import * as AuthSession from "expo-auth-session";
import * as Crypto from "expo-crypto";
import { Feather } from "@expo/vector-icons";
import { Svg, Path, Circle } from "react-native-svg";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import DateTimePicker from "@react-native-community/datetimepicker";

WebBrowser.maybeCompleteAuthSession();
const redirectUri = AuthSession.makeRedirectUri();

export default function SignIn() {
	const { signIn } = useSession();

	useEffect(() => {
		if (Platform.OS !== "web") {
			WebBrowser.warmUpAsync();
		}

		return () => {
			if (Platform.OS !== "web") {
				WebBrowser.coolDownAsync();
			}
		};
	}, []);

	const [_googleRequest, googleResult, googleSignIn] = AuthSession.useAuthRequest(
		{
			clientId: "calenduh",
			redirectUri,
			state: Crypto.randomUUID().toString(),
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

	return (
		<View className="flex-1">
			<View className="flex-1 items-center justify-between px-6">
				<View className="mt-16 items-center">
					<View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-blue-50">
						<Feather name="calendar" size={48} color="#3b82f6" />
					</View>
					<Text className="text-4xl font-bold text-stone-800">Calenduh</Text>
					<Text className="mt-2 text-sm text-gray-500">The cleanest calendar app you've ever used. No bloat. Duh.</Text>
				</View>

				<View className="w-full max-w-md items-center gap-2 rounded-3xl bg-white px-6 py-8 shadow-lg">
					<Text className="mb-6 text-2xl font-semibold text-gray-800">Sign In</Text>

					<View className="space-y-4. w-full gap-2">
						{Platform.OS === "ios" && (
							<View className="w-full items-center">
								<AppleAuthentication.AppleAuthenticationButton
									buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
									buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
									style={{ width: "100%", height: 50, borderRadius: 12 }}
									onPress={async () => {
										try {
											const credential = await AppleAuthentication.signInAsync({
												requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
											});
											const response = await server.post("/auth/apple/login", credential);
											const sessionId = response.data.sessionId;
											signIn(sessionId);
										} catch (error) {
											if ((error as any).code === "ERR_CANCELED") {
												console.error("Sign in was cancelled.");
											} else {
												console.error("Error message", (error as any).message);
												console.error("Full error", error);
											}
										}
									}}
								/>
							</View>
						)}

						<Button
							variant="ghost"
							size="lg"
							className="rounded-xl border border-gray-300 bg-white"
							labelClasses="text-primary"
							onPress={async () => {
								const response = await googleSignIn({ showInRecents: true });
								console.log("we have a result");
								console.log("result", response);
								if (response.type !== "success") return;
								console.log("result was success", response);
								signIn(response.params.sessionId);
							}}
						>
							<View className="flex-row items-center">
								<Svg width={20} height={20} style={{ marginRight: 8, marginTop: 3 }} viewBox="0 0 24 24">
									<Path
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
										fill="#4285F4"
									/>
									<Path
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
										fill="#34A853"
									/>
									<Path
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
										fill="#FBBC05"
									/>
									<Path
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
										fill="#EA4335"
									/>
								</Svg>
								<Text>Sign-In with Google</Text>
							</View>
						</Button>

						<Button
							variant="ghost"
							size="lg"
							className="rounded-xl border border-gray-300 bg-white"
							labelClasses="text-primary"
							onPress={async () => {
								const response = await discordSignIn({ showInRecents: true });
								console.log("we have a result");
								console.log("result", response);
								if (response.type !== "success") return;
								console.log("result was success", response);
								signIn(response.params.sessionId);
							}}
						>
							<View className="flex-row items-center">
								<FontAwesome6 name="discord" size={20} color="#7289DA" className="pr-1 pt-1" />
								<Text>Sign-In with Discord</Text>
							</View>
						</Button>

						<View className="my-2 flex-row items-center">
							<View className="h-px flex-1 bg-gray-300" />
							<Text className="mx-4 text-sm text-gray-500">or</Text>
							<View className="h-px flex-1 bg-gray-300" />
						</View>

						<Button
							variant="secondary"
							size="lg"
							className="rounded-xl bg-gray-100"
							labelClasses="text-gray-700"
							onPress={() => signIn("LOCAL_ONLY")}
						>
							Continue as Guest
						</Button>
					</View>
				</View>

				<View className="mb-6 items-center" />
			</View>
		</View>
	);
}
