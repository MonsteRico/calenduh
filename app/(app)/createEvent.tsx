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
      const [endDate, setEndDate] = React.useState(''); //DateTimePicker
      const [location, setLocation] = React.useState(''); //Text box
      const [description, setDescription] = React.useState(''); //Text box
      const [selected, setSelected] = React.useState(""); //Single Select List

      //REPLACE WITH USER'S CALENDARS
      const data = [
        {key:'1', value:'Mobiles'},
        {key:'2', value:'Appliances'},
        {key:'3', value:'Cameras'},
        {key:'4', value:'Computers'},
        {key:'5', value:'Vegetables'},
        {key:'6', value:'Diary Products'},
        {key:'7', value:'Drinks'},
      ]

    return (
        <View>
            {isPresented && <Button onPress={() => {
                router.back();
            }}>
                Cancel
            </Button>}

            <Text className="text-primary">Create Event</Text>
      
      

            <Text className="text-primary">Calendar : </Text>

            <SelectList 
                setSelected={(val) => setSelected(val)} 
                data={data} 
                save="value"
                arrowicon={<FontAwesome name="chevron-down" size={12} color={'white'} />} 
                searchicon={<FontAwesome name="search" size={12} color={'white'} />}
                closeicon={<FontAwesome name="fa-solid fa-xmark" size={12} color={'white'} />}
                dropdownTextStyles={{color:'white'}}
                inputStyles={{color:'white'}}
                maxHeight={100}
            />

            
        </View>)

        
}
