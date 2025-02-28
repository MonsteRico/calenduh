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
	getEventsForDayFromServer,
} from "@/lib/event.helpers";
import { addMutationToQueue, getMutationsFromDB } from "@/lib/mutation.helpers";
import { useSession } from "./authContext";
import { DateTime } from "luxon";
import * as Crypto from "expo-crypto";

// --- Queries ---

export const useEventsForCalendar = (calendar_id: string) => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	const { user, sessionId } = useSession();
	if (!user || !sessionId) {
		throw new Error("User not found");
	}

	return useQuery<Event[], Error>({
		queryKey: ["events", calendar_id],
		queryFn: async () => {
			const localEvents = await getEventsForCalendarFromDB(calendar_id);

			if (isConnected && user.user_id !== "localUser") {
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

	const { user, sessionId } = useSession();
	if (!user || !sessionId) {
		throw new Error("User not found");
	}

	return useQuery<Event, Error>({
		queryKey: ["events", calendar_id, event_id],
		queryFn: async () => {
			if (isConnected && user.user_id !== "localUser") {
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

export const useEventsForDay = (day: DateTime) => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	const { user, sessionId } = useSession();
	if (!user || !sessionId) {
		throw new Error("User not found");
	}

	return useQuery<Event[], Error>({
		queryKey: ["events", "day", day.toISODate()], // Cache key based on the date
		queryFn: async () => {
			const startOfDay = day.startOf("day").valueOf(); // Get the start of the day in milliseconds
			const endOfDay = day.endOf("day").valueOf(); // Get the end of the day in milliseconds

			if (isConnected && user.user_id !== "localUser") {
				try {
					const serverEvents = await getEventsForDayFromServer(startOfDay, endOfDay);
					const mutations = await getMutationsFromDB(); // Get the mutations that happened offline since last sync
					const deletedEventIds = mutations // Pull out any event ids that were deleted while offline
						.filter((mutation) => mutation.mutation === "DELETE_EVENT")
						.map((mutation) => mutation.event_id);

					const filteredServerEvents = serverEvents.filter((event) => !deletedEventIds.includes(event.event_id)); // Remove any events that were deleted offline before they get deleted on the server

					// Update local DB with server events
					for (const event of filteredServerEvents) {
						await upsertEventIntoDB(event, user.user_id);
					}

					return filteredServerEvents;
				} catch (error) {
					console.error("Error fetching events for day from server:", error);
					// Fallback to local database if server fetch fails
					const localEvents = await getEventsFromDB(user.user_id);

					// Filter events that fall within the specified day
					const eventsForDay = localEvents.filter((event) => {
						const startTime = event.start_time.valueOf(); // Assuming start_time is a Date object
						return startTime >= startOfDay && startTime <= endOfDay;
					});

					return eventsForDay;
				}
			} else {
				// Offline: Fetch from local database
				const localEvents = await getEventsFromDB(user.user_id);

				// Filter events that fall within the specified day
				const eventsForDay = localEvents.filter((event) => {
					const startTime = event.start_time.valueOf(); // Assuming start_time is a Date object
					return startTime >= startOfDay && startTime <= endOfDay;
				});

				return eventsForDay;
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

	const { user, sessionId } = useSession();
	if (!user || !sessionId) {
		throw new Error("User not found or session not found");
	}

	return useMutation({
		mutationFn: async ({ newEvent, calendar_id }: { newEvent: Omit<Event, "event_id">; calendar_id: string }) => {
			if (isConnected && user.user_id !== "localUser") {
				return await createEventOnServer(calendar_id, newEvent);
			} else {
				console.log("not connected");
				return { ...newEvent, event_id: "local-"+Crypto.randomUUID() } as Event;
			}
		},
		onMutate: async ({ newEvent, calendar_id }) => {
			options?.onMutate?.({ newEvent, calendar_id });
			await queryClient.cancelQueries({ queryKey: ["events", calendar_id] });
			const previousEvents = queryClient.getQueryData<Event[]>(["events", calendar_id]) || [];

			const tempId = "local-"+Crypto.randomUUID();
			const optimisticEvent: Event = {
				...newEvent,
				event_id: tempId,
			} as Event;

			queryClient.setQueryData<Event[]>(["events", calendar_id], (old) => [...(old || []), optimisticEvent]);

			await insertEventIntoDB(optimisticEvent, user.user_id);
			if (!isConnected && user.user_id !== "localUser") {
				addMutationToQueue("CREATE_EVENT", newEvent, { eventId: tempId, calendarId: calendar_id });
			}
			return { previousEvents, tempId };
		},
		onError: (err, { newEvent, calendar_id }, context) => {
			options?.onError?.(err, { newEvent, calendar_id }, context);
			console.error("Error creating event:", err);
			queryClient.setQueryData<Event[]>(["events", calendar_id], context?.previousEvents);
		},
		onSuccess: (data, variables, context) => {
			options?.onSuccess?.(data, variables, context);
			// Boom baby!
		},
		onSettled: async (newEvent, error, variables, context) => {
			options?.onSettled?.(newEvent, error, variables, context);
			if (isConnected && newEvent && context?.tempId && !error && user.user_id !== "localUser") {
				try {
					await updateEventInDB(context.tempId, newEvent, user.user_id);
				} catch (error) {
					console.error("Error syncing event to server:", error);
				}
			}
			await queryClient.invalidateQueries({ queryKey: ["events", variables.calendar_id] });
			await queryClient.invalidateQueries({ queryKey: ["events", "day", variables.newEvent.start_time.toISODate()] });
			if (variables.newEvent.start_time.toISODate() !== variables.newEvent.end_time.toISODate()) {
				await queryClient.invalidateQueries({ queryKey: ["events", "day", variables.newEvent.end_time.toISODate()] });
			}
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

	const { user, sessionId } = useSession();
	if (!user || !sessionId) {
		throw new Error("User not found or session not found");
	}

	return useMutation({
		mutationFn: async ({ updatedEvent, calendar_id }: { updatedEvent: UpdateEvent; calendar_id: string }) => {
			if (isConnected && user.user_id !== "localUser") {
				return await updateEventOnServer(calendar_id, updatedEvent);
			} else {
				return updatedEvent;
			}
		},
		onMutate: async ({ updatedEvent, calendar_id }) => {
			options?.onMutate?.({ updatedEvent, calendar_id });
			await queryClient.cancelQueries({ queryKey: ["events", calendar_id] });
			const previousEvents = queryClient.getQueryData<Event[]>(["events", calendar_id]) || [];

			queryClient.setQueryData<Event[]>(["events", calendar_id], (old) =>
				old?.map((event) => (event.event_id === updatedEvent.event_id ? { ...event, ...updatedEvent } : event))
			);

			await updateEventInDB(updatedEvent.event_id, updatedEvent, user.user_id);
			if (!isConnected && user.user_id !== "localUser") {
				await addMutationToQueue("UPDATE_EVENT", updatedEvent, {
					eventId: updatedEvent.event_id,
					calendarId: calendar_id,
				});
			}

			const localEvent = await getEventFromDB(updatedEvent.event_id);
			if (!localEvent) {
				throw new Error("Event not found locally");
			}

			return { previousEvents, startTime: localEvent.start_time, endTime: localEvent.end_time };
		},
		onError: (err, { updatedEvent, calendar_id }, context) => {
			options?.onError?.(err, { updatedEvent, calendar_id }, context);
			console.error("Error updating event:", err);
			queryClient.setQueryData<Event[]>(["events", calendar_id], context?.previousEvents);
		},
		onSuccess: (data, variables, context) => {
			options?.onSuccess?.(data, variables, context);
			// Boom baby!
		},
		onSettled: async (data, error, { updatedEvent, calendar_id }, context) => {
			options?.onSettled?.(data, error, { updatedEvent, calendar_id }, context);
			await queryClient.invalidateQueries({ queryKey: ["events", calendar_id] });
			await queryClient.invalidateQueries({ queryKey: ["event", calendar_id, updatedEvent.event_id] });
			if (context?.startTime && context?.endTime) {
				await queryClient.invalidateQueries({
					queryKey: ["events", "day", context.startTime.toISODate()],
				});
				if (context.startTime.toISODate() !== context.endTime.toISODate()) {
					await queryClient.invalidateQueries({
						queryKey: ["events", "day", context.endTime.toISODate()],
					});
				}
			}
		},
	});
};

export const useDeleteEvent = (
	options?: UseMutationOptions<void, Error, { event_id: string; calendar_id: string }, { previousEvents: Event[] }>
) => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	const { user, sessionId } = useSession();
	if (!user || !sessionId) {
		throw new Error("User not found or session not found");
	}

	return useMutation({
		mutationFn: async ({ event_id, calendar_id }: { event_id: string; calendar_id: string }) => {
			if (isConnected && user.user_id !== "localUser") {
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

			const localEvent = await getEventFromDB(event_id);
			if (!localEvent) {
				throw new Error("Event not found locally");
			}

			await deleteEventFromDB(event_id);
			if (!isConnected && user.user_id !== "localUser") {
				await addMutationToQueue("DELETE_EVENT", event_id, { eventId: event_id });
			}

			return { previousEvents, startTime: localEvent.start_time, endTime: localEvent.end_time };
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
			if (context?.startTime && context?.endTime) {
				await queryClient.invalidateQueries({
					queryKey: ["events", "day", context.startTime.toISODate()],
				});
				if (context.startTime.toISODate() !== context.endTime.toISODate()) {
					await queryClient.invalidateQueries({
						queryKey: ["events", "day", context.endTime.toISODate()],
					});
				}
			}
		},
	});
};
