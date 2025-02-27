import { useQuery, useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { useIsConnected } from "@/hooks/useIsConnected"; // Adjust path
import { Calendar, CalendarUpsert, UpdateCalendar } from "@/types/calendar.types";
import {
	getCalendarsFromDB,
	getCalendarsFromServer,
	getCalendarFromServer,
	getMyCalendarsFromServer,
	getSubscribedCalendarsFromServer,
	insertCalendarIntoDB,
	updateCalendarInDB,
	deleteCalendarFromDB,
	createCalendarOnServer,
	updateCalendarOnServer,
	deleteCalendarOnServer,
	getCalendarFromDB,
	upsertCalendarIntoDB,
} from "@/lib/calendar.helpers";
import { addMutationToQueue, getMutationsFromDB } from "@/lib/mutation.helpers";
import { useSession } from "./authContext";
import { useEnabledCalendarIds } from "./useEnabledCalendarIds";

// --- Queries ---

export const useCalendars = () => {
	const isConnected = useIsConnected();

	return useQuery<Calendar[], Error>({
		queryKey: ["all_calendars"],
		queryFn: async () => {
			if (isConnected) {
				try {
					const serverCalendars = await getCalendarsFromServer();

					return serverCalendars;
				} catch (error) {
					console.error("Error fetching calendars from server:", error);
					return [];
				}
			} else {
				console.error("You are offline, cannot fetch the calendars from the server");
				return [];
			}
		},
	});
};

export const useCalendar = (calendar_id: string) => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	const { user } = useSession();
	if (!user) {
		throw new Error("User not found");
	}

	return useQuery<Calendar, Error>({
		queryKey: ["calendars", calendar_id],
		queryFn: async () => {
			if (isConnected) {
				try {
					const serverCalendar = await getCalendarFromServer(calendar_id);
					if (!serverCalendar) {
						throw new Error("Calendar not found on server");
					}
					await updateCalendarInDB(serverCalendar.calendar_id, serverCalendar, user.user_id);
					return serverCalendar;
				} catch (error) {
					console.error(`Error fetching calendar ${calendar_id} from server:`, error);
					const localCalendar = await getCalendarFromDB(calendar_id);
					if (localCalendar) {
						return localCalendar;
					} else {
						throw new Error("Calendar not found locally or on server");
					}
				}
			} else {
				const localCalendar = await getCalendarFromDB(calendar_id);
				if (localCalendar) {
					return localCalendar;
				} else {
					throw new Error("Calendar not found locally");
				}
			}
		},
	});
};

export const useMyCalendars = () => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	const { user } = useSession();
	if (!user) {
		throw new Error("User not found");
	}

	return useQuery<Calendar[], Error>({
		queryKey: ["calendars"],
		queryFn: async () => {
			const localCalendars = await getCalendarsFromDB();
			if (isConnected) {
				try {
					const serverCalendars = await getMyCalendarsFromServer();
					const mutations = await getMutationsFromDB(); // Get the mutations that happened offline since last sync
					const deletedCalendarIds = mutations // Pull out any calendar ids that were deleted while offline
						.filter((mutation) => mutation.mutation === "DELETE_CALENDAR")
						.map((mutation) => mutation.calendar_id);
					for (const calendar of serverCalendars) {
						// We only upsert calendars that are actually new in the server, so we dont upsert calendars that were deleted offline before they get deleted on the server
						if (!deletedCalendarIds.includes(calendar.calendar_id)) {
							await upsertCalendarIntoDB(calendar, user.user_id);
						}
					}

					return serverCalendars.filter((calendar) => !deletedCalendarIds.includes(calendar.calendar_id)); // Remove any calendars that were deleted offline before they get deleted on the server
				} catch (error) {
					console.error("Error fetching calendars from server:", error);
					return localCalendars;
				}
			} else {
				console.log("You are offline, cannot fetch the calendars from the server");
				return localCalendars;
			}
		},
	});
};

export const useSubscribedCalendars = () => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	const { user } = useSession();
	if (!user) {
		throw new Error("User not found");
	}

	return useQuery<Calendar[], Error>({
		queryKey: ["subscribedCalendars"],
		queryFn: async () => {
			if (isConnected) {
				try {
					const serverCalendars = await getSubscribedCalendarsFromServer();
					// Update local DB
					return serverCalendars;
				} catch (error) {
					console.error("Error fetching subscribed calendars from server:", error);
					return []; // Or handle error as needed
				}
			} else {
				return []; // Or get from local DB
			}
		},
	});
};

// --- Mutations --- (No changes needed in mutations)

