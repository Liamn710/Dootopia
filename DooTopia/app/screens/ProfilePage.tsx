import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import * as React from 'react';
import { memo, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar } from 'react-native-paper';
import { auth } from '../../FirebaseConfig';

const AvatarComponent = memo(() => (
  <Avatar.Image size={64} source={require('../../assets/images/avatar.png')} />
));
export { AvatarComponent };

const ProfilePage = memo(() => {
  const handleAvatarPress = useCallback(() => {
    router.push("/screens/StorePage");
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={handleAvatarPress}>
          <AvatarComponent />
        </TouchableOpacity>
      </View>

    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 20,
  },

  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
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