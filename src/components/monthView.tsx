import type { DateTime } from "luxon";
import React, { useContext, useState } from "react";
import { useToday } from "~/hooks/useToday";

import { Day } from "./day";
import { DayBeingViewedContext } from "~/hooks/contexts";

export default function MonthView() {
  const today = useToday();
  const { value: dayBeingViewed, setValue: setDayBeingViewed } = useContext(
    DayBeingViewedContext,
  );

  const daysBeforeFirst = dayBeingViewed.set({ day: 1 }).weekday;
  const daysAfterLast =
    13 - dayBeingViewed.set({ day: dayBeingViewed.daysInMonth }).weekday;
  const daysInPreviousMonth = dayBeingViewed.minus({ month: 1 }).daysInMonth;
  const daysInNextMonth = dayBeingViewed.plus({ month: 1 }).daysInMonth;

  // make an array of all the days shown in the current view
  const days = Array.from({ length: daysInPreviousMonth }, (_, i) =>
    dayBeingViewed
      .minus({ month: 1 })
      .startOf("day")
      .set({ day: i + 1 }),
  )
    .slice(-daysBeforeFirst)
    .concat(
      Array.from({ length: dayBeingViewed.daysInMonth }, (_, i) =>
        dayBeingViewed.startOf("day").set({ day: i + 1 }),
      ),
    )
    .concat(
      Array.from({ length: daysInNextMonth }, (_, i) =>
        dayBeingViewed
          .plus({ month: 1 })
          .startOf("day")
          .set({ day: i + 1 }),
      ).slice(0, daysAfterLast),
    )
    .slice(0, 42);

  return (
    <main className="flex flex-col">
      <div className="flex flex-row justify-center gap-8">
        <h2
          onClick={() => {
            setDayBeingViewed(dayBeingViewed.minus({ month: 1 }));
          }}
          className="cursor-pointer"
        >
          {"<"}
        </h2>
        <h2>
          {dayBeingViewed.monthLong} {dayBeingViewed.year}
        </h2>
        <h2
          onClick={() => {
            setDayBeingViewed(dayBeingViewed.plus({ month: 1 }));
          }}
          className="cursor-pointer"
        >
          {">"}
        </h2>
        <h2
          onClick={() => {
            setDayBeingViewed(today);
          }}
          className="cursor-pointer underline"
        >
          Today
        </h2>
      </div>
      <div className="grid grid-cols-7">
        <h2 className="">Sunday</h2>
        <h2 className="">Monday</h2>
        <h2 className="">Tuesday</h2>
        <h2 className="">Wednesday</h2>
        <h2 className="">Thursday</h2>
        <h2 className="">Friday</h2>
        <h2 className="">Saturday</h2>
      </div>
      <div className="grid grid-cols-7 grid-rows-6">
        {days.map((day, i) => (
          <Day bottomRow={Math.floor(i / 7) == 5} day={day} key={day.toISO()} />
        ))}
      </div>
    </main>
  );
}
