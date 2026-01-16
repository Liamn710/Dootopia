import * as ImagePicker from 'expo-image-picker';
import * as React from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Button, Dialog, IconButton, PaperProvider, Portal, Text, TextInput } from 'react-native-paper';
import { createReward, getRewardById, updateReward, updateUser ,deleteReward } from '../../backend/api';
import FavButton from '../components/FavButton';
import { PrizeCard } from '../components/PrizeCard';
import useMongoUserProfile from '../hooks/useMongoUserProfile';
import { uploadImageToCloudinary  ,deleteImageFromCloudinary} from '../utils/cloudinary';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AntDesign from '@expo/vector-icons/AntDesign';

export interface Prize {
  _id?: string;
  id?: string;
  userId: string;
  title: string;
  description: string;
  points: number;
  imageUrl?: string;
  completed?: boolean;
  createdAt?: Date;
}

const PrizesPage = () => {
  const [visible, setVisible] = React.useState(false);
  const [prizes, setPrizes] = React.useState<Prize[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [showCompleted, setShowCompleted] = React.useState(false);
  const { profile, refresh } = useMongoUserProfile();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [newPrize, setNewPrize] = React.useState<Prize>({
    userId: '',
    title: '',  
    description: '',
    points: 0,
  });

  // Load prizes from MongoDB when component mounts
  React.useEffect(() => {
    loadPrizes();
  }, [profile]);

  const loadPrizes = async () => {
    if (!profile?._id) return;
    
    try {
      setLoading(true);
      const fetchedRewards = await getRewardById(profile._id);
      if (Array.isArray(fetchedRewards)) {
        setPrizes(fetchedRewards);
      }
    } catch (error) {
      console.error('Error loading rewards:', error);
      Alert.alert('Error', 'Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera roll permissions to select images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8, // Compress to reduce upload size
      });

      if (!result.canceled && result.assets[0].uri) {
        setUploading(true);
        try {
          const cloudinaryUrl = await uploadImageToCloudinary(result.assets[0].uri);
          setNewPrize(prev => ({ ...prev, imageUrl: cloudinaryUrl }));
          Alert.alert('Success', 'Image uploaded successfully!');
        } catch (error) {
          console.error('Upload error:', error);
          Alert.alert('Upload Failed', 'Failed to upload image to cloud. Please try again.');
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const addNewCard = async () => {
    if (!profile?._id) {
      Alert.alert('Error', 'User profile not loaded');
      return;
    }

    if (newPrize.title.trim() && newPrize.description.trim()) {
      try {
        const rewardToAdd: Prize = {
          ...newPrize,
          userId: profile._id,
        };
        
        const createdReward = await createReward(rewardToAdd);
        
        // Reload rewards from server
        await loadPrizes();
        
        setNewPrize({
          userId: '',
          title: '',
          description: '',
          points: 0,
        });
        setVisible(false);
        Alert.alert('Success', 'Reward created successfully!');
      } catch (error) {
        console.error('Error creating reward:', error);
        Alert.alert('Error', 'Failed to create reward');
      }
    } else {
      Alert.alert('Missing Information', 'Please fill in title and description');
    }
  };

  const handleCompleted = async (prize: Prize) => {
    if (!profile?._id) {
      Alert.alert('Error', 'User profile not loaded');
      return;
    }

    const userPoints = profile.points || 0;
    
    if (userPoints < prize.points) {
      Alert.alert(
        'Insufficient Points', 
        `You need ${prize.points} points but only have ${userPoints} points.`
      );
      return;
    }

    try {
      // Claim the reward and deduct points
      const rewardId = prize._id || prize.id;
      
      if (!rewardId) {
        Alert.alert('Error', 'Invalid reward ID');
        return;
      }

      // Mark reward as completed
      await updateReward(rewardId, { completed: true });
      
      // Deduct points from user
      const newPoints = userPoints - prize.points;
      await updateUser(profile._id, { 
        $inc: { points: -prize.points } 
      });
      
      // Refresh user profile and rewards
      await refresh(true);
      await loadPrizes();
      
      Alert.alert(
        'Reward Claimed!', 
        `Congratulations! ${prize.points} points deducted. You now have ${newPoints} points.`
      );
    } catch (error) {
      console.error('Error completing prize:', error);
      Alert.alert('Error', 'Failed to complete prize');
    }
  };

  const handleCancel = async (prize: Prize) => {
    if (!profile?._id) {
      Alert.alert('Error', 'User profile not loaded');
      return;
    }

    // Confirm deletion
    Alert.alert(
      'Delete Reward',
      'Are you sure you want to delete this reward? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const rewardId = prize._id || prize.id;
              
              if (!rewardId) {
                Alert.alert('Error', 'Invalid reward ID');
                return;
              }

              setLoading(true);

              // Delete image from Cloudinary if it exists
              if (prize.imageUrl) {
                await deleteImageFromCloudinary(prize.imageUrl);
              }

              // Delete reward from database
              await deleteReward(rewardId);

              // Reload rewards
              await loadPrizes();

              Alert.alert('Success', 'Reward deleted successfully');
            } catch (error) {
              console.error('Error deleting reward:', error);
              Alert.alert('Error', 'Failed to delete reward. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCardPress = () => {
    console.log('Card pressed');
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        {profile && (
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsText}>Your Points: {profile.points || 0}</Text>
          </View>
        )}
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6200ee" />
            <Text>Loading rewards...</Text>
          </View>
        ) : (
          <ScrollView>
            {/* Active Rewards */}
            {prizes.filter(p => !p.completed).map(prize => (
              <PrizeCard
                key={prize._id || prize.id}
                title={prize.title}
                subtitle={prize.description}
                content={prize.description}
                imageUrl={prize.imageUrl}
                pointsRequired={prize.points}
                isCompleted={false}
                userPoints={profile?.points || 0}
                onCancel={() => handleCancel(prize)}
                onCompleted={() => handleCompleted(prize)}
                onCardPress={handleCardPress}
              />
            ))}

            {/* Completed Section */}
            {prizes.filter(p => p.completed).length > 0 && (
              <View style={styles.completedSection}>
                <TouchableOpacity
                  style={styles.completedHeader}
                  onPress={() => setShowCompleted(prev => !prev)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.completedTitle}>
                    Completed ({prizes.filter(p => p.completed).length})
                  </Text>
                  <AntDesign name={showCompleted ? 'up' : 'down'} size={16} color="#6200ee" />
                </TouchableOpacity>
                {showCompleted && prizes.filter(p => p.completed).map(prize => (
                  <PrizeCard
                    key={prize._id || prize.id}
                    title={prize.title}
                    subtitle={prize.description}
                    content={prize.description}
                    imageUrl={prize.imageUrl}
                    pointsRequired={prize.points}
                    isCompleted={true}
                    userPoints={profile?.points || 0}
                    onCancel={() => handleCancel(prize)}
                    onCompleted={() => handleCompleted(prize)}
                    onCardPress={handleCardPress}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        )}
        
        <Portal>
          <Dialog visible={visible} onDismiss={() => setVisible(false)}>
            <Dialog.Title>Add New Reward</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Title"
                value={newPrize.title}
                onChangeText={(text) => setNewPrize(prev => ({...prev, title: text}))}
                style={styles.input}
              />
              <TextInput
                label="Description"
                value={newPrize.description}
                onChangeText={(text) => setNewPrize(prev => ({...prev, description: text}))}
                style={styles.input}
                multiline
              />
              <TextInput
                label="Points Required"
                value={newPrize.points.toString()}
                onChangeText={(text) => setNewPrize(prev => ({...prev, points: parseInt(text) || 0}))}
                keyboardType="numeric"
                style={styles.input}
              />
              
              <View style={styles.imageSection}>
                <Button 
                  mode="outlined" 
                  onPress={pickImage}
                  disabled={uploading}
                  icon={() => <FontAwesome5 name="image" size={24} color="black" />}
                  style={styles.imageButton}
                >
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </Button>
                
                {uploading && (
                  <View style={styles.uploadingContainer}>
                    <ActivityIndicator size="small" color="#6200ee" />
                    <Text style={styles.uploadingText}>Uploading to Cloudinary...</Text>
                  </View>
                )}
                
                {newPrize.imageUrl && !uploading && (
                  <View style={styles.imagePreview}>
                    <Text style={styles.imagePreviewText}>✓ Image uploaded</Text>
                    <IconButton
                      icon={() => <AntDesign name="closecircle" color="#ff1744" />}
                      size={16}
                      onPress={() => setNewPrize(prev => ({ ...prev, imageUrl: undefined }))}
                    />
                  </View>
                )}
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setVisible(false)}>Cancel</Button>
              <Button onPress={addNewCard} disabled={uploading}>Add</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        
        <FavButton onPress={() => setVisible(true)} />
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  pointsContainer: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  pointsText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    marginBottom: 8,
  },
  imageSection: {
    marginTop: 12,
  },
  imageButton: {
    marginVertical: 8,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  uploadingText: {
    marginLeft: 8,
    color: '#666',
  },
  imagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e8f5e9',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  imagePreviewText: {
    color: '#2e7d32',
    fontWeight: '500',
  },
  completedSection: {
    marginTop: 24,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6200ee',
  },
});

export default PrizesPage;

//TODO :: add ability to edit and delete prizes
//TODO :: improve UI/UX of the prizes page
//
