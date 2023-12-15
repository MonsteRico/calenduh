// create a hook that returns DateTime.now().startOf("day") when called

import { DateTime, Interval } from "luxon";

export const useToday = () => {
    return DateTime.now().startOf("day");
};
