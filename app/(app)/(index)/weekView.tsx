import { Text, View, ScrollView, TouchableOpacity, Dimensions, ViewStyle, DimensionValue } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { Button } from '@/components/Button';
import { EventViewModal } from '@/components/EventViewModal';
import { Event } from '@/types/event.types';
import { useEnabledCalendarIds } from '@/hooks/useEnabledCalendarIds';
import { useCalendar, useMultipleCalendars } from '@/hooks/calendar.hooks';

import { router } from 'expo-router';
import { useSession } from '@/hooks/authContext';
import { useCurrentViewedDay } from '@/hooks/useCurrentViewedDay';
import { useEventsForWeek } from '@/hooks/event.hooks';
import { Calendar } from '@/types/calendar.types';

interface ProcessedEventType extends Event {
  width: number;
  left: number;
}

interface CalendarWeekViewProps {
  events?: Event[];
  startDate?: DateTime;
  onEventPress?: (event: Event) => void;
  hourHeight?: number;
  showCurrentTime?: boolean;
  showHours?: boolean;
  numDays?: number;
}

const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({
  events = [],
  startDate = DateTime.now().weekday === 7 ? DateTime.now().startOf('day') : DateTime.now().startOf('week').minus({ days: 1 }), // Start from Sunday instead of Monday
  onEventPress,
  hourHeight = 60,
  showCurrentTime = true,
  showHours = true,
  numDays = 7
}) => {
  const HOURS_IN_DAY = 24;
  const HOUR_HEIGHT = hourHeight;
  const TIME_LABEL_WIDTH = 35; // Reduced from 50 to make it narrower
  const CONTAINER_HEIGHT = HOURS_IN_DAY * HOUR_HEIGHT;
  const screenWidth = Dimensions.get('window').width;
  const dayWidth = (screenWidth - TIME_LABEL_WIDTH) / numDays;

  // Group events by day
  const eventsByDay = useMemo(() => {
    const groupedEvents: { [key: string]: Event[] } = {};

    // Initialize days
    for (let i = 0; i < numDays; i++) {
      const day = startDate.plus({ days: i });
      groupedEvents[day.toISODate() || ''] = [];
    }

    // Group events by day
    events.forEach(event => {
      const eventDate = event.start_time.toISODate();
      if (eventDate && groupedEvents[eventDate]) {
        groupedEvents[eventDate].push(event);
      }
    });

    // Sort events for each day
    Object.keys(groupedEvents).forEach(date => {
      groupedEvents[date].sort((a, b) => a.start_time.toMillis() - b.start_time.toMillis());
    });

    return groupedEvents;
  }, [events, startDate, numDays]);

  const renderHourLabels = (): React.ReactNode[] => {
    const hours: React.ReactNode[] = [];

    for (let i = 0; i < HOURS_IN_DAY; i++) {
      const hourDateTime = startDate.set({ hour: i, minute: 0, second: 0, millisecond: 0 });
      const formattedHour = hourDateTime.toFormat('h a');

      hours.push(
        <View key={`hour-label-${i}`} style={{ height: HOUR_HEIGHT }} className="border-b border-gray-200">
          <View className="border-r border-gray-300 justify-start items-end pr-1 h-full">
            <Text className="text-xs text-gray-500">{formattedHour}</Text>
          </View>
        </View>
      );
    }

    return hours;
  };

  // Process events to handle overlapping - improved logic to prevent spillover
  const processEvents = (dayEvents: Event[]): ProcessedEventType[] => {
    if (!dayEvents.length) return [];

    // Sort events by start time
    const sortedEvents = [...dayEvents].sort((a, b) =>
      a.start_time.toMillis() - b.start_time.toMillis() ||
      a.event_id.localeCompare(b.event_id)
    );

    // Find overlapping event groups
    const overlapGroups: Event[][] = [];
    let currentGroup: Event[] = [];

    sortedEvents.forEach((event, index) => {
      if (index === 0) {
        currentGroup.push(event);
        return;
      }

      // Check if this event overlaps with any event in the current group
      const overlapsWithGroup = currentGroup.some(groupEvent =>
        event.start_time < groupEvent.end_time && event.end_time > groupEvent.start_time
      );

      if (overlapsWithGroup) {
        currentGroup.push(event);
      } else {
        // Start a new group if no overlap
        overlapGroups.push([...currentGroup]);
        currentGroup = [event];
      }
    });

    // Add the last group if it has events
    if (currentGroup.length > 0) {
      overlapGroups.push(currentGroup);
    }

    // Process each group to set width and left position
    const processedEvents: ProcessedEventType[] = [];

    overlapGroups.forEach(group => {
      const eventCount = group.length;

      group.forEach((event, index) => {
        // Each event gets equal width within the day column (100% / number of events)
        const width = 100 / eventCount;
        // Left position is based on the index of the event in this group
        const left = (index * 100) / eventCount;

        processedEvents.push({
          ...event,
          width,
          left
        });
      });
    });

    return processedEvents;
  };

  // Calculate position and height for an event
  const getEventStyle = (event: ProcessedEventType): ViewStyle => {
    const startHour = event.start_time.hour + event.start_time.minute / 60;
    const endHour = event.end_time.hour + event.end_time.minute / 60;
    const duration = endHour - startHour;

    // Calculate width and left as percentages within the day column
    const widthValue = `${event.width}%` as DimensionValue;
    const leftValue = `${event.left}%` as DimensionValue;

    return {
      position: 'absolute',
      top: startHour * HOUR_HEIGHT,
      height: duration * HOUR_HEIGHT,
      width: widthValue,
      left: leftValue,
    };
  };

  const formatEventTime = (date: DateTime): string => {
    return date.toFormat("h:mm a");
  };

  const renderDayHeader = (): React.ReactNode => {
    const days: React.ReactNode[] = [];

    // Empty cell for time labels
    days.push(
      <View key="time-header" style={{ width: TIME_LABEL_WIDTH }} className="border-b border-gray-300">
        <Text className="text-xs text-gray-500 p-2"></Text>
      </View>
    );

    // Day headers
    for (let i = 0; i < numDays; i++) {
      const day = startDate.plus({ days: i });
      const isToday = day.hasSame(DateTime.now(), 'day');

      days.push(
        <View
          key={`day-${i}`}
          style={{ width: dayWidth }}
          className={`border-b border-l border-gray-300 items-center py-2 ${isToday ? 'bg-blue-50' : ''}`}
        >
          <Text className="text-xs font-bold">{day.toFormat('ccc')}</Text>
          <Text className={`text-sm ${isToday ? 'font-bold text-blue-500' : ''}`}>{day.toFormat('d')}</Text>
        </View>
      );
    }

    return (
      <View className="flex-row">
        {days}
      </View>
    );
  };


  const renderEventsForDay = (dayIndex: number): React.ReactNode => {
    const day = startDate.plus({ days: dayIndex });
    const dayEvents = eventsByDay[day.toISODate() || ''] || [];
    const processedEvents = processEvents(dayEvents);

    //get all calendars at once with one hook call then create a map of calendarIds to calendar data
    //prevents react rendering errors caused by a variablle number of hooks called
    const calendar_ids = Array.from(new Set(processedEvents.map(event => event.calendar_id)));
    const calendars = useMultipleCalendars(calendar_ids);
    const calendarMap: Record<string, Calendar | undefined> = calendar_ids.reduce((acc, id, index) => {
      const result = calendars[index];
      if (result.isSuccess && result.data) {
        acc[id] = result.data;
      } else {
        acc[id] = undefined;
      }
      return acc;
    }, {} as Record<string, Calendar | undefined>);

    return processedEvents.map((event, index) => {
      const eventStyle = getEventStyle(event);
      //const calendar = useCalendar(event.calendar_id).data;
      const calendar = calendarMap[event.calendar_id];
      if (!calendar) {
        return null;
      }
      const borderColor = calendar?.color;

      return (
        <TouchableOpacity
          key={`${dayIndex}-${event.event_id || index.toString()}`}
          style={[
            eventStyle,
            {
              backgroundColor: `${borderColor}20`,
              borderLeftWidth: 4,
              borderLeftColor: borderColor
            }
          ]}
          className="rounded-r-md px-2 py-1 mr-1 overflow-hidden"
          onPress={() => onEventPress && onEventPress(event)}
        >
          <Text className="font-bold text-xs">{event.name}</Text>
        </TouchableOpacity>
      );
    });
  };

  const getCurrentTimeIndicator = (): React.ReactNode => {
    if (!showCurrentTime) return null;

    const now = DateTime.now();
    // Calculate the exact day index based on the current date
    const currentDate = now.toISODate();
    let currentDayIndex = -1;

    for (let i = 0; i < numDays; i++) {
      const dayDate = startDate.plus({ days: i }).toISODate();
      if (dayDate === currentDate) {
        currentDayIndex = i;
        break;
      }
    }

    // Only show time indicator if the current day is in view
    if (currentDayIndex < 0 || currentDayIndex >= numDays) return null;

    const timePosition = (now.hour + now.minute / 60) * HOUR_HEIGHT;
    const indicatorLeft = TIME_LABEL_WIDTH + (currentDayIndex * dayWidth);

    return (
      <View
        className="absolute border-t border-red-500 z-10"
        style={{
          top: timePosition,
          left: indicatorLeft,
          width: dayWidth
        }}
      >
        {/* Red dot positioned at the left of the line */}
        <View className="h-2 w-2 rounded-full bg-red-500 absolute -top-1 -left-1" />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <View className="py-4 items-center border-b border-gray-300">
        <Text className="text-xl font-bold">
          {startDate.toFormat('MMM d')} - {startDate.plus({ days: numDays - 1 }).toFormat('MMM d, yyyy')}
        </Text>
      </View>

      {renderDayHeader()}

      <ScrollView className="flex-1">
        <View style={{ height: CONTAINER_HEIGHT, position: 'relative' }}>
          {/* Hour time labels */}
          <View className="absolute top-0 left-0" style={{ width: TIME_LABEL_WIDTH }}>
            {showHours && renderHourLabels()}
          </View>

          {/* Grid lines for all days */}
          <View className="absolute" style={{ left: TIME_LABEL_WIDTH, right: 0 }}>
            {Array.from({ length: HOURS_IN_DAY }).map((_, hour) => (
              <View key={`hour-${hour}`} className="flex-row border-b border-gray-200" style={{ height: HOUR_HEIGHT }}>
                {Array.from({ length: numDays }).map((_, day) => (
                  <View
                    key={`grid-${hour}-${day}`}
                    style={{ width: dayWidth }}
                    className={day > 0 ? 'border-l border-gray-200' : ''}
                  />
                ))}
              </View>
            ))}
          </View>

          {/* Current time indicator */}
          {getCurrentTimeIndicator()}

          {/* Event containers for each day */}
          {Array.from({ length: numDays }).map((_, dayIndex) => (
            <View
              key={`events-container-${dayIndex}`}
              className="absolute overflow-hidden"
              style={{
                left: TIME_LABEL_WIDTH + (dayWidth * dayIndex),
                width: dayWidth,
                top: 0,
                height: CONTAINER_HEIGHT
              }}
            >
              {renderEventsForDay(dayIndex)}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default function WeekView() {
  const isPresented = router.canGoBack();
  const { user } = useSession();

  const { dayBeingViewed, setDayBeingViewed } = useCurrentViewedDay();
  // Start from Sunday instead of Monday (subtract 1 day from the start of week)

  const startOfWeek = dayBeingViewed.weekday === 7 ? dayBeingViewed.startOf('day') : dayBeingViewed.startOf('week').minus({ days: 1 });

  const { data: events, isLoading } = useEventsForWeek(dayBeingViewed);

  const [eventIdToView, setEventIdToView] = useState<string | null>(null);
  const [calendarIdToView, setCalendarIdToView] = useState<string | null>(null);

  const { enabledCalendarIds } = useEnabledCalendarIds();

  const currentDate = DateTime.now();

  const calendarsForShownEvents = useMemo(() => {
    if (!events) {
      return [];
    }
    //Filter events based on enabled calendar IDs
    const shownEvents = events.filter((event) => enabledCalendarIds.includes(event.calendar_id));

    const uniqueEventsMap = new Map<string, Event>();

    shownEvents.forEach((event) => {
      if (!uniqueEventsMap.has(event.event_id)) {
        uniqueEventsMap.set(event.event_id, event);
      }
    });

    return Array.from(uniqueEventsMap.values());
  }, [enabledCalendarIds, events]);

  const handleEventPress = (event: Event) => {
    setEventIdToView(event.event_id);
    setCalendarIdToView(event.calendar_id);
  };

  const navigateToNextWeek = () => {
    setDayBeingViewed(dayBeingViewed.plus({ days: 7 }));
  };

  const navigateToPreviousWeek = () => {
    setDayBeingViewed(dayBeingViewed.minus({ days: 7 }));
  };

  if (!user || isLoading) {
    return <Text className="text-primary">Loading...</Text>;
  }

  return (
    <View className="flex-1 bg-background">
      <View className="m-2 flex-row items-center justify-between">
        {isPresented && (
          <Button
            onPress={() => {
              router.back();
            }}
            className="text-primary"
          >
            Back
          </Button>
        )}

        <View className="flex-row items-center">
          <Button
            onPress={navigateToPreviousWeek}
            className="text-primary"
          >
            Previous
          </Button>
          <Button
            onPress={() => setDayBeingViewed(DateTime.now())}
            className="text-primary mx-2"
          >
            Today
          </Button>
          <Button
            onPress={navigateToNextWeek}
            className="text-primary"
          >
            Next
          </Button>
        </View>
      </View>

      {eventIdToView && calendarIdToView && (
        <EventViewModal
          visible={eventIdToView != null}
          eventId={eventIdToView}
          calendarId={calendarIdToView}
          onClose={() => {
            setEventIdToView(null);
            setCalendarIdToView(null);
          }}
        />
      )}

      <CalendarWeekView
        events={calendarsForShownEvents}
        startDate={startOfWeek}
        onEventPress={handleEventPress}
        hourHeight={60}
        showCurrentTime={true}
      />
    </View>
  );
}