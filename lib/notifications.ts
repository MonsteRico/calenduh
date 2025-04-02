import { Event, UpdateEvent } from "@/types/event.types";
import * as Notifications from "expo-notifications";
import { getEventFromDB } from "./event.helpers";
import { getCalendarFromDB } from "./calendar.helpers";
import { DateTime, Duration, Interval } from "luxon";
import { NotificationTimes } from "@/constants/notificationTimes";
export async function scheduleEventNotifications(event: Event) {
	await cancelScheduledEventNotifications(event.event_id);

	let firstNotificationId = null;
	let secondNotificationId = null;

	const calendar = await getCalendarFromDB(event.calendar_id);

	if (!calendar) {
		throw new Error("How the hell does an event not have a calendar");
	}

	if (event.first_notification !== undefined && event.first_notification !== null) {
		const notificationDate = event.start_time.minus(event.first_notification);
		if (notificationDate > DateTime.now()) {
			let durationString = "Event starting now";
			if (event.first_notification > NotificationTimes.TIME_OF_EVENT) {
				const duration = Duration.fromMillis(event.first_notification);
				durationString = `In ${duration.toFormat("m")} minutes`;
			}
			if (event.first_notification >= NotificationTimes.ONE_HOUR_MS) {
				const duration = Duration.fromMillis(event.first_notification);
				durationString = `In ${duration.toFormat("h")} hour${duration.hours > 1 ? "s" : ""}`;
			}
			if (event.first_notification >= NotificationTimes.ONE_DAY_MS) {
				const duration = Duration.fromMillis(event.first_notification);
				durationString = `In ${duration.toFormat("d")} day${duration.days > 1 ? "s" : ""}`;
			}
			firstNotificationId = await Notifications.scheduleNotificationAsync({
				content: {
					title: `${event.name}`,
					body: `${durationString} at ${event.start_time.toFormat("t")}. From Calendar ${calendar.title}`,
				},
				trigger: {
					type: Notifications.SchedulableTriggerInputTypes.DATE,
					date: notificationDate.toJSDate(),
				},
			});

			console.log("First Notification Id:", firstNotificationId);
		}
	}
	if (event.second_notification !== undefined && event.second_notification !== null) {
		const notificationDate = event.start_time.minus(event.second_notification);
		if (notificationDate > DateTime.now()) {
			let durationString = "Event starting now";
			if (event.second_notification > NotificationTimes.TIME_OF_EVENT) {
				const duration = Duration.fromMillis(event.second_notification);
				durationString = `In ${duration.toFormat("m")} minutes`;
			}
			if (event.second_notification >= NotificationTimes.ONE_HOUR_MS) {
				const duration = Duration.fromMillis(event.second_notification);
				durationString = `In ${duration.toFormat("h")} hour${duration.hours > 1 ? "s" : ""}`;
			}
			if (event.second_notification >= NotificationTimes.ONE_DAY_MS) {
				const duration = Duration.fromMillis(event.second_notification);
				durationString = `In ${duration.toFormat("d")} day${duration.days > 1 ? "s" : ""}`;
			}
			secondNotificationId = await Notifications.scheduleNotificationAsync({
				content: {
					title: `${event.name}`,
					body: `${durationString} at ${event.start_time.toFormat("t")}. From Calendar ${calendar.title}`,
				},
				trigger: {
					type: Notifications.SchedulableTriggerInputTypes.DATE,
					date: notificationDate.toJSDate(),
				},
			});
			console.log("Second notification id:", secondNotificationId);
		}
	}
	return [firstNotificationId, secondNotificationId].filter((id) => id != null);
}

export async function cancelScheduledEventNotifications(eventId: string) {
	const event = await getEventFromDB(eventId);

	if (!event) {
		return;
	}

	if (event.firstNotificationId) {
		await Notifications.cancelScheduledNotificationAsync(event.firstNotificationId);
	}
	if (event.secondNotificationId) {
		await Notifications.cancelScheduledNotificationAsync(event.secondNotificationId);
	}
}
