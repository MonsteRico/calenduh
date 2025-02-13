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
}

const Accordion: React.FC<AccordionProps> = ({ title, children, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(value => !value);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  return (
    <View className={cn("border-b border-gray-200 flex-col", className)}>
      <TouchableOpacity
        onPress={toggleOpen}
        activeOpacity={0.6}
      >
        <View className="flex-row items-center ml-5">
          <Text className="text-2xl font-bold">{title}</Text>
          <Text className="text-2xl font-bold pl-3">
            {isOpen ? '\u2212' : '\u002B'}
          </Text>
        </View>
      </TouchableOpacity>
      <View
        className={cn(
          "overflow-hidden",
          isOpen ? "h-auto" : "h-0"
        )}
      >
        {children}
      </View>
    </View>
  );
};

export { Accordion };