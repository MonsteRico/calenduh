import { useQuery, useMutation, useQueryClient, UseMutationOptions, QueryOptions } from "@tanstack/react-query";
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
	updateEventNotificationIds,
	deleteEventsUntilNowOnServer,
	deleteEventsUntilFromDB,
} from "@/lib/event.helpers";
import { addMutationToQueue, getMutationsFromDB } from "@/lib/mutation.helpers";
import { useSession } from "./authContext";
import { DateTime, Duration, Interval } from "luxon";
import * as Crypto from "expo-crypto";
import { cancelScheduledEventNotifications, scheduleEventNotifications } from "@/lib/notifications";
import * as SecureStore from "expo-secure-store";
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

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
					if (process.env.SHOW_LOGS == 'true') {
						console.error(`Error fetching events for calendar ${calendar_id} from server:`, error);
					}
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
					if (process.env.SHOW_LOGS == 'true') {
						console.error(`Error fetching event ${event_id} from server:`, error);
					}
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

export const useEventsForInterval = (interval: Interval<true>) => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	const { user, sessionId } = useSession();
	if (!user || !sessionId) {
		throw new Error("User not found");
	}

	return useQuery<Event[], Error>({
		queryKey: ["events", "interval", interval.toISO()], // Cache key based on the date
		queryFn: async () => {
			const intervalStart = interval.start.valueOf(); // Get the start of the day in milliseconds
			const intervalEnd = interval.end.valueOf(); // Get the end of the day in milliseconds

			console.log("Fetching events between", interval.start.toISODate(), "and", interval.end.toISODate());

			if (isConnected && user.user_id !== "localUser") {
				try {
					const serverEvents = await getEventsForDayFromServer(intervalStart, intervalEnd);
					const mutations = await getMutationsFromDB(); // Get the mutations that happened offline since last sync

					const deletedEventIds = mutations // Pull out any event ids that were deleted while offline
						.filter((mutation) => mutation.mutation === "DELETE_EVENT")
						.map((mutation) => mutation.event_id);

					const filteredServerEvents = serverEvents.filter((event) => !deletedEventIds.includes(event.event_id)); // Remove any events that were deleted offline before they get deleted on the server

					// Update local DB with server events
					for (const event of filteredServerEvents) {
						await upsertEventIntoDB(event, user.user_id);
					}

					// for each day in the interval, update the queryClient cache for that day
					interval
						.splitBy({
							day: 1,
						})
						.forEach((dayInterval) => {
							const day = dayInterval.start;
							const daysEvents = filteredServerEvents
								.map((event) =>
									dayInterval.contains(event.start_time) || dayInterval.contains(event.end_time) ? event : null
								)
								.filter((event) => event != null);
							queryClient.setQueryData(["events", "day", day?.toISODate()], daysEvents);
						});

					return filteredServerEvents;
				} catch (error) {
					if (process.env.SHOW_LOGS == 'true') {
						console.error("Error fetching events for interval from server:", error);
					}
					// Fallback to local database if server fetch fails
					const localEvents = await getEventsFromDB(user.user_id);
					// Filter events that fall within the specified day
					const eventsForDay = localEvents.filter((event) => {
						const startTime = event.start_time.valueOf(); // Assuming start_time is a Date object
						return startTime >= intervalStart && startTime <= intervalEnd;
					});

					return eventsForDay;
				}
			} else {
				// Offline: Fetch from local database
				const localEvents = await getEventsFromDB(user.user_id);

				// Filter events that fall within the specified day
				const eventsForDay = localEvents.filter((event) => {
					const startTime = event.start_time.valueOf(); // Assuming start_time is a Date object
					return startTime >= intervalStart && startTime <= intervalEnd;
				});

				return eventsForDay;
			}
		},
	});
};

export const useEventsForDay = (day: DateTime, options?: { enabled: boolean }) => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	const { user, sessionId } = useSession();
	if (!user || !sessionId) {
		throw new Error("User not found");
	}

	return useQuery<Event[], Error>({
		queryKey: ["events", "day", day.toISODate()], // Cache key based on the date
		queryFn: async () => {
			console.log("Use events for day query ran ");
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
					if (process.env.SHOW_LOGS == 'true') {
						console.error("Error fetching events for day from server:", error);
					}
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
		enabled: options?.enabled,
	});
};

