import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Switch } from "react-native";
import Dropdown from "./Dropdown";
import { DateTime } from "luxon";
import { start } from "repl";

interface RecurrenceSelectorProps {
	onRecurrenceChange: (cronString: string | null) => void;
	defaultValue?: string | null;
	start_time: DateTime;
}

type RecurrenceOption = {
	label: string;
	value: string;
};

const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
	onRecurrenceChange,
	defaultValue = null,
	start_time,
}) => {
	const [recurrenceType, setRecurrenceType] = useState<string | null>(null);
	const [cronString, setCronString] = useState<string | null>(defaultValue);
	const [selectedDays, setSelectedDays] = useState<boolean[]>([false, false, false, false, false, false, false]); // Sun, Mon, Tue, Wed, Thu, Fri, Sat

	console.log("start", start_time);

	useEffect(() => {
		if (defaultValue) {
			// Attempt to parse default value if needed
			setRecurrenceType("custom");
		}
	}, [defaultValue]);

	useEffect(() => {
		onRecurrenceChange(cronString);
	}, [cronString, onRecurrenceChange]);

	const handleRecurrenceTypeChange = (type: string) => {
		setRecurrenceType(type);
		let newCronString: string | null = null;

		const utcStart = start_time.toUTC();

		switch (type) {
			case "daily":
				newCronString = `${utcStart.minute} ${utcStart.hour} * * *`;
				break;
			case "weekly":
				newCronString = `${utcStart.minute} ${utcStart.hour} * * SUN`; // Defaults to Sunday, update with days
				break;
			case "monthly":
				newCronString = `${utcStart.minute} ${utcStart.hour} 1 * *`;
				break;
			case "yearly":
				newCronString = `${utcStart.minute} ${utcStart.hour} 1 1 *`;
				break;
			case "never":
				newCronString = null;
				break;
			default:
				newCronString = null;
				break;
		}

		setCronString(newCronString);
		if (type !== "weekly") {
			setSelectedDays([false, false, false, false, false, false, false]); // Reset days
		}
	};

	const handleDayToggle = (dayIndex: number) => {
		const newSelectedDays = [...selectedDays];
		newSelectedDays[dayIndex] = !newSelectedDays[dayIndex];
		setSelectedDays(newSelectedDays);
		const utcStart = start_time.toUTC();

		// Update cron string based on selected days
		if (recurrenceType === "weekly") {
			const dayStrings = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
			const selectedDayStrings = newSelectedDays
				.map((isSelected, index) => (isSelected ? dayStrings[index] : null))
				.filter((day): day is string => day !== null);
			console.log("utc start hour", utcStart.hour, "start time offset /60", start_time.offset / 60);

			for (let i = 0; i < selectedDayStrings.length; i++) {
				if (utcStart.hour + start_time.offset / 60 < 0) {
					let currentDayString = selectedDayStrings[i];
					selectedDayStrings[i] = dayStrings.at(dayStrings.indexOf(currentDayString) + 1)!;
				}
				if (utcStart.hour + start_time.offset / 60 > 23) {
					let currentDayString = selectedDayStrings[i];
					selectedDayStrings[i] = dayStrings.at(dayStrings.indexOf(currentDayString) - 1)!;
				}
			}

			if (selectedDayStrings.length > 0) {
				setCronString(`${utcStart.minute} ${utcStart.hour} * * ${selectedDayStrings.join(",")}`);
			} else {
				setCronString(null); // Or a default, like every Sunday "0 0 * * SUN"
			}
		}
	};

	const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	const recurrenceOptions: RecurrenceOption[] = [
		{ label: "Never", value: "never" },
		{ label: "Daily", value: "daily" },
		{ label: "Weekly", value: "weekly" },
		{ label: "Monthly", value: "monthly" },
		{ label: "Yearly", value: "yearly" },
	];

	const renderRecurrenceItem = (item: RecurrenceOption) => <Text className="text-primary">{item.label}</Text>;

	const onRecurrenceSelect = useCallback(
		(item: RecurrenceOption) => {
			handleRecurrenceTypeChange(item.value);
		},
		[handleRecurrenceTypeChange]
	);

	const selectedRecurrence = recurrenceOptions.find((option) => option.value === recurrenceType);

	return (
		<View className="flex flex-col gap-2">
			<Dropdown<RecurrenceOption>
				options={recurrenceOptions}
				renderItem={renderRecurrenceItem}
				onSelect={onRecurrenceSelect}
				defaultValue={selectedRecurrence}
			/>

			{recurrenceType === "weekly" && (
				<View className="flex-row flex-wrap">
					{dayNames.map((day, index) => (
						<TouchableOpacity
							key={index}
							className={`m-1 rounded border p-2 ${selectedDays[index] ? "bg-accent" : "bg-secondary"}`}
							onPress={() => handleDayToggle(index)}
						>
							<Text className="text-secondary-foreground">{day}</Text>
						</TouchableOpacity>
					))}
				</View>
			)}
		</View>
	);
};

export default RecurrenceSelector;
