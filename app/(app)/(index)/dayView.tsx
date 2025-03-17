import { Text, View, ScrollView, TouchableOpacity, Dimensions, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import { useSession } from '@/hooks/authContext';
import { useEventsForDay } from '@/hooks/event.hooks';
import { EventViewModal } from '@/components/EventViewModal';
import { useCurrentViewedDay } from '@/hooks/useCurrentViewedDay';
import { Event } from "@/types/event.types";
import { useEnabledCalendarIds } from '@/hooks/useEnabledCalendarIds';
import { useCalendar } from '@/hooks/calendar.hooks';

interface ProcessedEventType extends Event {
  width: number; 
  left: number;  
}

interface CalendarDayViewProps {
  events?: Event[];
  date?: DateTime;
  onEventPress?: (event: Event) => void;
  hourHeight?: number;
  showCurrentTime?: boolean;
}

const CalendarDayView: React.FC<CalendarDayViewProps> = ({
  events = [],
  date = DateTime.now(),
  onEventPress,
  hourHeight = 60,
  showCurrentTime = true
}) => {
  const HOURS_IN_DAY = 24;
  const HOUR_HEIGHT = hourHeight;
  const TIME_LABEL_WIDTH = 50;
  const CONTAINER_HEIGHT = HOURS_IN_DAY * HOUR_HEIGHT;
  const screenWidth = Dimensions.get('window').width;
  const eventContainerWidth = screenWidth - TIME_LABEL_WIDTH;

  const renderHourIndicators = (): React.ReactNode[] => {
    const hours: React.ReactNode[] = [];
    for (let i = 0; i < HOURS_IN_DAY; i++) {

      const hourDateTime = date.set({ hour: i, minute: 0, second: 0, millisecond: 0 });
      const formattedHour = hourDateTime.toFormat('h a');
      
      hours.push(
        <View key={i} className="flex-row" style={{ height: HOUR_HEIGHT }}>

          <View className="border-r border-gray-300 justify-start items-end pr-2" style={{ width: TIME_LABEL_WIDTH }}>
            <Text className="text-xs text-gray-500">{formattedHour}</Text>
          </View>
          
          <View className="flex-1 border-b border-gray-200" />
        </View>
      );
    }
    return hours;
  };

  // Process events to handle overlapping
  const processEvents = (events: Event[]): ProcessedEventType[] => {
    if (!events.length) return [];

    // Find the maximum number of concurrent events in any time slot
    const eventConcurrency: { [key: string]: number } = {};
    const eventOverlapGroups: { [key: string]: Event[] } = {};
    
    let i = 0;
    let j = 1;
    let maxEnd = events[0].end_time;

    while (j < events.length) {
        if (events[j].start_time < maxEnd && events[j].end_time > maxEnd) {
            maxEnd = events[j].end_time;
            j++;
        }
        else if (events[j].start_time < maxEnd) {
            j++;
        }
        else {
            let maxConcurrent = j - i;
            let overlapGroup: Event[] = [];
            for (let k = i; k < j; k++) {
                overlapGroup.push(events[k]);
            }
            for (let k = i; k < j; k++) {
                eventConcurrency[events[k].event_id] = maxConcurrent;
                eventOverlapGroups[events[k].event_id] = overlapGroup;
            }
            i = j;
            maxEnd = events[j].end_time;
            j++;
        }
    }

    //process last overlap group because while loop ends
    let maxConcurrent = j - i;
    let overlapGroup: Event[] = [];
    for (let k = i; k < j; k++) {
        overlapGroup.push(events[k]);
    }
    for (let k = i; k < j; k++) {
        eventConcurrency[events[k].event_id] = maxConcurrent;
        eventOverlapGroups[events[k].event_id] = overlapGroup;
    }

    
    // Process events with calculated concurrency
    const processedEvents: ProcessedEventType[] = [];
    
    events.forEach(event => {
      const concurrentEvents = eventOverlapGroups[event.event_id];
      const eventCount = eventConcurrency[event.event_id];
      
      // Width is determined by how many events are concurrent (as a decimal percentage)
      const widthPercent = 100 / eventCount;
      
      // Sort concurrent events to determine position (left)
      const sortedEvents = concurrentEvents.sort((a, b) => 
        a.start_time.toMillis() - b.start_time.toMillis() || 
        a.event_id.localeCompare(b.event_id) // Secondary sort by ID for consistent ordering - could be changed to event priority
      );
      
      // Find the position of the current event
      const position = sortedEvents.findIndex(e => e.event_id === event.event_id);
      const leftPercent = (position * 100) / eventCount;
      
      // Store percentages as decimal numbers rather than strings
      processedEvents.push({
        ...event,
        width: widthPercent,
        left: leftPercent
      });
    });
    
    return processedEvents;
  };

  // Calculate position and height for an event - fixed types
  const getEventStyle = (event: ProcessedEventType): ViewStyle => {
    const startHour = event.start_time.hour + event.start_time.minute / 60;
    const endHour = event.end_time.hour + event.end_time.minute / 60;
    const duration = endHour - startHour;
    
    // Calculate width and left as percentages
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

  const renderEvents = (): React.ReactNode => {
    const processedEvents = processEvents(events);
    
    return processedEvents.map((event, index) => {
      const eventStyle = getEventStyle(event);
      //const borderColor = event.color || 'rgb(59, 130, 246)'; 
      const {data: calendar} = useCalendar(event.calendar_id);
      if (!calendar) {
        return null;
      } 
      const borderColor = calendar.color
      //const borderColor = 'rgb(59, 130, 246)';
      
      return (
        <TouchableOpacity 
          key={event.event_id || index.toString()}
          style={[
            eventStyle, 
            { 
              backgroundColor: `${borderColor}20`,
              borderLeftWidth: 4,
              borderLeftColor: borderColor
            }
          ]}
          className="rounded-r-md px-2 py-1 mr-1"
          onPress={() => onEventPress && onEventPress(event)}
        >
           <Text className="font-bold text-xs">{event.name}</Text>
          {/*check height of event and width*/}
          {eventStyle.height as number > 50 && parseInt((eventStyle.width as string).substring(0, (eventStyle.width as string).length)) > 14 && (
          <>
           
            <Text className="text-xs text-gray-700">
              {formatEventTime(event.start_time)} - {formatEventTime(event.end_time)}
            </Text>
          </>
        )}
          
        </TouchableOpacity>
      );
    });
  };

  const getCurrentTimePosition = (): number => {
    const now = new Date();
    return (now.getHours() + now.getMinutes() / 60) * HOUR_HEIGHT;
  };

  return (
    <View className="flex-1 bg-white">
      <View className="py-4 items-center border-b border-gray-200">
        <Text className="text-xl font-bold">{date.toFormat('EEEE, MMMM d, yyyy')}</Text>
      </View>
       
      <ScrollView className="flex-1">
        <View style={{ height: CONTAINER_HEIGHT, position: 'relative' }}>
          {renderHourIndicators()}
          
          {showCurrentTime && (
            <View
              className="absolute left-0 right-0 border-t border-red-500 z-10"
              style={{ 
                top: getCurrentTimePosition(),
                left: TIME_LABEL_WIDTH
              }}
            >
              <View className="h-2 w-2 rounded-full bg-red-500 absolute -left-1 -top-1" />
            </View>
          )}
          
          <View 
            className="absolute top-0 bottom-0" 
            style={{ left: TIME_LABEL_WIDTH, right: 0 }}
          >
            {renderEvents()}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default function DayView() {
    const isPresented = router.canGoBack();
    const { user } = useSession();
    //const [events, setEvents] = useState<EventType[]>([]);

    const { dayBeingViewed, setDayBeingViewed } = useCurrentViewedDay();

    const { data: events, isLoading } = useEventsForDay(dayBeingViewed);

    const [eventIdToView, setEventIdToView] = useState<string | null>(null);
    const [calendarIdToView, setCalendarIdToView] = useState<string | null>(null);

    const { enabledCalendarIds } = useEnabledCalendarIds();

    const currentDate = DateTime.now();

    const calendarsForShownEvents = useMemo(() => {
        if (!events) {
            return [];
        }
        // Filter events based on enabled calendar IDs
        const shownEvents = events.filter((event) => enabledCalendarIds.includes(event.calendar_id));

        const uniqueEventsMap = new Map<string, Event>();

        shownEvents.forEach((event) => {
            if (!uniqueEventsMap.has(event.event_id)) {
                uniqueEventsMap.set(event.event_id, event);
            }
        });

        return Array.from(uniqueEventsMap.values());
        }, [enabledCalendarIds, events]); // Memoize based on changes to enabledCalendarIds or events

    const handleEventPress = (event: Event) => {
        setEventIdToView(event.event_id)
        setCalendarIdToView(event.calendar_id);
    };
    
    const navigateToNextDay = () => {
        const nextDay = (dayBeingViewed).plus({ days: 1 });
        setDayBeingViewed(nextDay)
    };
    
    const navigateToPreviousDay = () => {
        const nextDay = (dayBeingViewed).minus({ days: 1 });
        setDayBeingViewed(nextDay)
    };

    if (!user || isLoading) {
        return <Text className='text-primary'>Loading...</Text>
    }
   
    return (
        <View className='flex-1 bg-background'>

            <View className='m-2 flex-row items-center justify-between'>
                {isPresented && (
                    <Button
                        onPress={() => {
                            router.back();
                        }}
                        className='text-primary'
                    >
                        Back
                    </Button>
                )}
                
                <View className="flex-row items-center">
                    <Button 
                        onPress={navigateToPreviousDay}
                        className='text-primary'
                    >
                        Previous
                    </Button>
                    <Button
                        onPress={() => setDayBeingViewed(DateTime.now())}
                        className='text-primary mx-2'
                    >
                        Today
                    </Button>
                    <Button 
                        onPress={navigateToNextDay}
                        className='text-primary'
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
                    }}/>
            )}
            
            <CalendarDayView
                events={calendarsForShownEvents}
                date={dayBeingViewed}
                onEventPress={handleEventPress}
                hourHeight={60}
                showCurrentTime={dayBeingViewed.hasSame(currentDate, 'day')}
            />
        </View>
    )
}