export const useEventsForWeek = (day: DateTime, options?: {enabled: boolean}) => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	const { user, sessionId } = useSession();
	if (!user || !sessionId) {
		throw new Error("User not found");
	}

	return useQuery<Event[], Error>({
		queryKey: ["events", "week", day.startOf('week').toISODate()], // Cache key based on the week
		queryFn: async () => {
			
			var startOfWeek = day.startOf('week').minus({ days: 1 }).valueOf(); 
			var endOfWeek = day.endOf('week').minus({ days: 1 }).valueOf(); 

			if (day.weekday === 7) {
				startOfWeek = day.plus({ days: 1 }).startOf('week').minus({ days: 1 }).valueOf(); 
				endOfWeek = day.plus({ days: 1 }).endOf('week').minus({ days: 1 }).valueOf(); 
			}
			console.log("start of week:", DateTime.fromMillis(startOfWeek).toISODate());
			console.log("end of week:", DateTime.fromMillis(endOfWeek).toISODate());
			//adjusts for sunday not accounted for by part of week (re-assigns to)
			if (day.weekday !== 7) {
				const startOfWeek = day.startOf('week').minus({ days: 1 }).valueOf(); // Get the start of the week in milliseconds
				const endOfWeek = day.endOf('week').minus({ days: 1 }).valueOf(); // Get the end of the week in milliseconds
			} 
			if (isConnected && user.user_id !== 'localUser') {
				try {
					const serverEvents = await getEventsForDayFromServer(startOfWeek, endOfWeek);
					const mutations = await getMutationsFromDB(); // Get the mutations that happened offline since last sync
					const deletedEventIds = mutations // Pull out any event ids that were deleted while offline
						.filter((mutation) => mutation.mutation === 'DELETE_EVENT')
						.map((mutation) => mutation.event_id);

					const filteredServerEvents = serverEvents.filter((event) => !deletedEventIds.includes(event.event_id)); // Remove any events that were deleted offline before they get deleted on the server


					// Update local DB with server events
					for (const event of filteredServerEvents) {
						await upsertEventIntoDB(event, user.user_id);
					}

					return filteredServerEvents;
				} catch (error) {
					if (process.env.SHOW_LOGS == 'true') {
						console.error("Error fetching events for week from server:", error);
					}
					// Fallback to local database if server fetch fails
					const localEvents = await getEventsFromDB(user.user_id);

					const eventsForWeek = localEvents.filter((event) => {
						const startTime = event.start_time.valueOf(); // Assuming start_time is a Date object
						return startTime >= startOfWeek && startTime <= endOfWeek;
					});

					return eventsForWeek;
				}
			} else {
				// Offline: Fetch from local database
				const localEvents = await getEventsFromDB(user.user_id);

				// Filter events that fall within the specified week
				const eventsForWeek = localEvents.filter((event) => {
					const startTime = event.start_time.valueOf(); // Assuming start_time is a Date object
					return startTime >= startOfWeek && startTime <= endOfWeek;
				});

				return eventsForWeek;
			}
		},
		enabled: options?.enabled,
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
				return { ...newEvent, event_id: "local-" + Crypto.randomUUID() } as Event;
			}
		},
		onMutate: async ({ newEvent, calendar_id }) => {
			options?.onMutate?.({ newEvent, calendar_id });
			await queryClient.cancelQueries({ queryKey: ["events", calendar_id] });
			const previousEvents = queryClient.getQueryData<Event[]>(["events", calendar_id]) || [];

			const tempId = "local-" + Crypto.randomUUID();
			const optimisticEvent: Event = {
				...newEvent,
				event_id: tempId,
			} as Event;

			queryClient.setQueryData<Event[]>(["events", calendar_id], (old) => [...(old || []), optimisticEvent]);

			const scheduledNotificationIds = await scheduleEventNotifications(optimisticEvent);
			await insertEventIntoDB(optimisticEvent, user.user_id);
			await updateEventNotificationIds(optimisticEvent.event_id, scheduledNotificationIds);
			if (!isConnected && user.user_id !== "localUser") {
				addMutationToQueue("CREATE_EVENT", newEvent, { eventId: tempId, calendarId: calendar_id });
			}
			return { previousEvents, tempId };
		},
		onError: (err, { newEvent, calendar_id }, context) => {
			options?.onError?.(err, { newEvent, calendar_id }, context);
			if (process.env.SHOW_LOGS == 'true') {
				console.error("Error creating event:", err);
			}
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
					if (process.env.SHOW_LOGS == 'true') {
						console.error("Error syncing event to server:", error);
					}
				}
			}
			await queryClient.invalidateQueries({ queryKey: ["events"] });
			await queryClient.invalidateQueries({ queryKey: ["events", "day", variables.newEvent.start_time.toISODate()] });
			if (variables.newEvent.start_time.toISODate() !== variables.newEvent.end_time.toISODate()) {
				await queryClient.invalidateQueries({ queryKey: ["events", "day", variables.newEvent.end_time.toISODate()] });
			}
		},
	});
};

