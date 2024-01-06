TODO

-   users

    -   lock all things behind logged in status
    -   create a custom sign in page
    -   subscribable calendars
    -   change every GET to first filter based on calendars the user has attached to them

-   user preferences

    -   start on today or start on last day viewed
    -   default calendar for new events (instead of normal default calendar)
    -   keep track of the last view you were on and automatically load into that view
        -   similarly, keep track of the last _day_ you were viewing and automatically pull that day up

-   mobile friendlyfy

    -   PWA stuff
    -   fallback page for no internet

-   notifications for events coming up
-   stuff to let it work offline? (react query persistent cache)

-   export as iCal? import from iCal?
-   subscribe to iCal?

    -   importing from iCal does not automatically add new events. either a way to subscribe to other peoples calendars in this app or to iCal format is useful
        -   maybe it has to pull the iCal periodically to see if there are any new events to add?

-   allow you to click and drag existing events around and drag edges to change duration/start and end
-   click and drag to create event is commented out for now, maybe reenable it?
