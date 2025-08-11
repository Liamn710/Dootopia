import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
import { useState } from 'react';


const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState('');




  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Calendar Page</Text>
      <Calendar
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
        }}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: 'blue' }
        }}
      />
      {selectedDate ? (
        <Text>Selected date: {selectedDate}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
});

export default CalendarPage;
