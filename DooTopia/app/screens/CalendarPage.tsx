import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

const CalendarPage = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Calendar Page</Text>
      <Text>Calendar content will go here</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default CalendarPage;
