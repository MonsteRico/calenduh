import { DateTime } from "luxon";
import React, { useContext } from "react";
import { useToday } from "~/hooks/useToday";

import { DayBeingViewedContext } from "~/hooks/contexts";

export default function WeekView() {
  const today = useToday();
  const { value: dayBeingViewed, setValue: setDayBeingViewed } = useContext(
    DayBeingViewedContext,
  );

  const startOfWeek = dayBeingViewed.startOf("week").minus({ day: 1 });
  const days = Array.from({ length: 7 }, (_, i) =>
    startOfWeek.plus({ day: i }),
  );

  const hours = [
    "All-Day",
    ...Array.from({ length: 24 }, (_, i) =>
      DateTime.fromObject({ hour: i }).toLocaleString(DateTime.TIME_SIMPLE),
    ),
  ];

  return (
    <div className="flex flex-col">
      <section className="sticky top-16 flex w-full flex-row">
        <div
          className={`text-muted-foreground bg-background flex w-24 items-end text-center`}
        >
          <h2 className="mb-1 mr-4 w-full text-right">All Day</h2>
        </div>
        <div className="bg-background grid w-full grid-cols-7 pt-1 ">
          {days.map((day, i) => {
            return (
              <div key={i} className="flex flex-col">
                <div className="mb-2 flex flex-grow flex-row gap-3">
                  <h2 className="text-center text-2xl">{day.day}</h2>
                  <h2 className="text-muted-foreground my-auto text-center text-xl">
                    {day.weekdayLong}
                  </h2>
                </div>
                <div className="h-8">
                  <h4 className="py-2 text-center text-sm">An All-Day Event</h4>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <section className="flex flex-row">
        <div className="flex flex-col">
          {Array.from({ length: 24 }, (_, i) => {
            if (i == 0)
              return (
                <div key={i}>
                  <h2 className="mr-4"></h2>
                </div>
              );
            return (
              <div
                className={`text-muted-foreground flex h-24 w-24 justify-end`}
                key={i}
              >
                <h2 className="my-auto mr-4">{hours[i + 1]}</h2>
              </div>
            );
          })}
        </div>
        <div className="flex w-full flex-col">
          <div className="grid grid-cols-7">
            {days.map((day, i) => (
              <DaysHours day={day} key={day.toISO()} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function DaysHours({
  day,
  bottomRow = false,
}: {
  day: DateTime<true>;
  bottomRow?: boolean;
}) {
  const today = useToday();
  const dayNumber = day.day;
  const { value: dayBeingViewed } = useContext(DayBeingViewedContext);
  const currentMonth = dayBeingViewed.month == day.month;
  const dayIsSaturday = day.weekday === 6;
  const isToday = day.hasSame(today, "day");
  return (
    <div
      className={`${dayIsSaturday && "border-r-4"} ${
        bottomRow && "border-b-4"
      } ${currentMonth ? "text-primary" : "text-muted font-bold"} ${
        isToday && "bg-blue-800 bg-opacity-50"
      }`}
    >
      {Array.from({ length: 48 }, (_, i) => {
        return (
          <div
            className={`text-muted-foreground border     ${
              i % 2 == 0 ? "border-t-4" : "border-t-1"
            } h-12`}
            key={i}
          ></div>
        );
      })}
    </div>
  );
}
