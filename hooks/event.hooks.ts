import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useIsConnected } from "@/hooks/useIsConnected"; // Adjust path
import { Event, EventUpsert } from "@/types/event.types";
import {
	getEventsFromDB,
	getEventsFromServer,
	getEventsForCalendarFromDB,
	getEventsForCalendarFromServer,
	getEventFromServer,
	insertEventIntoDB,
	updateEventInDB,
	deleteEventFromDB,
	createEventOnServer,
	updateEventOnServer,
	deleteEventOnServer,
	getEventFromDB,
} from "@/lib/event.helpers";
import { addMutationToQueue } from "@/lib/mutation.helpers";

// --- Queries ---

// export const useEvents = () => {
// 	const queryClient = useQueryClient();
// 	const isConnected = useIsConnected();

// 	return useQuery<Event[], Error>({
// 		queryKey: ["events"],
// 		queryFn: async () => {
// 			const localEvents = await getEventsFromDB();

// 			if (isConnected) {
// 				try {
// 					const serverEvents = await getEventsFromServer();

// 					for (const event of serverEvents) {
// 						await updateEventInDB(event);
// 					}

// 					queryClient.invalidateQueries({ queryKey: ["events"] });
// 					return serverEvents;
// 				} catch (error) {
// 					console.error("Error fetching events from server:", error);
// 					return localEvents;
// 				}
// 			} else {
// 				return localEvents;
// 			}
// 		},
// 	});
// };

export const useEventsForCalendar = (calendar_id: string) => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	return useQuery<Event[], Error>({
		queryKey: ["events", calendar_id],
		queryFn: async () => {
			const localEvents = await getEventsForCalendarFromDB(calendar_id);

			if (isConnected) {
				try {
					const serverEvents = await getEventsForCalendarFromServer(calendar_id);

					for (const event of serverEvents) {
						await updateEventInDB(event);
					}

					queryClient.invalidateQueries({ queryKey: ["events", calendar_id] });
					return serverEvents;
				} catch (error) {
					console.error(`Error fetching events for calendar ${calendar_id} from server:`, error);
					return localEvents;
				}
			} else {
				return localEvents;
			}
		},
	});
};

export const useEvent = (calendar_id: string, event_id: string) => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	return useQuery<Event, Error>({
		queryKey: ["events", calendar_id, event_id],
		queryFn: async () => {
			if (isConnected) {
				try {
					const serverEvent = await getEventFromServer(calendar_id, event_id);
					if (!serverEvent) {
						throw new Error("Event not found on server");
					}
					await updateEventInDB(serverEvent);
					queryClient.invalidateQueries({
						queryKey: ["events", calendar_id, event_id],
					});
					return serverEvent;
				} catch (error) {
					console.error(`Error fetching event ${event_id} from server:`, error);
					const localEvent = await getEventFromDB(calendar_id, event_id);
					if (localEvent) {
						return localEvent;
					} else {
						throw new Error("Event not found locally or on server");
					}
				}
			} else {
				const localEvent = await getEventFromDB(calendar_id, event_id);
				if (localEvent) {
					return localEvent;
				} else {
					throw new Error("Event not found locally");
				}
			}
		},
	});
};

// --- Mutations --- (No changes needed in mutations)

export const useCreateEvent = (calendar_id: string) => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	return useMutation<Event, Error, Omit<Event, "event_id">, { previousEvents: Event[]; tempId: string }>({
		mutationFn: async (newEvent: Omit<Event, "event_id">) => {
			if (isConnected) {
				return await createEventOnServer(calendar_id, newEvent);
			} else {
				addMutationToQueue("CREATE_EVENT", newEvent);
				return { ...newEvent, event_id: Date.now().toString() } as Event;
			}
		},
		onMutate: async (newEvent) => {
			await queryClient.cancelQueries({ queryKey: ["events", calendar_id] });
			const previousEvents = queryClient.getQueryData<Event[]>(["events", calendar_id]) || [];

			const tempId = Date.now().toString();
			const optimisticEvent: Event = {
				...newEvent,
				event_id: tempId,
			} as Event;

			queryClient.setQueryData<Event[]>(["events", calendar_id], (old) => [...(old || []), optimisticEvent]);

			await insertEventIntoDB(optimisticEvent);

			return { previousEvents, tempId };
		},
		onError: (err, newEvent, context) => {
			console.error("Error creating event:", err);
			queryClient.setQueryData<Event[]>(["events", calendar_id], context?.previousEvents);
		},
		onSuccess: (data, variables, context) => {
			// Boom baby!
		},
		onSettled: async (newEvent, error, variables, context) => {
			if (isConnected && newEvent && context?.tempId) {
				try {
					const serverEvent = await createEventOnServer(calendar_id, variables);
					await updateEventInDB(serverEvent);
					queryClient.setQueryData<Event[]>(["events", calendar_id], (old) =>
						old?.map((event) => (event.event_id === context.tempId ? serverEvent : event))
					);
				} catch (error) {
					console.error("Error syncing event to server:", error);
				}
			}
			await queryClient.invalidateQueries({ queryKey: ["events", calendar_id] });
		},
	});
};

export const useUpdateEvent = (calendar_id: string) => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	return useMutation<Event, Error, Event, { previousEvents: Event[] }>({
		mutationFn: async (updatedEvent: Event) => {
			if (isConnected) {
				return await updateEventOnServer(calendar_id, updatedEvent);
			} else {
				addMutationToQueue("UPDATE_EVENT", updatedEvent);
				return updatedEvent;
			}
		},
		onMutate: async (updatedEvent) => {
			await queryClient.cancelQueries({ queryKey: ["events", calendar_id] });
			const previousEvents = queryClient.getQueryData<Event[]>(["events", calendar_id]) || [];

			queryClient.setQueryData<Event[]>(["events", calendar_id], (old) =>
				old?.map((event) => (event.event_id === updatedEvent.event_id ? updatedEvent : event))
			);

			await updateEventInDB(updatedEvent);

			return { previousEvents };
		},
		onError: (err, updatedEvent, context) => {
			console.error("Error updating event:", err);
			queryClient.setQueryData<Event[]>(["events", calendar_id], context?.previousEvents);
		},
		onSuccess: (data, variables, context) => {
			// Boom baby!
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: ["events", calendar_id] });
		},
	});
};

export const useDeleteEvent = (calendar_id: string) => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	return useMutation<void, Error, string, { previousEvents: Event[] }>({
		mutationFn: async (event_id: string) => {
			if (isConnected) {
				return await deleteEventOnServer(calendar_id, event_id);
			} else {
				addMutationToQueue("DELETE_EVENT", event_id);
				return;
			}
		},
		onMutate: async (event_id) => {
			await queryClient.cancelQueries({ queryKey: ["events", calendar_id] });
			const previousEvents = queryClient.getQueryData<Event[]>(["events", calendar_id]) || [];

			queryClient.setQueryData<Event[]>(["events", calendar_id], (old) =>
				old?.filter((event) => event.event_id !== event_id)
			);

			await deleteEventFromDB(event_id);

			return { previousEvents };
		},
		onError: (err, event_id, context) => {
			console.error("Error deleting event:", err);
			queryClient.setQueryData<Event[]>(["events", calendar_id], context?.previousEvents);
		},
		onSuccess: (data, variables, context) => {
			// Boom baby!
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: ["events", calendar_id] });
		},
	});
};