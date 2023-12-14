// create a hook that returns DateTime.now().startOf("day") when called

import { DateTime } from "luxon";

export const useToday = () => {
    return DateTime.now().startOf("day");
};
