import type { DateTime } from "luxon";
import { useContext } from "react";
import { DayBeingViewedContext } from "~/hooks/contexts";
import { useToday } from "~/hooks/useToday";

export function Day({
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
      className={`h-32 border-l-4 border-t-4 border-black ${
        dayIsSaturday && "border-r-4"
      } ${bottomRow && "border-b-4"} ${
        currentMonth ? "text-black" : "font-bold text-red-600"
      } ${isToday && "bg-blue-300"}`}
    >
      <h2 className="absolute">{dayNumber}</h2>
    </div>
  );
}
