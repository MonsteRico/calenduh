import { Button } from "@/components/Button";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Checkbox } from "@/components/Checkbox";

export default function CalendarsList() {
      const isPresented = router.canGoBack();

    return (
        <View>
            <View className='bg-border items-left flex-row items-center justify-between'>
                <View className="flex-row items-center m-2">
                {isPresented && <Button onPress={() => {
                    router.back();
                }} labelClasses="text-secondary">
                    Back
                </Button>}
                <Text className="text-2xl font-bold pl-5">Calendars</Text>
                </View>
                <View className="mr-3">
                    <Button labelClasses="text-secondary">Add Calendar</Button>
                </View>

            </View>

            <View className="m-3">
                <Checkbox label="Calendar1" labelClasses="text-xl" color='#0000FF' checkSymbol={false}/>
                <Checkbox label="Calendar2" labelClasses="text-xl"/>
                       
            </View>
        </View>
    );
}
