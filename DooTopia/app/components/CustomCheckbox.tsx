import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Checkbox as PaperCheckbox } from 'react-native-paper';

interface CustomCheckboxProps {
  status: 'checked' | 'unchecked' | 'indeterminate';
  onPress: () => void;
  disabled?: boolean;
  color?: string;
  uncheckedColor?: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  status,
  onPress,
  disabled = false,
  color = '#6200EE',
  uncheckedColor = '#666',
}) => {
  // Use native Paper checkbox for native platforms
  if (Platform.OS !== 'web') {
    return (
      <PaperCheckbox
        status={status}
        onPress={onPress}
        disabled={disabled}
        color={color}
        uncheckedColor={uncheckedColor}
      />
    );
  }

  // Custom web implementation
  const isChecked = status === 'checked';
  const isIndeterminate = status === 'indeterminate';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.webCheckbox,
        {
          backgroundColor: isChecked || isIndeterminate ? color : 'transparent',
          borderColor: isChecked || isIndeterminate ? color : uncheckedColor,
        },
        disabled && styles.disabled,
      ]}
    >
      {isChecked && (
        <MaterialIcons 
          name="check" 
          size={18} 
          color="white" 
          style={styles.checkIcon}
        />
      )}
      {isIndeterminate && (
        <View style={[styles.indeterminateBar, { backgroundColor: 'white' }]} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  webCheckbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
  },
  checkIcon: {
    marginTop: Platform.OS === 'web' ? -1 : 0,
  },
  indeterminateBar: {
    width: 12,
    height: 2,
    borderRadius: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default CustomCheckbox;
