import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useIsConnected } from "@/hooks/useIsConnected"; // Adjust path
import { Calendar, CalendarUpsert } from "@/types/calendar.types";
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

// --- Queries ---

export const useCalendars = () => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	return useQuery<Calendar[], Error>({
		queryKey: ["calendars"],
		queryFn: async () => {
			console.log("calendars");
			const localCalendars = await getCalendarsFromDB();
			console.log("local calendars", localCalendars);
			if (isConnected) {
				try {
					console.log("connected");
					const serverCalendars = await getCalendarsFromServer();

					for (const calendar of serverCalendars) {
						await upsertCalendarIntoDB(calendar);
					}

					// queryClient.invalidateQueries({ queryKey: ["calendars"] });
					return serverCalendars;
				} catch (error) {
					console.error("Error fetching calendars from server:", error);
					return localCalendars;
				}
			} else {
				return localCalendars;
			}
		},
	});
};

export const useCalendar = (calendar_id: string) => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	return useQuery<Calendar, Error>({
		queryKey: ["calendars", calendar_id],
		queryFn: async () => {
			if (isConnected) {
				try {
					const serverCalendar = await getCalendarFromServer(calendar_id);
					if (!serverCalendar) {
						throw new Error("Calendar not found on server");
					}
					await updateCalendarInDB(serverCalendar);
					queryClient.invalidateQueries({ queryKey: ["calendars", calendar_id] });
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

	return useQuery<Calendar[], Error>({
		queryKey: ["myCalendars"],
		queryFn: async () => {
			console.log("my calendars");
			console.log(isConnected);
			if (isConnected) {
				try {
					console.log("connected");
					const serverCalendars = await getMyCalendarsFromServer();
					// Update local DB (you might need to clear existing and insert)
					// queryClient.invalidateQueries({ queryKey: ["myCalendars"] });
					return serverCalendars;
				} catch (error) {
					console.error("Error fetching my calendars from server:", error);
					console.log("not connected");
					return []; // Or handle error as needed
				}
			} else {
				console.log("not connected");
				return []; // Or get from local DB if you store "my" calendars separately
			}
		},
	});
};

export const useSubscribedCalendars = () => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	return useQuery<Calendar[], Error>({
		queryKey: ["subscribedCalendars"],
		queryFn: async () => {
			if (isConnected) {
				try {
					const serverCalendars = await getSubscribedCalendarsFromServer();
					// Update local DB
					queryClient.invalidateQueries({ queryKey: ["subscribedCalendars"] });
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

export const useCreateCalendar = () => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	return useMutation<Calendar, Error, Omit<Calendar, "calendar_id">, { previousCalendars: Calendar[]; tempId: string }>(
		{
			mutationFn: async (newCalendar: Omit<Calendar, "calendar_id">) => {
				if (isConnected) {
					return await createCalendarOnServer(newCalendar);
				} else {
					// Optimistic update only, server sync will happen later
					return { ...newCalendar, calendar_id: Date.now().toString() }; // Generate a temporary ID
				}
			},
			onMutate: async (newCalendar) => {
				await queryClient.cancelQueries({ queryKey: ["calendars"] });
				const previousCalendars = queryClient.getQueryData<Calendar[]>(["calendars"]) || [];

				const tempId = Date.now().toString();
				const optimisticCalendar: Calendar = {
					...newCalendar,
					calendar_id: tempId,
				};

				queryClient.setQueryData<Calendar[]>(["calendars"], (old) => [...(old || []), optimisticCalendar]);

				await insertCalendarIntoDB(optimisticCalendar);

				return { previousCalendars, tempId };
			},
			onError: (err, newCalendar, context) => {
				console.error("Error creating calendar:", err);
				queryClient.setQueryData<Calendar[]>(["calendars"], context?.previousCalendars);
			},
			onSuccess: (data, variables, context) => {
				// Boom baby!
			},
			onSettled: async (newCalendar, error, variables, context) => {
				if (isConnected && newCalendar && context?.tempId) {
					try {
						const serverCalendar = await createCalendarOnServer(variables);
						await updateCalendarInDB(serverCalendar);
						queryClient.setQueryData<Calendar[]>(["calendars"], (old) =>
							old?.map((calendar) => (calendar.calendar_id === context.tempId ? serverCalendar : calendar))
						);
					} catch (error) {
						console.error("Error syncing calendar to server:", error);
					}
				}
				await queryClient.invalidateQueries({ queryKey: ["calendars"] });
			},
		}
	);
};

export const useUpdateCalendar = () => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();

	return useMutation<Calendar, Error, Calendar, { previousCalendars: Calendar[] }>({
		mutationFn: async (updatedCalendar: Calendar) => {
			if (isConnected) {
				return await updateCalendarOnServer(updatedCalendar);
			} else {
				return updatedCalendar;
			}
		},
		onMutate: async (updatedCalendar) => {
			await queryClient.cancelQueries({ queryKey: ["calendars"] });
			const previousCalendars = queryClient.getQueryData<Calendar[]>(["calendars"]) || [];

			queryClient.setQueryData<Calendar[]>(["calendars"], (old) =>
				old?.map((calendar) => (calendar.calendar_id === updatedCalendar.calendar_id ? updatedCalendar : calendar))
			);

			await updateCalendarInDB(updatedCalendar);

			return { previousCalendars };
		},
		onError: (err, updatedCalendar, context) => {
			console.error("Error updating calendar:", err);
			queryClient.setQueryData<Calendar[]>(["calendars"], context?.previousCalendars);
		},
		onSuccess: (data, variables, context) => {
			// Boom baby!
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: ["calendars"] });
		},
	});
};

export const useDeleteCalendar = () => {
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
			await queryClient.cancelQueries({ queryKey: ["calendars"] });
			const previousCalendars = queryClient.getQueryData<Calendar[]>(["calendars"]) || [];

			queryClient.setQueryData<Calendar[]>(["calendars"], (old) =>
				old?.filter((calendar) => calendar.calendar_id !== calendar_id)
			);

			await deleteCalendarFromDB(calendar_id);

			return { previousCalendars };
		},
		onError: (err, calendar_id, context) => {
			console.error("Error deleting calendar:", err);
			queryClient.setQueryData<Calendar[]>(["calendars"], context?.previousCalendars);
		},
		onSuccess: (data, variables, context) => {
			// Boom baby!
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: ["calendars"] });
		},
	});
};