export const useUpdateEvent = (
	options?: UseMutationOptions<
		Event,
		Error,
		{ updatedEvent: Event; calendar_id: string },
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
		mutationFn: async ({ updatedEvent, calendar_id }: { updatedEvent: Event; calendar_id: string }) => {
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

			const scheduledNotificationIds = await scheduleEventNotifications(updatedEvent);

			await updateEventInDB(updatedEvent.event_id, updatedEvent, user.user_id);
			if (scheduledNotificationIds.length > 0) {
				await updateEventNotificationIds(updatedEvent.event_id, scheduledNotificationIds);
			}
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
			if (process.env.SHOW_LOGS == 'true') {
				console.error("Error updating event:", err);
			}
			queryClient.setQueryData<Event[]>(["events", calendar_id], context?.previousEvents);
		},
		onSuccess: (data, variables, context) => {
			options?.onSuccess?.(data, variables, context);
			// Boom baby!
		},
		onSettled: async (data, error, { updatedEvent, calendar_id }, context) => {
			options?.onSettled?.(data, error, { updatedEvent, calendar_id }, context);
			await queryClient.invalidateQueries({ queryKey: ["events"] });
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

			await cancelScheduledEventNotifications(event_id)

			await deleteEventFromDB(event_id);
			if (!isConnected && user.user_id !== "localUser") {
				await addMutationToQueue("DELETE_EVENT", event_id, { eventId: event_id });
			}

			return { previousEvents, startTime: localEvent.start_time, endTime: localEvent.end_time };
		},
		onError: (err, { event_id, calendar_id }, context) => {
			options?.onError?.(err, { event_id, calendar_id }, context);
			if (process.env.SHOW_LOGS == 'true') {
				console.error("Error deleting event:", err);
			}
			queryClient.setQueryData<Event[]>(["events", calendar_id], context?.previousEvents);
		},
		onSuccess: (data, variables, context) => {
			options?.onSuccess?.(data, variables, context);
			// Boom baby!
		},
		onSettled: async (data, error, { event_id, calendar_id }, context) => {
			options?.onSettled?.(data, error, { event_id, calendar_id }, context);
			await queryClient.invalidateQueries({ queryKey: ["events"] });
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


export const usePruneOldEvents = (
	options?: UseMutationOptions<void, Error, { pruneBefore: DateTime }, void>
) => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	const { user, sessionId } = useSession();
	if (!user || !sessionId) {
		throw new Error("User not found or session not found");
	}

	return useMutation({
		mutationFn: async ({pruneBefore} : {pruneBefore:DateTime}) => {
			if (isConnected && user.user_id !== "localUser") {
				await deleteEventsUntilNowOnServer();
			}
			await deleteEventsUntilFromDB(pruneBefore, user.user_id);
			return
		},
		onSuccess: (data, variables) => {
			options?.onSuccess?.(data, variables);
			// Boom baby!
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: ["events"] });
			await queryClient.invalidateQueries({ queryKey: ["event"] });
		},
	});
};


