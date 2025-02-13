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
}
function Checkbox({
  label,
  labelClasses,
  checkboxClasses,
  className,
  color = '#525f7f', //gray-700 in hex
  checkSymbol = true,
  ...props
}: CheckboxProps) {
  const [isChecked, setChecked] = useState(false);

  const toggleCheckbox = () => {
    setChecked(prev => !prev);
  };

  return (
    <View
      className={cn('flex flex-row items-center gap-2', className)}
      {...props}
    >
      <TouchableOpacity onPress={toggleCheckbox}>
        <View
          className={cn(
            'w-4 h-4 border rounded bg-background flex justify-center items-center',
            {
              'bg-foreground': isChecked,
            },
            checkboxClasses
          )}
          style={{
            borderColor: color,
            backgroundColor: isChecked ? color: 'transparent'
          }}
        >
          {isChecked && checkSymbol && <Text className="text-background text-xs">✓</Text>}
        </View>
      </TouchableOpacity>
      {label && (
        <Text className={cn('text-primary', labelClasses)}>{label}</Text>
      )}
    </View>
  );
}

export { Checkbox };
