TODO

-   fix styling for time inputs
-   unify and fix top bar
-   day view
-   make sure you cant disable a default calendar

-   users

    -   users are attached to calendars they create AND events they create
    -   default calendar
    -   change every GET to first filter based on calendars the user has attached to them

-   mobile friendlyfy

    -   PWA stuff
    -   fallback page for no internet

-   notifications for events coming up

-   user preferences

    -   theme settings (for all colors? not just light/dark?)
    -   start on today or start on last day viewed
    -   default calendar for new events
    -   keep track of the last view you were on and automatically load into that view
        -   similarly, keep track of the last _day_ you were viewing and automatically pull that day up

-   export as iCal? import from iCal?
-   subscribe to iCal?
    -   importing from iCal does not automatically add new events. either a way to subscribe to other peoples calendars in this app or to iCal format is useful
        -   maybe it has to pull the iCal periodically to see if there are any new events to add?
-   stuff to let it work offline? (react query persistent cache)
-   allow you to click and drag existing events around and drag edges to change duration/start and end