// event image hook
export const useEventImage = () => {
	const { user, sessionId } = useSession();
	const queryClient = useQueryClient();

	const uploadPicture = useMutation({
		mutationFn: async (uri: string) => {
			if (!user || !sessionId) {
				throw new Error("User not authenticated");
			}
	
			const formData = new FormData();
			const fileInfo = await FileSystem.getInfoAsync(uri);
			
			if (!fileInfo.exists) {
				throw new Error('Selected file does not exist');
			}
	
			formData.append('file', {
				uri,
				name: `event_${user.user_id}.png`, // change later?
				type: 'image/png',
			} as any);
	
			// create headers with cookie
			const headers = new Headers();
			headers.append('Accept', 'application/json');
			headers.append('Authorization', `Bearer ${sessionId}`); 
			headers.append('Cookie', `sessionId=${sessionId}`);
			console.log('Event image request headers:', Object.fromEntries(headers.entries()));
	
			const response = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/files/uploadFile`, {
				method: 'POST',
				body: formData,
				headers,
				credentials: 'include'
			});

			console.log('Event image upload response status=', response.status);
			let fileKey;
			try {
			const jsonResponse = await response.json();
			fileKey = typeof jsonResponse === 'string' 
				? jsonResponse.replace(/^"|"$/g, '') // Remove surrounding quotes if present
				: jsonResponse.key || jsonResponse;
			} catch {
			fileKey = (await response.text()).trim().replace(/^"|"$/g, '');
			}

			// const responseData = await response.json();
			console.log('Event image upload response body (fileKey)=', fileKey);
	
			if (!response.ok) {
				throw new Error(`Upload failed: ${response.status} --- ${JSON.stringify(fileKey)}`);
			}

			const fileExtension = uri.split('.').pop()?.toLowerCase();

			return {
				key: fileKey,
				filename: fileKey.includes('.') ? fileKey : `${fileKey}`
			};
		},
		onSuccess: async (response) => {
			// // update local user data in SecureStore
			// const userString = await SecureStore.getItemAsync('user');
			// if (userString) {
			// 	const currentUser = JSON.parse(userString);
			// 	const updatedUser = {
			// 		...currentUser,
			// 		profile_picture: response.key // key from upload response
			// 	};
			// 	await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
				
			// 	// refresh the user data
			// 	queryClient.invalidateQueries({ queryKey: ['loginData'] });
			// }
		},
		onError: (error) => {
			console.error('Event image upload failed:', error);
		}
	});

	const deletePicture = useMutation({
		mutationFn: async ({ calendar_id, event_id }: { calendar_id: string; event_id: string }) => {
			if (!user?.profile_picture) {
				return;
			}

			const headers = new Headers();
			headers.append('Accept', 'application/json');
			headers.append('Authorization', `Bearer ${sessionId}`); 
			headers.append('Cookie', `sessionId=${sessionId}`);
			console.log('Event image request headers:', Object.fromEntries(headers.entries()));

			const response = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/files/deleteEventImage/${calendar_id}/${event_id}`, {
				method: 'DELETE',
				headers,
				credentials: 'include'
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || 'Deletion failed');
			}
		},
		onSuccess: () => {
			// update user's profile picture in local state
			queryClient.setQueryData(['user', user?.user_id], (old: any) => ({
				...old,
				profile_picture: null
			}));
		},
		onError: (error: Error) => {
			console.error("Profile picture deletion failed:", error.message);
		}
	});

	const pickImage = async () => {
		const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (!permissionResult.granted) {
			throw new Error("Permission to access photos is required");
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (result.canceled || !result.assets?.[0]?.uri) {
			throw new Error("No image selected");
		}

		return result.assets[0].uri;
	};

	console.log("CURRENT USER OBJECT:", user);
	return {
		uploadPicture,
		deletePicture,
		pickImage,
		eventImageUrl: user?.profile_picture 
		? `${process.env.EXPO_PUBLIC_S3_URL}/${user.profile_picture}`
		: null
	};
};