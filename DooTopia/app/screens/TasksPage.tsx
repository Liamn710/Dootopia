import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

const TasksPage = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Tasks Page</Text>
      <Text>Task management content will go here</Text>
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

export default TasksPage;
