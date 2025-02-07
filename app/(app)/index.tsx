import { Text, View } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import * as SecureStore from 'expo-secure-store';
import { useSession } from "@/hooks/context";
import { Button } from "@/components/Button";

export default function Index() {
  const { signOut } = useSession();

  return (
    <View>
     <Text className="text-foreground">Hello World</Text> 
     <Button
        onPress={() => {
          // The `app/(app)/_layout.tsx` will redirect to the sign-in screen.
          signOut();
        }}>
        Sign Out
      </Button>
    </View>
  );
}
