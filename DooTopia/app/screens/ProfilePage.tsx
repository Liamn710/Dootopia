import { useFocusEffect, useRouter } from 'expo-router';
import { deleteUser as firebaseDeleteUser, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, Text } from 'react-native-paper';
import { deleteUser as deleteUserApi, getMongoUserByFirebaseId } from '../../backend/api';
import { auth } from '../../FirebaseConfig';

const ProfilePage = () => {
  const router = useRouter();
  const [mongoProfile, setMongoProfile] = useState<any | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);

  const loadProfile = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      setMongoProfile(null);
      setProfileLoading(false);
      return;
    }

    try {
      setProfileLoading(true);
      const mongoUser = await getMongoUserByFirebaseId(user.uid);
      setMongoProfile(mongoUser);
    } catch (error) {
      console.error('Failed to load profile:', error);
      Alert.alert('Error', 'Unable to load profile information.');
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );


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

      let mongoUserId = mongoProfile?._id;
      if (!mongoUserId) {
        const mongoUser = await getMongoUserByFirebaseId(user.uid);
        mongoUserId = mongoUser?._id;
      }

      if (mongoUserId) {
        await deleteUserApi(mongoUserId);
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
    router.push("/screens/OwnedAvatarsPage");
  };

  const avatarUri = mongoProfile?.selectedAvatarUrl
    || 'https://gravatar.com/avatar/0afa0df4b91f1d47fe6e607745d35b36?s=400&d=robohash&r=x';

  const profileName = mongoProfile?.name
    || auth.currentUser?.displayName
    || auth.currentUser?.email
    || 'Profile';

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onAvatarPress}>
        <Avatar.Image
          size={110}
          source={{ uri: avatarUri }}
          style={styles.avatar}
        />
      </TouchableOpacity>
      <Text variant="headlineMedium" style={styles.primaryText}>{profileName}</Text>
      <Text style={styles.secondaryText}>{mongoProfile?.email || auth.currentUser?.email || ''}</Text>
      <Text style={styles.pointsText}>Points: {mongoProfile?.points ?? 0}</Text>
      {profileLoading && <Text style={styles.loadingText}>Refreshing profile...</Text>}
      <Button mode="contained" onPress={handleSignOut} style={{ marginTop: 20 }}>
        Logout
      </Button>
      <Button mode="outlined" onPress={handleChangePassword} style={{ marginTop: 10 }}>
        Change Password
      </Button>
      {/* Delete button absolutely positioned in bottom left */}
      <View style={styles.deleteButtonContainer}>
        <Button mode="contained" onPress={handleDeleteUser} style={styles.deleteButton} buttonColor="#d32f2f" textColor="#fff">
          Delete Account
        </Button>
      </View>
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
  avatar: {
    marginBottom: 12,
  },
  primaryText: {
    fontWeight: '600',
    marginTop: 4,
  },
  secondaryText: {
    color: '#666',
    marginTop: 4,
  },
  pointsText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 8,
    color: '#999',
  },
  deleteButtonContainer: {
    position: 'absolute',
    left: 20,
    bottom: 30,
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    elevation: 2,
  },
});


export default ProfilePage;


