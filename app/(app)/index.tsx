import { Text, View } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import * as SecureStore from 'expo-secure-store';
import { useSession } from "@/hooks/context";

export default function Index() {
  const { signOut } = useSession();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
     <Text>Hello World</Text> 
     <Text
        onPress={() => {
          // The `app/(app)/_layout.tsx` will redirect to the sign-in screen.
          signOut();
        }}>
        Sign Out
      </Text>
    </View>
  );
}
