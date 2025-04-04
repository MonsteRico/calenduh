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
import { useSession } from "./authContext";

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

	const { user } = useSession();
	if (!user) {
		throw new Error("User not found");
	}

	const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

	return useMutation({
		mutationFn: async () => {
			//TODO needs better conflict resolution, rn it always will use the device/local things as the source of truth
			setSyncing(true);
			let numberSynced = 0;

			if (queryClient.isFetching() || queryClient.isMutating()) {
				await delay(1000);
			}

			// We only sync if we are connected and not in a web browser (web browsers will already be synced due to always being online)
			if (isConnected && Platform.OS !== "web") {
				const mutations = await getMutationsFromDB();
				console.log("mutations being synced", mutations);
				for (const mutation of mutations) {
					switch (mutation.mutation) {
						case "CREATE_CALENDAR":
							console.log("sync creating calendar");
							const newCalendar = await createCalendarOnServer(JSON.parse(mutation.parameters));
							if (mutation.calendar_id) {
								console.log("sync updating calendar with new id");
								await updateCalendarInDB(mutation.calendar_id, newCalendar, user.user_id);
							}
							break;
						case "UPDATE_CALENDAR":
							const updatedCalendar = await updateCalendarOnServer(JSON.parse(mutation.parameters));
							if (mutation.calendar_id) {
								await updateCalendarInDB(mutation.calendar_id, updatedCalendar, user.user_id);
							}
							break;
						case "DELETE_CALENDAR":
							await deleteCalendarOnServer(JSON.parse(mutation.parameters));
							break;
						case "CREATE_EVENT":
							if (!mutation.event_id) {
								if (process.env.SHOW_LOGS == 'true') {
									console.error("Mutation has no event_id and was trying to create an event");
								}
								continue;
							}
							if (!mutation.calendar_id) {
								if (process.env.SHOW_LOGS == 'true') {
									console.error("Mutation has no calendar_id and was trying to create an event");
								}
								continue;
							}
							const newEvent = await createEventOnServer(mutation.calendar_id, JSON.parse(mutation.parameters));
							updateEventInDB(mutation.event_id, newEvent, user.user_id);
							break;
						case "UPDATE_EVENT":
							if (!mutation.calendar_id) {
								if (process.env.SHOW_LOGS == 'true') {
									console.error("Mutation has no calendar_id and was trying to update an event");
								}
								continue;
							}
							if (!mutation.event_id) {
								if (process.env.SHOW_LOGS == 'true') {
									console.error("Mutation has no event_id and was trying to create an event");
								}
								continue;
							}
							const updatedEvent = await updateEventOnServer(mutation.calendar_id, JSON.parse(mutation.parameters));
							updateEventInDB(mutation.event_id, updatedEvent, user.user_id);
							break;
						case "DELETE_EVENT":
							if (!mutation.calendar_id) {
								if (process.env.SHOW_LOGS == 'true') {
									console.error("Mutation has no calendar_id and was trying to delete an event");
								}
								continue;
							}
							await deleteEventOnServer(mutation.calendar_id, JSON.parse(mutation.parameters));
							break;
					}
					await removeMutationFromQueue(mutation.number);
					numberSynced++;
				}
			}
			console.log("I finished syncing");
			return { numberSynced };
		},
		onError: (_err, _variables, context: any) => {
			if (process.env.SHOW_LOGS == 'true') {
				console.error("Error occurred while syncing to server:", context.error);
			}
			console.log("Number synced:", context.numberSynced);
		},
		onSuccess: (data, variables, context) => {

		},
		onSettled: (data, error, variables, context: any) => {
			// Refresh everything
			if (!data) {
				console.log("no data, error?")
				return
			}
			console.log("NUMBER SYNCED:", data.numberSynced);
			queryClient.invalidateQueries({ queryKey: ["calendars"] });
			queryClient.invalidateQueries({ queryKey: ["events"] });
			setSyncing(false);
		},
	});
}
