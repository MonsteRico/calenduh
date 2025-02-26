import { useQuery, useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { useIsConnected } from "@/hooks/useIsConnected"; // Adjust path
import { Event, EventUpsert, UpdateEvent } from "@/types/event.types";
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
	upsertEventIntoDB,
} from "@/lib/event.helpers";
import { addMutationToQueue, getMutationsFromDB } from "@/lib/mutation.helpers";
import { useSession } from "./authContext";

// --- Queries ---

export const useEventsForCalendar = (calendar_id: string) => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	const { user } = useSession();
	if (!user) {
		throw new Error("User not found");
	}

	return useQuery<Event[], Error>({
		queryKey: ["events", calendar_id],
		queryFn: async () => {
			const localEvents = await getEventsForCalendarFromDB(calendar_id);

			if (isConnected) {
				try {
					const serverEvents = await getEventsForCalendarFromServer(calendar_id);
					const mutations = await getMutationsFromDB(); // Get the mutations that happened offline since last sync
					const deletedEventIds = mutations // Pull out any event ids that were deleted while offline
						.filter((mutation) => mutation.mutation === "DELETE_EVENT")
						.map((mutation) => mutation.event_id);
					for (const event of serverEvents) {
						// We only upsert events that are actually new in the server, so we dont upsert events that were deleted offline before they get deleted on the server
						if (!deletedEventIds.includes(event.event_id)) {
							await upsertEventIntoDB(event, user.user_id);
						}
					}

					return serverEvents.filter((event) => !deletedEventIds.includes(event.event_id)); // Remove any events that were deleted offline before they get deleted on the server
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

	const { user } = useSession();
	if (!user) {
		throw new Error("User not found");
	}

	return useQuery<Event, Error>({
		queryKey: ["events", calendar_id, event_id],
		queryFn: async () => {
			if (isConnected) {
				try {
					const serverEvent = await getEventFromServer(calendar_id, event_id);
					if (!serverEvent) {
						throw new Error("Event not found on server");
					}
					await updateEventInDB(serverEvent.event_id, serverEvent, user.user_id);

					return serverEvent;
				} catch (error) {
					console.error(`Error fetching event ${event_id} from server:`, error);
					const localEvent = await getEventFromDB(event_id);
					if (localEvent) {
						return localEvent;
					} else {
						throw new Error("Event not found locally or on server");
					}
				}
			} else {
				const localEvent = await getEventFromDB(event_id);
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

export const useCreateEvent = (
	options?: UseMutationOptions<
		Event,
		Error,
		{ newEvent: Omit<Event, "event_id">; calendar_id: string },
		{ previousEvents: Event[]; tempId: string }
	>
) => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	const { user } = useSession();
	if (!user) {
		throw new Error("User not found");
	}

	return useMutation({
		mutationFn: async ({ newEvent, calendar_id }: { newEvent: Omit<Event, "event_id">; calendar_id: string }) => {
			if (isConnected) {
				return await createEventOnServer(calendar_id, newEvent);
			} else {
				return { ...newEvent, event_id: Date.now().toString() } as Event;
			}
		},
		onMutate: async ({ newEvent, calendar_id }) => {
			options?.onMutate?.({newEvent, calendar_id});
			await queryClient.cancelQueries({ queryKey: ["events", calendar_id] });
			const previousEvents = queryClient.getQueryData<Event[]>(["events", calendar_id]) || [];

			const tempId = Date.now().toString();
			const optimisticEvent: Event = {
				...newEvent,
				event_id: tempId,
			} as Event;

			queryClient.setQueryData<Event[]>(["events", calendar_id], (old) => [...(old || []), optimisticEvent]);

			await insertEventIntoDB(optimisticEvent, user.user_id);
			addMutationToQueue("CREATE_EVENT", newEvent, { eventId: tempId, calendarId: calendar_id });

			return { previousEvents, tempId };
		},
		onError: (err, { newEvent, calendar_id }, context) => {
			options?.onError?.(err, {newEvent, calendar_id}, context);
			console.error("Error creating event:", err);
			queryClient.setQueryData<Event[]>(["events", calendar_id], context?.previousEvents);
		},
		onSuccess: (data, variables, context) => {
			options?.onSuccess?.(data, variables, context);
			// Boom baby!
		},
		onSettled: async (newEvent, error, variables, context) => {
			options?.onSettled?.(newEvent, error, variables, context);
			if (isConnected && newEvent && context?.tempId && !error) {
				try {
					await updateEventInDB(context.tempId, newEvent, user.user_id);
				} catch (error) {
					console.error("Error syncing event to server:", error);
				}
			}
			await queryClient.invalidateQueries({ queryKey: ["events", variables.calendar_id] });
		},
	});
};

export const useUpdateEvent = (
	options?: UseMutationOptions<
		UpdateEvent,
		Error,
		{ updatedEvent: UpdateEvent; calendar_id: string },
		{ previousEvents: Event[] }
	>
) => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	const { user } = useSession();
	if (!user) {
		throw new Error("User not found");
	}

	return useMutation({
		mutationFn: async ({ updatedEvent, calendar_id }: { updatedEvent: UpdateEvent; calendar_id: string }) => {
			if (isConnected) {
				return await updateEventOnServer(calendar_id, updatedEvent);
			} else {
				return updatedEvent;
			}
		},
		onMutate: async ({updatedEvent, calendar_id}) => {
			options?.onMutate?.({updatedEvent, calendar_id});
			await queryClient.cancelQueries({ queryKey: ["events", calendar_id] });
			const previousEvents = queryClient.getQueryData<Event[]>(["events", calendar_id]) || [];

			queryClient.setQueryData<Event[]>(["events", calendar_id], (old) =>
				old?.map((event) => (event.event_id === updatedEvent.event_id ? { ...event, ...updatedEvent } : event))
			);

			await updateEventInDB(updatedEvent.event_id, updatedEvent, user.user_id);
			await addMutationToQueue("UPDATE_EVENT", updatedEvent, {
				eventId: updatedEvent.event_id,
				calendarId: calendar_id,
			});
			return { previousEvents };
		},
		onError: (err, {updatedEvent, calendar_id}, context) => {
			options?.onError?.(err, {updatedEvent,calendar_id}, context);
			console.error("Error updating event:", err);
			queryClient.setQueryData<Event[]>(["events", calendar_id], context?.previousEvents);
		},
		onSuccess: (data, variables, context) => {
			options?.onSuccess?.(data, variables, context);
			// Boom baby!
		},
		onSettled: async (data, error, {updatedEvent, calendar_id}, context) => {
			options?.onSettled?.(data, error, {updatedEvent, calendar_id}, context);
			await queryClient.invalidateQueries({ queryKey: ["events", calendar_id] });
			await queryClient.invalidateQueries({ queryKey: ["event", calendar_id, updatedEvent.event_id] });
		},
	});
};

export const useDeleteEvent = (
	options?: UseMutationOptions<void, Error, { event_id: string; calendar_id: string }, { previousEvents: Event[] }>
) => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	return useMutation<void, Error, { event_id: string; calendar_id: string }, { previousEvents: Event[] }>({
		mutationFn: async ({ event_id, calendar_id }: { event_id: string; calendar_id: string }) => {
			if (isConnected) {
				return await deleteEventOnServer(calendar_id, event_id);
			} else {
				return;
			}
		},
		onMutate: async ({ event_id, calendar_id }) => {
			options?.onMutate?.({ event_id, calendar_id });
			await queryClient.cancelQueries({ queryKey: ["events", calendar_id] });
			const previousEvents = queryClient.getQueryData<Event[]>(["events", calendar_id]) || [];

			queryClient.setQueryData<Event[]>(["events", calendar_id], (old) =>
				old?.filter((event) => event.event_id !== event_id)
			);

			await deleteEventFromDB(event_id);
			await addMutationToQueue("DELETE_EVENT", event_id, { eventId: event_id });

			return { previousEvents };
		},
		onError: (err, { event_id, calendar_id }, context) => {
			options?.onError?.(err, { event_id, calendar_id }, context);
			console.error("Error deleting event:", err);
			queryClient.setQueryData<Event[]>(["events", calendar_id], context?.previousEvents);
		},
		onSuccess: (data, variables, context) => {
			options?.onSuccess?.(data, variables, context);
			// Boom baby!
		},
		onSettled: async (data, error, { event_id, calendar_id }, context) => {
			options?.onSettled?.(data, error, { event_id, calendar_id }, context);
			await queryClient.invalidateQueries({ queryKey: ["events", calendar_id] });
			await queryClient.invalidateQueries({ queryKey: ["event", calendar_id, event_id] });
		},
	});
};
