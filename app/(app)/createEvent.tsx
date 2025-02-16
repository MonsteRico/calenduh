import { Button } from "@/components/Button";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SelectList } from 'react-native-dropdown-select-list';
import React from 'react';
import { FontAwesome } from "@expo/vector-icons";
import { Input } from "@/components/Input";
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreateEvent() {
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
                }}>
                    Cancel
                </Button>}

                {/* need to change this to follow user's appearance settings */}

                <Text className="text-3xl font-bold pl-5 items-center">Create Event</Text>
            </View>

            <Text>Name:</Text>
            <Input value={name} onChangeText={setName} placeholder="Event Name" /*style={{color:'white'}}*//>

            <Text>Location:</Text>
            <Input value={location} onChangeText={setLocation} placeholder="Location" />

            {/* need to change this to follow user's appearance settings */}
            <Text>Description:</Text>
            <Input value={description} onChangeText={setDescription} placeholder="Description" multiline={true} numberOfLines={4}/>

            <Text className="text-primary">Calendar : </Text>
            {/* need to change this to follow user's appearance settings */}
            <SelectList 
                setSelected={(val) => setSelected(val)} 
                data={userCals} 
                save="value"
                arrowicon={<FontAwesome name="chevron-down" size={12} /*color={'white'}*/ />} 
                searchicon={<FontAwesome name="search" size={12} /*color={'white'}*/ />}
                /*dropdownTextStyles={{color:'white'}}
                inputStyles={{color:'white'}}*/
                maxHeight={100}
            />

            
        </View>)

        
}
