import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, Card, Text } from 'react-native-paper';
import { auth } from '../../FirebaseConfig';
import { getMongoUserByFirebaseId, getPrizes, selectUserAvatar } from '../../backend/api';

const OwnedAvatarsPage = () => {
  const [avatars, setAvatars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mongoUserId, setMongoUserId] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [updatingAvatarId, setUpdatingAvatarId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const mongoUser = await getMongoUserByFirebaseId(user.uid);
        setMongoUserId(mongoUser?._id ?? '');
        setSelectedAvatarId(mongoUser?.selectedAvatarId ?? null);
        const inventory = Array.isArray(mongoUser.inventory) ? mongoUser.inventory : [];
        const allPrizes = await getPrizes();
        // Filter only prizes the user owns
        const owned = allPrizes.filter((prize: any) => inventory.includes(prize._id));
        setAvatars(owned);
      } catch (e) {
        console.error('Failed to load avatars', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAvatars();
  }, []);

  const handleSelectAvatar = async (avatarId: string) => {
    if (!mongoUserId) {
      Alert.alert('Error', 'Could not determine your user profile.');
      return;
    }
    if (avatarId === selectedAvatarId || updatingAvatarId) {
      return;
    }

    try {
      setUpdatingAvatarId(avatarId);
      await selectUserAvatar(mongoUserId, avatarId);
      setSelectedAvatarId(avatarId);
    } catch (error) {
      console.error('Failed to update avatar', error);
      Alert.alert('Error', 'Unable to update avatar. Please try again.');
    } finally {
      setUpdatingAvatarId(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header with navigation buttons */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.back()}
        >
          <AntDesign name="arrowleft" size={20} color="#fff" />
          <Text style={styles.buttonText}>Profile</Text>
        </TouchableOpacity>

        <Text variant="headlineMedium" style={styles.title}>Your Avatars</Text>

        <TouchableOpacity
          style={[styles.navButton, styles.storeButton]}
          onPress={() => router.push('/screens/StorePage')}
        >
          <MaterialCommunityIcons name="store" size={20} color="#fff" />
          <Text style={styles.buttonText}>Store</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar collection */}
      <View style={styles.avatarsContainer}>
        {loading ? (
          <Text style={styles.messageText}>Loading...</Text>
        ) : avatars.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="emoticon-sad-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>You don't own any avatars yet.</Text>
            <Button
              mode="contained"
              onPress={() => router.push('/screens/StorePage')}
              style={styles.shopNowButton}
              buttonColor="#5A8A93"
            >
              Shop Now
            </Button>
          </View>
        ) : (
          <View style={styles.avatarGrid}>
            {avatars.map(avatar => (
              <Card
                key={avatar._id}
                style={[styles.card, avatar._id === selectedAvatarId && styles.cardSelected]}
              >
                <Card.Content style={styles.cardContent}>
                  <View style={[styles.avatarWrapper, avatar._id === selectedAvatarId && styles.avatarWrapperSelected]}>
                    <Avatar.Image size={80} source={{ uri: avatar.imageUrl }} />
                  </View>
                  <Text style={styles.avatarTitle}>{avatar.title}</Text>
                  <Text style={styles.avatarSubtitle}>{avatar.subtitle}</Text>
                  <Button
                    mode={avatar._id === selectedAvatarId ? 'contained' : 'outlined'}
                    style={styles.selectButton}
                    onPress={() => handleSelectAvatar(avatar._id)}
                    disabled={avatar._id === selectedAvatarId || updatingAvatarId === avatar._id}
                    loading={updatingAvatarId === avatar._id}
                    buttonColor={avatar._id === selectedAvatarId ? '#FF8C42' : undefined}
                    textColor={avatar._id === selectedAvatarId ? '#fff' : undefined}
                  >
                    {avatar._id === selectedAvatarId
                      ? 'In Use'
                      : updatingAvatarId === avatar._id
                      ? 'Setting...'
                      : 'Use Avatar'}
                  </Button>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  title: {
    fontWeight: 'bold',
    color: '#2d4150',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5A8A93',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  storeButton: {
    backgroundColor: '#FF8C42',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  avatarsContainer: {
    flex: 1,
  },
  messageText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  shopNowButton: {
    marginTop: 20,
    borderRadius: 12,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  card: {
    width: 160,
    marginVertical: 10,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    backgroundColor: '#fff',
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#FF8C42',
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatarWrapper: {
    borderWidth: 3,
    borderColor: '#5A8A93',
    borderRadius: 50,
    padding: 3,
    marginBottom: 8,
  },
  avatarWrapperSelected: {
    borderColor: '#FF8C42',
  },
  avatarTitle: {
    marginTop: 8,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#2d4150',
  },
  avatarSubtitle: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  selectButton: {
    marginTop: 12,
    alignSelf: 'stretch',
    borderRadius: 12,
  },
});

export default OwnedAvatarsPage;