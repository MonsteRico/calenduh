import { router } from "expo-router";
import { Text, View } from "react-native";

import { useSession } from "../hooks/context";
import * as AppleAuthentication from "expo-apple-authentication";
import server from "@/constants/serverAxiosClient";
import { Button } from "@/components/Button";
export default function SignIn() {
	const { setAppSession } = useSession();

	return (
		<View className="flex-1 justify-content-center align-items-center">
			<Text className="text-foreground text-4xl">Sign In</Text>
            <Text className="text-red-500 text-2xl">Test</Text>
			<AppleAuthentication.AppleAuthenticationButton
				buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
				buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
				style={{ width: 300, height: 50 }}
				onPress={async () => {
					try {
						const credential: AppleAuthentication.AppleAuthenticationCredential = await AppleAuthentication.signInAsync(
							{
								requestedScopes: [
									AppleAuthentication.AppleAuthenticationScope.EMAIL,
								],
							}
						);
                        const response = await server.post("/auth/apple/login", credential); 
                        if (response.status !== 200) {
                            throw new Error("Axios shouldve caught already");
                        }
                        const session = response.data;
						// call will error if credential is not valid sending to catch otherwise will return session data
						// api checks if credential is a valid apple jwt'
						// we set our login context to true and set the session data
                        throw new Error("Axios shouldve DEFINITELY caught already");
						setAppSession(session);
						// if not valid, api returns error
					} catch (error: any) {
						if (error.code === "ERR_CANCELED") {
							console.error("Continue was cancelled.");
						} else {
							console.error("Error message",error.message);
                            console.error("FUll error",error);
						}
					}
				}}
			/>
			<Button onPress={() => {
				setAppSession({user:"test"});
			}}>Fake Sign In</Button>
		</View>
	);
}
