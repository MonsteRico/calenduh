import { DateTime } from "luxon";
import React from "react";

export const CurrentViewContext = React.createContext<string>("month");
export const DayBeingViewedContext = React.createContext({
  value: DateTime.now(),
  setValue: (_value: DateTime) => {
    console.log("DayBeingViewedContext.setValue not implemented");
  },
});
