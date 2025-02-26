import { Button } from "@/components/Button";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SelectList } from 'react-native-dropdown-select-list';
import React from 'react';
import { FontAwesome } from "@expo/vector-icons";
import { Input } from "@/components/Input";
import { useColorScheme } from "nativewind";
import DateTimePicker from 'react-native-ui-datepicker';
import dayjs from 'dayjs';

export default function EditEvent() {
      const { colorScheme } = useColorScheme();
      const isPresented = router.canGoBack();

      const [name, setName] = React.useState(''); //Text box
      const [startDate, setStartDate] = React.useState(dayjs()); //DateTimePicker
      const [endDate, setEndDate] = React.useState(dayjs()); //DateTimePicker
      const [location, setLocation] = React.useState(''); //Text box
      const [description, setDescription] = React.useState(''); //Text box
      const [notify, setNotif] = React.useState(''); //Text box
      const [cal, setSelected] = React.useState(""); //Single Select List
      const [freq, setFrequency] = React.useState(""); //Single Select List

      //REPLACE WITH USER'S CALENDARS
      const userCals = [
        {key:'1', value:'Calendar 1'},
        {key:'2', value:'Calendar 2'},
        {key:'3', value:'Calendar 3'},
      ]

      /*
      const freqs = [
        {key:'1', value:'Weekly'},
        {key:'2', value:'Calendar 2'},
        {key:'3', value:'Calendar 3'},
      ]
      */

      const globColor = colorScheme == "light" ? "black" : "white"

    return (
			<View>
				{/* header */}
				<View className="m-2 flex-row items-center">
					{isPresented && (
						<Button
							onPress={() => {
								router.back();
							}}
							className="text-primary"
						>
							Cancel
						</Button>
					)}

					<Text className="items-center pl-5 text-3xl font-bold text-primary">Edit Event</Text>
				</View>

				<View>
					<Text className="text-primary">Name:</Text>
					<Input className="text-primary" value={name} onChangeText={setName} defaultValue={name} />

					<Text className="text-primary">Location:</Text>
					<Input className="text-primary" value={location} onChangeText={setLocation} defaultValue={location} />

					<Text className="text-primary">Description:</Text>
					<Input
						className="text-primary"
						value={description}
						onChangeText={setDescription}
						defaultValue={description}
						multiline={true}
						numberOfLines={4}
					/>

					<Text className="text-primary">Notification:</Text>
					<Input
						className="text-primary"
						value={notify}
						onChangeText={setNotif}
						defaultValue={notify}
						maxLength={100}
					/>

					<Text className="text-primary">Calendar:</Text>

					<SelectList
						setSelected={(cal) => setSelected(cal)}
						data={userCals}
						save="value"
						//These icons for no reason don't use className :sob:
						arrowicon={<FontAwesome name="chevron-down" size={12} color={globColor} />}
						searchicon={<FontAwesome name="search" size={12} color={globColor} />}
						closeicon={<FontAwesome name="stop" size={12} color={globColor} />}
						defaultOption={{ key: "1", value: "Calendar 1" }} //Update to whatever the user had on this event last
						//All because this lovely component doesn't have className
						inputStyles={{ color: colorScheme == "light" ? "black" : "white" }}
						dropdownTextStyles={{ color: colorScheme == "light" ? "black" : "white" }}
						//In case disabled is needed
						disabledTextStyles={{ color: colorScheme == "light" ? "black" : "white" }}
						maxHeight={100}
					/>

					<Text className="text-primary">Start:</Text>
					<View style={styles.container}>
						<DateTimePicker
							//Update to whatever the user had on this event last
							mode="single"
							date={startDate}
							timePicker={true}
							onChange={(params) => setStartDate(params.date)}
						/>

						<Text className="text-primary">End:</Text>
						<DateTimePicker
							//Update to whatever the user had on this event last
							mode="single"
							date={endDate}
							timePicker={true}
							onChange={(params) => setEndDate(params.date)}
						/>
					</View>
				</View>
				{/* Get this to send event to db */}
				<Button>Update Event</Button>

				{/* Get this to send event to db */}
				<Button>Delete Event</Button>
			</View>
		);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
      },
})
