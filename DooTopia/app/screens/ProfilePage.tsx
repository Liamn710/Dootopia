import { signOut, deleteUser as firebaseDeleteUser,sendPasswordResetEmail } from 'firebase/auth';
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, Button, Avatar } from 'react-native-paper';
import { auth } from '../../FirebaseConfig';
import { useRouter } from 'expo-router';
import { deleteUser as deleteUserApi, getMongoUserByFirebaseId } from '../../backend/api';

const ProfilePage = () => {
  const router = useRouter();


  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteUser = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'No user found.');
      return;
    }
    try {
      // Delete from Firebase Auth
      await firebaseDeleteUser(user);

      // Get MongoDB user ID
      const mongoUser = await getMongoUserByFirebaseId(user.uid);
      if (mongoUser && mongoUser._id) {
        await deleteUserApi(mongoUser._id);
      }

      Alert.alert('Account Deleted', 'Your account has been deleted.');
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete user.');
      console.error('Error deleting user:', error);
    }
  };

  const handleChangePassword = async () => {
    const user = auth.currentUser;
    if (user && user.email) {
      try {
        await sendPasswordResetEmail(auth, user.email);
        Alert.alert('Password Reset', 'A password reset email has been sent to your email address.');
      } catch (error) {
        Alert.alert('Error', 'Failed to send password reset email.');
        console.error('Error sending password reset email:', error);
      }
    } else {
      Alert.alert('Error', 'No user email found.');
    }
  };

  const onAvatarPress = () => {
    //go to store page at the moment
    router.push("/screens/StorePage");
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
      <Button mode="outlined" onPress={handleChangePassword} style={{ marginTop: 10 }}>
        Change Password
      </Button>
      <Button mode="contained" onPress={handleDeleteUser} style={{ marginTop: 10 }} color="#d32f2f">
        Delete Account
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