export const useCreateCalendar = (
	options?: UseMutationOptions<
		Calendar,
		Error,
		Omit<Calendar, "calendar_id">,
		{ previousCalendars: Calendar[]; tempId: string }
	>
) => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();
	const {enabledCalendarIds, setEnabledCalendarIds} = useEnabledCalendarIds();
	const { user } = useSession();
	if (!user) {
		throw new Error("User not found");
	}
	console.log("user", user);

	return useMutation<Calendar, Error, Omit<Calendar, "calendar_id">, { previousCalendars: Calendar[]; tempId: string }>(
		{
			mutationFn: async (newCalendar: Omit<Calendar, "calendar_id">) => {
				if (isConnected) {
					console.log("creating calendar on server");
					return await createCalendarOnServer(newCalendar);
				} else {
					// Optimistic update only, server sync will happen later
					return { ...newCalendar, calendar_id: Date.now().toString() }; // Generate a temporary ID
				}
			},
			onMutate: async (newCalendar) => {
				options?.onMutate?.(newCalendar);
				console.log("mutate");
				await queryClient.cancelQueries({ queryKey: ["calendars"] });
				const previousCalendars = queryClient.getQueryData<Calendar[]>(["calendars"]) || [];

				const tempId = Date.now().toString();
				const optimisticCalendar: Calendar = {
					...newCalendar,
					calendar_id: tempId,
				};

				setEnabledCalendarIds([...enabledCalendarIds, tempId]);

				queryClient.setQueryData<Calendar[]>(["calendars"], (old) => [...(old || []), optimisticCalendar]);

				await insertCalendarIntoDB(optimisticCalendar, user.user_id);
				if (!isConnected) {
					addMutationToQueue("CREATE_CALENDAR", newCalendar, { calendarId: tempId });
				}
				return { previousCalendars, tempId };
			},
			onError: (err, newCalendar, context) => {
				console.error("Error creating calendar:", err);
				queryClient.setQueryData<Calendar[]>(["calendars"], context?.previousCalendars);
				options?.onError?.(err, newCalendar, context);
			},
			onSuccess: (data, variables, context) => {
				console.log("success");
				options?.onSuccess?.(data, variables, context);
				// Boom baby!
			},
			onSettled: async (newCalendar, error, variables, context) => {
				options?.onSettled?.(newCalendar, error, variables, context);
				console.log("settled");
				if (isConnected && newCalendar && context?.tempId && !error) {
					try {
						console.log(context);
						await updateCalendarInDB(context.tempId, newCalendar, user.user_id);
						setEnabledCalendarIds([...enabledCalendarIds, newCalendar.calendar_id]);
					} catch (error) {
						console.error("Error syncing calendar to server:", error);
					}
				}
				await queryClient.invalidateQueries({ queryKey: ["calendars"] });
				
			},
		}
	);
};

export const useUpdateCalendar = (
	options?: UseMutationOptions<UpdateCalendar, Error, UpdateCalendar, { previousCalendars: Calendar[] }>
) => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	const { user } = useSession();
	if (!user) {
		throw new Error("User not found");
	}

	return useMutation({
		mutationFn: async (updatedCalendar: UpdateCalendar) => {
			if (isConnected) {
				return await updateCalendarOnServer(updatedCalendar);
			} else {
				return updatedCalendar;
			}
		},
		onMutate: async (updatedCalendar) => {
			options?.onMutate?.(updatedCalendar);
			await queryClient.cancelQueries({ queryKey: ["calendars"] });
			const previousCalendars = queryClient.getQueryData<Calendar[]>(["calendars"]) || [];

			queryClient.setQueryData<Calendar[]>(["calendars"], (old) =>
				old?.map((calendar) =>
					calendar.calendar_id === updatedCalendar.calendar_id ? { ...calendar, ...updatedCalendar } : calendar
				)
			);

			await updateCalendarInDB(updatedCalendar.calendar_id, updatedCalendar, user.user_id);
			if (!isConnected) {
				await addMutationToQueue("UPDATE_CALENDAR", updatedCalendar, { calendarId: updatedCalendar.calendar_id });
			}
			return { previousCalendars };
		},
		onError: (err, updatedCalendar, context) => {
			options?.onError?.(err, updatedCalendar, context);
			console.error("Error updating calendar:", err);
			queryClient.setQueryData<Calendar[]>(["calendars"], context?.previousCalendars);
		},
		onSuccess: (data, variables, context) => {
			options?.onSuccess?.(data, variables, context);
			// Boom baby!
		},
		onSettled: async (data, error, variables, context) => {
			options?.onSettled?.(data, error, variables, context);
			await queryClient.invalidateQueries({ queryKey: ["calendars"] });
		},
	});
};

export const useDeleteCalendar = (
	options?: UseMutationOptions<void, Error, string, { previousCalendars: Calendar[] }>
) => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	return useMutation<void, Error, string, { previousCalendars: Calendar[] }>({
		mutationFn: async (calendar_id: string) => {
			if (isConnected) {
				return await deleteCalendarOnServer(calendar_id);
			} else {
				return;
			}
		},
		onMutate: async (calendar_id) => {
			options?.onMutate?.(calendar_id);
			await queryClient.cancelQueries({ queryKey: ["calendars"] });
			const previousCalendars = queryClient.getQueryData<Calendar[]>(["calendars"]) || [];

			queryClient.setQueryData<Calendar[]>(["calendars"], (old) =>
				old?.filter((calendar) => calendar.calendar_id !== calendar_id)
			);

			await deleteCalendarFromDB(calendar_id);
			if (!isConnected) {
				await addMutationToQueue("DELETE_CALENDAR", calendar_id, { calendarId: calendar_id });
			}
			return { previousCalendars };
		},
		onError: (err, calendar_id, context) => {
			options?.onError?.(err, calendar_id, context);
			console.error("Error deleting calendar:", err);
			queryClient.setQueryData<Calendar[]>(["calendars"], context?.previousCalendars);
		},
		onSuccess: (data, variables, context) => {
			options?.onSuccess?.(data, variables, context);
			// Boom baby!
		},
		onSettled: async (data, error, calendar_id, context) => {
			options?.onSettled?.(data, error, calendar_id, context);
			await queryClient.invalidateQueries({ queryKey: ["calendars"] });
			await queryClient.invalidateQueries({ queryKey: ["calendar", calendar_id] });
		},
	});
};
