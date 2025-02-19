import { DateTime } from "luxon";
import React from "react";

export const DayBeingViewedContext = React.createContext({
	value: DateTime.now() as DateTime<true>,
	setValue: (_value: DateTime) => {
		console.log("DayBeingViewedContext.setValue not implemented");
	},
});

export function useCurrentViewedDay() {
	const value = React.useContext(DayBeingViewedContext);
	if (process.env.NODE_ENV !== "production") {
		if (!value) {
			throw new Error("useCurrentViewedDay must be wrapped in a <DayBeingViewedProvider />");
		}
	}
	return {
		setDayBeingViewed: value.setValue,
		dayBeingViewed: value.value,
	};
}
