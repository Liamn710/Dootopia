import { signOut } from 'firebase/auth';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { auth } from '../../FirebaseConfig';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';


const ProfilePage = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace('/'); // Navigate to home screen after logout
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Profile Page</Text>
      <Text>User profile content will go here</Text>
      <Button mode="contained" onPress={handleSignOut} style={{ marginTop: 20 }}>
        Logout
      </Button>
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