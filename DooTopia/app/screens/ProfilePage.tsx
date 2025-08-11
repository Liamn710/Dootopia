import { signOut } from 'firebase/auth';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { auth } from '../../FirebaseConfig';

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

const handleSignOut = async () => {
  try {
    await signOut(auth);
    // Firebase will automatically trigger the auth state change
    // which will redirect to the login screen
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

export default ProfilePage;