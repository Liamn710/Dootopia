import { signOut } from 'firebase/auth';
import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { auth } from '../../FirebaseConfig';
import { Button ,Avatar } from 'react-native-paper';
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
  const onAvatarPress = () => {
    router.push('/screens/StorePage'); // Navigate to StorePage on avatar press
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onAvatarPress}>
        <Avatar.Image size={100} source={{ uri: 'https://gravatar.com/avatar/0afa0df4b91f1d47fe6e607745d35b36?s=400&d=robohash&r=x' }} />
      </TouchableOpacity>
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