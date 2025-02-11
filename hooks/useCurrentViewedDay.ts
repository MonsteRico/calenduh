import { DateTime } from "luxon";
import React from "react";

export const DayBeingViewedContext = React.createContext({
	value: DateTime.now() as DateTime<true>,
	setValue: (_value: DateTime) => {
		console.log("DayBeingViewedContext.setValue not implemented");
	},
});

export function useCurrentViewedDay() {
	return React.useContext(DayBeingViewedContext);
}
