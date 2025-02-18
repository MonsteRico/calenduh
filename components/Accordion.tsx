import React, { useState } from 'react';
import { View, Text, LayoutAnimation, UIManager, Platform } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { cn } from '../lib/utils';

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, className, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => {
    setIsOpen(value => !value);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  return (
    <View className={cn("border-b border-muted-foreground flex-col", className)}>
      <TouchableOpacity
        onPress={toggleOpen}
        activeOpacity={0.7}
      >
        <View className="flex-row justify-between">
          <Text className="text-lg font-bold text-primary">{title}</Text>
          <Text className="text-lg font-bold pl-3 text-primary">
            {isOpen ? '\u2212' : '\u002B'}
          </Text>
        </View>
      </TouchableOpacity>
      <View
        className={cn(
          "overflow-hidden my-4",
          isOpen ? "h-auto flex" : "hidden"
        )}
      >
        {children}
      </View>
    </View>
  );
};

export { Accordion };