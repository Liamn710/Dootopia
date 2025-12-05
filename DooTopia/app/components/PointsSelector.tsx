import { useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { Button, Menu, Text, TouchableRipple } from 'react-native-paper';

export const DEFAULT_POINT_OPTIONS = [3, 5, 10] as const;

type PointsSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  options?: readonly number[];
  label?: string;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
};

const PointsSelector = ({
  value,
  onChange,
  options = DEFAULT_POINT_OPTIONS,
  label,
  placeholder = 'Select Points',
  style,
}: PointsSelectorProps) => {
  const [visible, setVisible] = useState(false);
  const [anchorWidth, setAnchorWidth] = useState<number | undefined>(undefined);

  const close = () => setVisible(false);

  const handleSelect = (pointsValue: number) => {
    onChange(String(pointsValue));
    close();
  };

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Menu
        visible={visible}
        onDismiss={close}
        anchorPosition="bottom"
        contentStyle={[styles.menuContent, anchorWidth ? { width: anchorWidth } : null]}
        anchor={
          <View
            style={styles.anchor}
            onLayout={({ nativeEvent }) => setAnchorWidth(nativeEvent.layout.width)}
          >
            <Button
              mode="outlined"
              onPress={() => setVisible(true)}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              {value ? `${value} pts` : placeholder}
            </Button>
          </View>
        }
      >
        {options.map(option => (
          <TouchableRipple
            key={option}
            onPress={() => handleSelect(option)}
            style={styles.menuItemRow}
            borderless
          >
            <View style={styles.menuItemInner}>
              <Text style={styles.menuItemTitle}>{`${option} pts`}</Text>
            </View>
          </TouchableRipple>
        ))}
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    marginBottom: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#5A8A93',
    textAlign: 'center',
  },
  anchor: {
    width: '100%',
  },
  button: {
    borderColor: '#9DBCC3',
    borderWidth: 1,
    borderRadius: 10,
  },
  buttonContent: {
    justifyContent: 'center',
  },
  buttonLabel: {
    width: '100%',
    textAlign: 'center',
  },
  menuContent: {
    paddingVertical: 0,
    backgroundColor: '#F5FBFC',
    borderColor: '#9DBCC3',
    borderWidth: 1,
  },
  menuItemRow: {
    width: '100%',
  },
  menuItemInner: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  menuItemTitle: {
    textAlign: 'center',
    color: '#5A8A93',
    width: '100%',
    lineHeight: 20,
  },
});

export default PointsSelector;
