import { Button } from "@/components/Button";
import { router } from "expo-router";
import { Text, View } from "react-native";
import { Checkbox } from "@/components/Checkbox";
import { Accordion } from "@/components/Accordion";
import { useState } from "react";
import { CalendarItem } from "@/components/CalendarItem";

interface example_calendar {
    name: string;
    color: string;
}

const calendars: example_calendar[] = [
    { name: "Calendar1", color: "#0000FF" },
    { name: "Calendar2", color: "#d42245" },
    { name: "Calendar3", color: "#0a571e" }
];


export default function CalendarsList() {
    const isPresented = router.canGoBack();
    const [modalVisible, setModalVisible] = useState(false);

    return (

        <View>
            <View className='bg-border items-left flex-row items-center justify-between'>
                <View className="flex-row items-center m-2">
                    {isPresented && <Button onPress={() => {
                        router.back();
                    }} labelClasses="text-secondary">
                        Back
                    </Button>}
                    <Text className="text-3xl font-bold pl-5">Calendars</Text>
                </View>
                <Button labelClasses="text-secondary" className="mr-5">Add Calendar</Button>

            </View>
            <Accordion title={"Owned Calendars"} className="mb-5">
                <View className="m-5">
                    {calendars.map((calendar) => (
                        <View className="mb-3">
                            <CalendarItem key={calendar.name} name={calendar.name} color={calendar.color} onPress={() => { router.navigate("/calendarInfoView") }} />
                        </View>
                    ))}
                </View>
            </Accordion>

            <Accordion title={"Group Calendars"} className="mb-5">
                <View className="m-5">
                    {calendars.map((calendar) => (
                        <View className="mb-3">
                            <CalendarItem key={calendar.name} name={calendar.name} color={calendar.color} />
                        </View>
                    ))}
                </View>
            </Accordion>

            <Accordion title={"Other Calendars"}>
                <View className="m-5">
                    {calendars.map((calendar) => (
                        <View className="mb-3">
                            <CalendarItem key={calendar.name} name={calendar.name} color={calendar.color} />
                        </View>
                    ))}
                </View>
            </Accordion>
        </View>
    );
}
