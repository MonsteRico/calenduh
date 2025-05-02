import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { Button } from "@/components/Button";
import { useState } from "react";
import { Input } from "@/components/Input";
import { DismissKeyboardView } from "@/components/DismissKeyboardView";
import * as DocumentPicker from "expo-document-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import server from "@/constants/serverAxiosClient";
import { errorCatcher } from "@/lib/easyAxiosCatch";

// Placeholder API functions (replace with your actual API calls)
const uploadIcalFile = async (file: { uri: string; name: string; mimeType?: string; size?: number }) => {
	const formData = new FormData();
	// @ts-expect-error
	formData.append("file" , {
		uri: file.uri,
		type: file.mimeType,
		name: file.name,
	})
	console.log("File imported:", file);
	const response = await server
		.post("/calendars/import", formData)
	console.log("reponse");
	const data = response.data;
	if (response.status == 200) {
		return { success: true, message: "File imported successfully" };
	} else {
		console.log("FAILED", response);
		return { success: false, message: "Something went wrong on the server" };
	}
};

const importIcalFromUrl = async (url: string) => {
	console.log("URL imported:", url);
	const response = await server.post("/calendars/import/web", {
		url,
	});
	const data = response.data;
	if (response.status == 200) {
		return { success: true, message: "URL imported successfully" };
	} else {
		return { success: false, message: "Something went wrong on the server" };
	}
};

export default function ImportCalendarView() {
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
	const queryClient = useQueryClient();
	const [selectedFile, setSelectedFile] = useState<{
		uri: string;
		name: string;
		mimeType?: string;
		size?: number;
	} | null>(null);
	const uploadFileMutation = useMutation({
		mutationFn: uploadIcalFile,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["calendars"],
			});
			router.back();
		},
	});
	const pickDocument = async () => {
		let result = await DocumentPicker.getDocumentAsync({
			type: "text/calendar", // MIME type for iCal files
			copyToCacheDirectory: true,
		});

		if (!result.assets) {
			return;
		}
		const fileData = result.assets[0];
		if (!result.canceled && fileData) {
			setSelectedFile(fileData);
		} else {
			console.log("Document picking cancelled");
			console.log(result);
		}
	};

	const handleSubmit = async () => {
		if (selectedFile) {
			uploadFileMutation.mutate(selectedFile);
		}
	};

	return (
		<View className="m-4 gap-4">
			<Text className="mb-2 text-xl font-bold text-primary">Importing iCal from a File</Text>
			<Text className="mb-4 text-primary">
				Calendars imported this way will NOT be synced with their origin iCal. Whatever events are in the iCal as you
				downloaded are all that will be imported. Any edits or additions made to the calendar will be kept and not
				overwritten.
			</Text>
			<Button onPress={pickDocument}>Select iCal File</Button>
			{selectedFile && <Text className="mt-2 text-secondary">Selected File: {selectedFile.name}</Text>}
			<Button onPress={handleSubmit} className={cn(!selectedFile && "opacity-50")} disabled={!selectedFile}>
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
	const queryClient = useQueryClient();
	const [url, setUrl] = useState("");
	const importUrlMutation = useMutation({
		mutationFn: importIcalFromUrl,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["calendars"],
			});
			router.back();
		},
	});

	const handleSubmit = async () => {
		importUrlMutation.mutate(url);
	};

	return (
		<View className="m-4 gap-4">
			<Text className="mb-2 text-xl font-bold text-primary">Importing iCal from a URL</Text>
			<Text className="mb-4 text-primary">
				Calendars imported this way will be synced with their origin iCal about every 4 hours. Any edits you make to
				events or the calendar will be overwritten. Any new events added will not be synced back to the origin.
			</Text>
			<Input placeholder="Enter iCal URL" autoComplete={undefined} value={url} onChangeText={setUrl} className="mb-2" />
			<Button onPress={handleSubmit} disabled={!url}>
				Import
			</Button>

			{importUrlMutation.isSuccess && <Text className="mt-2 text-green-500">Calendar Imported</Text>}

			{importUrlMutation.isError && (
				<Text className="mt-2 text-red-500">Error: {importUrlMutation.error?.message || "Import failed"}</Text>
			)}
		</View>
	);
}
