import { DateTime } from "luxon";
import React from "react";

export const CurrentViewContext = React.createContext<{
    value: "month" | "week" | "day";
    setValue: (value: "month" | "week" | "day") => void;
}>({
    value: "month",
    setValue: (_value: "month" | "week" | "day") => {
        console.log("CurrentViewContext.setValue not implemented");
    },
});
export const DayBeingViewedContext = React.createContext({
    value: DateTime.now(),
    setValue: (_value: DateTime) => {
        console.log("DayBeingViewedContext.setValue not implemented");
    },
});
