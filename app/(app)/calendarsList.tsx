import { Button } from "@/components/Button";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function CalendarsList() {
      const isPresented = router.canGoBack();
    return (
        <View>
            {isPresented && <Button onPress={() => {
                router.back();
            }} labelClasses="text-primary">
                Go Back
            </Button>}
            <Text className="text-primary">Modal screen</Text>
        </View>
    );
}
