import { Button } from "@/components/Button";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SelectList } from 'react-native-dropdown-select-list';
import React from 'react';
import { FontAwesome } from "@expo/vector-icons";
import { Input } from "@/components/Input";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useColorScheme } from "nativewind";

export default function CreateEvent() {
      const { colorScheme } = useColorScheme();
      const isPresented = router.canGoBack();

      const [name, setName] = React.useState(''); //Text box
      const [startDate, setStartDate] = React.useState(''); //DateTimePicker
      const [startTime, setStartTime] = React.useState(''); //DateTimePicker
      const [endDate, setEndDate] = React.useState(''); //DateTimePicker
      const [endTime, setEndTime] = React.useState(''); //DateTimePicker
      const [location, setLocation] = React.useState(''); //Text box
      const [description, setDescription] = React.useState(''); //Text box
      const [cal, setSelected] = React.useState(""); //Single Select List

      //REPLACE WITH USER'S CALENDARS
      const userCals = [
        {key:'1', value:'Calendar 1'},
        {key:'2', value:'Calendar 2'},
        {key:'3', value:'Calendar 3'},
      ]

      

    return (
        
        <View>
            <View className="flex-row items-center m-2">
                {isPresented && <Button onPress={() => {
                router.back();
                }} className="text-primary">
                    Cancel
                </Button>}

                {/* need to change this to follow user's appearance settings */}

                <Text className="text-primary text-3xl font-bold pl-5 items-center">Create Event</Text>
            </View>

            <Text className="text-primary">Name:</Text>
            <Input className="text-primary" value={name} onChangeText={setName} placeholder="Event Name" />

            <Text className="text-primary">Location:</Text>
            <Input className="text-primary" value={location} onChangeText={setLocation} placeholder="Location" />

            <Text className="text-primary">Description:</Text>
            <Input className="text-primary" value={description} onChangeText={setDescription} placeholder="Description" multiline={true} numberOfLines={4}/>

            <Text className="text-primary">Calendar : </Text>

            <SelectList 
                setSelected={(val) => setSelected(val)} 
                data={userCals} 
                save="value"
                //These icons for no reason don't use className :sob:
                arrowicon={<FontAwesome className="text-primary" name="chevron-down" size={12} />} 
                searchicon={<FontAwesome className="text-primary" name="search" size={12} />}
                //All because this lovely component doesn't have className
                boxStyles={{ color: colorScheme == "light" ? "black" : "white"}}
                inputStyles={{ color: colorScheme == "light" ? "black" : "white"}}
                dropdownStyles={{ color: colorScheme == "light" ? "black" : "white"}}
                dropdownItemStyles={{ color: colorScheme == "light" ? "black" : "white"}}
                dropdownTextStyles={{ color: colorScheme == "light" ? "black" : "white"}}
                //In case disabled is needed
                disabledItemStyles={{ color: colorScheme == "light" ? "black" : "white"}}
                disabledTextStyles={{ color: colorScheme == "light" ? "black" : "white"}}
                maxHeight={100}
            />

            
        </View>)

        
}
