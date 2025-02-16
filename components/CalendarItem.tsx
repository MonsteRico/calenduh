import { Text, TouchableOpacity, View } from 'react-native';
import { cn } from '../lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';

const calendarItemVariants = cva(
    'flex-row items-center rounded-md bg-transparent self-start'
)




interface CalendarItemProps 
    extends React.ComponentPropsWithoutRef<typeof TouchableOpacity>,
    VariantProps<typeof calendarItemVariants> {
        name: string;
        color: string;
        labelClasses?: string;
    } function CalendarItem({
        name,
        color,
        labelClasses,
        className,
        ...props
    }: CalendarItemProps) {
        return (
            <TouchableOpacity 
                className={cn(calendarItemVariants({ className }))}
                {...props} >
                    <View className="w-5 h-5 rounded-full mr-2 mt-1" style={{ backgroundColor: color}}/>
                    <Text className="text-2xl text-primary-background">
                        {name}
                    </Text>
                </TouchableOpacity>
        )
    }

    export { CalendarItem };