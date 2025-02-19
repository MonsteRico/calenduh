import { DateTime } from "luxon";
import React from "react";
import { setEnabled } from "react-native/Libraries/Performance/Systrace";

export const EnabledCalendarIdsContext = React.createContext({
	value: [] as string[],
	setValue: (_value: string[]) => {
		console.log("EnabledCalendarIdsContext.setValue not implemented");
	},
});

export function useEnabledCalendarIds() {
	const value = React.useContext(EnabledCalendarIdsContext);
	if (process.env.NODE_ENV !== "production") {
		if (!value) {
			throw new Error("useEnabledCalendarIds must be wrapped in a <EnabledCalendarIdsProvider />");
		}
	}

	return {
        setEnabledCalendarIds: value.setValue,
        enabledCalendarIds: value.value,
    };
}