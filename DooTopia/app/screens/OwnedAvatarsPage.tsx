import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, Card, Text } from 'react-native-paper';
import { auth } from '../../FirebaseConfig';
import { getMongoUserByFirebaseId, getPrizes } from '../../backend/api';

const OwnedAvatarsPage = () => {
  const [avatars, setAvatars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const mongoUser = await getMongoUserByFirebaseId(user.uid);
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
              <Card key={avatar._id} style={styles.card}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.avatarWrapper}>
                    <Avatar.Image size={80} source={{ uri: avatar.imageUrl }} />
                  </View>
                  <Text style={styles.avatarTitle}>{avatar.title}</Text>
                  <Text style={styles.avatarSubtitle}>{avatar.subtitle}</Text>
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
});

export default OwnedAvatarsPage;