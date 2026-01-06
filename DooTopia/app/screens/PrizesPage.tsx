import * as React from 'react';
import { StyleSheet, View, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Button, Dialog, Portal, TextInput, Card, IconButton, PaperProvider, Text } from 'react-native-paper';
import FavButton from '../components/FavButton';
import { PrizeCard } from '../components/PrizeCard';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '../utils/cloudinary';

export interface Prize {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  imageUrl?: string;
  isCompleted: boolean;
  pointsRequired: number;
}

const PrizesPage = () => {
  const [visible, setVisible] = React.useState(false);
  const [prizes, setPrizes] = React.useState<Prize[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [newPrize, setNewPrize] = React.useState<Prize>({
    id: '',
    title: '',
    subtitle: '',
    content: '',
    isCompleted: false,
    pointsRequired: 0,
  });

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

  const addNewCard = () => {
    if (newPrize.title.trim() && newPrize.content.trim()) {
      const prizeToAdd: Prize = {
        ...newPrize,
        id: Date.now().toString(),
      };
      
      setPrizes([...prizes, prizeToAdd]);
      
      setNewPrize({
        id: '',
        title: '',
        subtitle: '',
        content: '',
        isCompleted: false,
        pointsRequired: 0,
      });
      setVisible(false);
    } else {
      Alert.alert('Missing Information', 'Please fill in title and content');
    }
  };

  const handleCancel = () => {
    console.log('Cancel pressed');
  };

  const handleOk = () => {
    console.log('Ok pressed');
  };

  const handleCardPress = () => {
    console.log('Card pressed');
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <ScrollView>
          {prizes.map(prize => (
            <PrizeCard
              key={prize.id}
              title={prize.title}
              subtitle={prize.subtitle}
              content={prize.content}
              imageUrl={prize.imageUrl}
              onCancel={handleCancel}
              onCompleted={handleOk}
              onCardPress={handleCardPress}
            />
          ))}
        </ScrollView>
        
        <Portal>
          <Dialog visible={visible} onDismiss={() => setVisible(false)}>
            <Dialog.Title>Add New Prize</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Title"
                value={newPrize.title}
                onChangeText={(text) => setNewPrize(prev => ({...prev, title: text}))}
                style={styles.input}
              />
              <TextInput
                label="Subtitle"
                value={newPrize.subtitle}
                onChangeText={(text) => setNewPrize(prev => ({...prev, subtitle: text}))}
                style={styles.input}
              />
              <TextInput
                label="Content"
                value={newPrize.content}
                onChangeText={(text) => setNewPrize(prev => ({...prev, content: text}))}
                style={styles.input}
                multiline
              />
              <TextInput
                label="Points Required"
                value={newPrize.pointsRequired.toString()}
                onChangeText={(text) => setNewPrize(prev => ({...prev, pointsRequired: parseInt(text) || 0}))}
                keyboardType="numeric"
                style={styles.input}
              />
              
              <View style={styles.imageSection}>
                <Button 
                  mode="outlined" 
                  onPress={pickImage}
                  disabled={uploading}
                  icon="image"
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
                      icon="close"
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
});

export default PrizesPage;

//TODO :: connect to a cloud service for saving prizes and loading them
//TODO :: add ability to edit and delete prizes
//TODO :: improve UI/UX of the prizes page
