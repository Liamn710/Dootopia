import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

const ProfilePage = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Profile Page</Text>
      <Text>User profile content will go here</Text>
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

export default ProfilePage;