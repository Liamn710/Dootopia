import * as React from 'react';
import { memo, useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Text } from 'react-native-paper';

const CalendarPage = memo(() => {
  const [selectedDate, setSelectedDate] = useState('');

  const handleDayPress = useCallback((day: any) => {
    setSelectedDate(day.dateString);
  }, []);

  const markedDates = React.useMemo(() => ({
    [selectedDate]: { selected: true, selectedColor: 'blue' }
  }), [selectedDate]);

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Calendar Page</Text>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
      />
      {selectedDate ? (
        <Text>Selected date: {selectedDate}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
});

export default CalendarPage;
