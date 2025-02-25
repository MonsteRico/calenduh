import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useIsConnected } from "./useIsConnected";
import { Dispatch, SetStateAction, createContext, useContext } from "react";
import { getMutationsFromDB, removeMutationFromQueue } from "@/lib/mutation.helpers";
import { Platform } from "react-native";
import {
	createCalendarOnServer,
	deleteCalendarOnServer,
	updateCalendarInDB,
	updateCalendarOnServer,
} from "@/lib/calendar.helpers";
import { createEventOnServer, deleteEventOnServer, updateEventInDB, updateEventOnServer } from "@/lib/event.helpers";

export const SyncContext = createContext<{
	syncing: boolean;
	setSyncing: Dispatch<SetStateAction<boolean>>;
}>({
	syncing: false,
	setSyncing: () => null,
});

export function useSyncing() {
	const { syncing, setSyncing } = useContext(SyncContext);
	if (process.env.NODE_ENV !== "production") {
		if (!syncing && !setSyncing) {
			throw new Error("useSync must be wrapped in a <SyncProvider />");
		}
	}
	return { syncing, setSyncing };
}

export function useSync() {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();
	const { syncing, setSyncing } = useContext(SyncContext);

	return useMutation({
		mutationFn: async () => {
			//TODO needs better conflict resolution, rn it always will use the device/local things as the source of truth
			setSyncing(true);
			let numberSynced = 0;
			// We only sync if we are connected and not in a web browser (web browsers will already be synced due to always being online)
			if (isConnected && Platform.OS !== "web") {
				try {
					const mutations = await getMutationsFromDB();
					console.log("mutations being synced", mutations);
					for (const mutation of mutations) {
						switch (mutation.mutation) {
							case "CREATE_CALENDAR":
								console.log("sync creating calendar");
								const newCalendar = await createCalendarOnServer(JSON.parse(mutation.parameters));
								if (mutation.calendar_id) {
									console.log("sync updating calendar with new id");
									await updateCalendarInDB(mutation.calendar_id, newCalendar);
								}
								break;
							case "UPDATE_CALENDAR":
								const updatedCalendar = await updateCalendarOnServer(JSON.parse(mutation.parameters));
								if (mutation.calendar_id) {
									await updateCalendarInDB(mutation.calendar_id, updatedCalendar);
								}
								break;
							case "DELETE_CALENDAR":
								await deleteCalendarOnServer(JSON.parse(mutation.parameters));
								break;
							case "CREATE_EVENT":
								if (!mutation.calendar_id) {
									console.error("Mutation has no calendar_id and was trying to create an event");
									continue;
								}
								const newEvent = await createEventOnServer(mutation.calendar_id, JSON.parse(mutation.parameters));
								updateEventInDB(newEvent);
								break;
							case "UPDATE_EVENT":
								if (!mutation.calendar_id) {
									console.error("Mutation has no calendar_id and was trying to update an event");
									continue;
								}
								const updatedEvent = await updateEventOnServer(mutation.calendar_id, JSON.parse(mutation.parameters));
								updateEventInDB(updatedEvent);
								break;
							case "DELETE_EVENT":
								if (!mutation.calendar_id) {
									console.error("Mutation has no calendar_id and was trying to delete an event");
									continue;
								}
								await deleteEventOnServer(mutation.calendar_id, JSON.parse(mutation.parameters));
								break;
						}
						await removeMutationFromQueue(mutation.number);
						numberSynced++;
					}
				} catch (error: any) {
					return { error, numberSynced };
				}
			}
			return { numberSynced };
		},
		onError: (_err, _variables, context: any) => {
			console.error("Error occurred while syncing to server:", context.error);
			console.log("Number synced:", context.numberSynced);
		},
		onSuccess: (data, variables, context) => {
			// Boom baby!
		},
		onSettled: async (data, error, variables, context: any) => {
			// Refresh everything
			console.log("Number synced:", context.numberSynced);
			await queryClient.invalidateQueries({ queryKey: ["calendars"] });
			await queryClient.invalidateQueries({ queryKey: ["events"] });
			setSyncing(false);
		},
	});
}
