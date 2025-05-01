import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { Button } from "@/components/Button";
import { useState } from "react";
import { Input } from "@/components/Input";
import { DismissKeyboardView } from "@/components/DismissKeyboardView";
import * as DocumentPicker from "expo-document-picker";
import { useMutation } from "@tanstack/react-query";

// Placeholder API functions (replace with your actual API calls)
const uploadIcalFile = async (file) => {
	// Simulate API call
	await new Promise((resolve) => setTimeout(resolve, 1000));
	console.log("File uploaded:", file);
	return { success: true, message: "File uploaded successfully" };
};

const importIcalFromUrl = async (url) => {
	// Simulate API call
	await new Promise((resolve) => setTimeout(resolve, 1000));
	console.log("URL imported:", url);
	return { success: true, message: "URL imported successfully" };
};

export default function CalendarInfoView() {
	const isPresented = router.canGoBack();
	const params = useLocalSearchParams();
	const importType = params?.importType;

	return (
		<DismissKeyboardView className="flex-1 bg-background">
			<View className="m-2 flex-row items-center justify-between">
				{isPresented && (
					<Button
						onPress={() => {
							router.back();
						}}
						labelClasses="text-secondary"
					>
						Cancel
					</Button>
				)}
				<Text className="items-center pl-5 text-3xl font-bold text-primary">Import Calendar</Text>
			</View>
			{importType === "file" ? <ImportFromFile /> : null}
			{importType === "url" ? <ImportFromURL /> : null}
		</DismissKeyboardView>
	);
}

function ImportFromFile() {
	const [selectedFile, setSelectedFile] = useState<{
		uri: string;
		name: string;
		type: string | undefined;
		size: number | undefined;
	} | null>(null);
	const uploadFileMutation = useMutation({ mutationFn: uploadIcalFile });
	const pickDocument = async () => {
		let result = await DocumentPicker.getDocumentAsync({
			type: "text/calendar", // MIME type for iCal files
		});

		if (!result.assets) {
			return;
		}

		const file = result.assets[0];

		if (!result.canceled && file) {
			setSelectedFile({
				uri: file.uri,
				name: file.name,
				type: file.mimeType,
				size: file.size,
			});
		} else {
			console.log("Document picking cancelled");
		}
	};

	const handleSubmit = async () => {
		if (selectedFile) {
			uploadFileMutation.mutate(selectedFile);
		}
	};

	return (
		<View className="m-4">
			<Text className="mb-2 text-xl font-bold text-primary">Importing iCal from a File</Text>
			<Text className="mb-4 text-secondary">
				Calendars imported this way will NOT be synced with their origin iCal. Whatever events are in the iCal as you
				downloaded are all that will be imported
			</Text>
			<Button onPress={pickDocument}>Select iCal File</Button>
			{selectedFile && <Text className="mt-2 text-secondary">Selected File: {selectedFile.name}</Text>}
			<Button onPress={handleSubmit} disabled={!selectedFile || uploadFileMutation.isPending}>
				Upload File
			</Button>

			{uploadFileMutation.isSuccess && <Text className="mt-2 text-green-500">Calendar Imported</Text>}

			{uploadFileMutation.isError && (
				<Text className="mt-2 text-red-500">Error: {uploadFileMutation.error?.message || "Upload failed"}</Text>
			)}
		</View>
	);
}

function ImportFromURL() {
	const [url, setUrl] = useState("");
	const importUrlMutation = useMutation({ mutationFn: importIcalFromUrl });

	const handleSubmit = async () => {
		importUrlMutation.mutate(url);
	};

	return (
		<View className="m-4">
			<Text className="mb-2 text-xl font-bold text-primary">Importing iCal from a URL</Text>
			<Text className="mb-4 text-secondary">
				Calendars imported this way will be synced with their origin iCal about every 4 hours.
			</Text>
			<Input placeholder="Enter iCal URL" value={url} onChangeText={setUrl} className="mb-2" />
			<Button onPress={handleSubmit} disabled={!url || importUrlMutation.isPending}>
				Import
			</Button>

			{importUrlMutation.isSuccess && <Text className="mt-2 text-green-500">Calendar Imported</Text>}

			{importUrlMutation.isError && (
				<Text className="mt-2 text-red-500">Error: {importUrlMutation.error?.message || "Import failed"}</Text>
			)}
		</View>
	);
}
