import { router, useLocalSearchParams } from 'expo-router'
import { Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { useEffect, useState } from 'react';
import { useSubscribeCalendar, useUnsubscribeCalendar } from "@/hooks/calendar.hooks";
import { calendarColors } from '@/components/CalendarColorModal';
import { cn } from '@/lib/utils';

export default function SubCalendarInfoView()  {
    const isPresented = router.canGoBack();
    const params = useLocalSearchParams();
    const { data: calendar, isLoading } = useSubscribeCalendar(params.id as string);
    const { mutate: unsubscribe, isPending: isUnsubscribing } = useUnsubscribeCalendar({
        onSuccess: () => {
            router.back();
        }
    });

   
    const calendarId = params.id as string;

    console.log("Calendar: ", calendar);
    
    if (isLoading) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <Text className="text-primary">Loading...</Text>
            </View>
        );
    }
    
    if (!calendar) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <Text className="text-primary">Calendar was not found</Text>
            </View>
        );
    }
    
    const onUnsubscribe = () => {
       if (calendar) {
            unsubscribe(calendar.calendar_id)
       }
    };
    
    return (
        <View className="flex-1 bg-background">
            <View className="px-4 py-3 flex-row items-center justify-between border-b border-border">
                {isPresented && (
                    <Button
                        onPress={() => router.back()}
                        labelClasses="text-secondary font-medium"
                    >
                        Back
                    </Button>
                )}
                <Text className="flex-1 text-center text-2xl font-bold text-primary">
                    Subscribed Calendar
                </Text>
                <View className="w-16" />
            </View>
            
            <View className="px-6 py-6">
                <View className="mb-6">
                    <Text className="text-muted-foreground text-sm mb-1">Calendar Name</Text>
                    <Text className="text-primary text-xl font-semibold">{calendar.title}</Text>
                </View>
                
                <View className="mb-6">
                    <Text className="text-muted-foreground text-sm mb-2">Color</Text>
                    <View className="flex-row items-center">
                        <View 
                            className="h-6 w-6 rounded-full mr-3 border border-border" 
                            style={{ backgroundColor: calendar.color }}
                        />
                        <Text className="text-primary">
                            {calendarColors.find((color) => color.hex === calendar.color)?.name || 'Custom'}
                        </Text>
                    </View>
                </View>
                
                <View className="mb-8">
                    <Text className="text-muted-foreground text-sm mb-2">Share Code</Text>
                    <View className="bg-muted rounded p-3">
                        <Text className="text-primary font-mono">
                            {calendar.invite_code}
                        </Text>
                    </View>
                </View>
                
                <Button
                    onPress={() => onUnsubscribe()}
                    labelClasses="text-destructive-foreground font-medium"
                    variant="destructive"
                    className="w-full"
                >
                    Unsubscribe
                </Button>
            </View>
        </View>
    );
}