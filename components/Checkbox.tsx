import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { cn } from '../lib/utils';

// TODO: make controlled (optional)
interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof View> {
  label?: string;
  labelClasses?: string;
  checkboxClasses?: string;
  color?: string; // border and fill color of box in hex
  checkSymbol?: boolean; // enable/disable check symbol in box
  checked?: boolean;
  onCheck?: (checked: boolean) => void;
}
function Checkbox({
  label,
  labelClasses,
  checkboxClasses,
  className,
  color = '#525f7f', //gray-700 in hex
  checkSymbol = true,
  checked = false,
  onCheck = () => { },
  ...props
}: CheckboxProps) {
  const toggleCheckbox = () => {
    onCheck(!checked);
  };

  return (
    <View
      className={cn('flex flex-row items-center gap-2', className)}
      {...props}
    >
      <TouchableOpacity onPress={toggleCheckbox}>
        <View
          className={cn(
            'w-6 h-6 border rounded bg-background flex justify-center items-center',
            {
              'bg-foreground': checked,
            },
            checkboxClasses
          )}
          style={{
            borderColor: color,
            backgroundColor: checked ? color : 'transparent'
          }}
        >
          {checked && checkSymbol && <Text className="text-background text-xs">✓</Text>}
        </View>
      </TouchableOpacity>
      {label && (
        <Text className={cn('text-primary', labelClasses)}>{label}</Text>
      )}
    </View>
  );
}

export { Checkbox };
