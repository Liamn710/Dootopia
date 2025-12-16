import { getMongoUserByFirebaseId, getPrizes, updateUser } from "@/backend/api";
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { auth } from "../../FirebaseConfig";
import { StoreCard } from "../components/StoreCard";

type StorePrize = {
  _id: string;
  title: string;
  subtitle?: string;
  content?: string;
  price: number;
  imageUrl?: string;
};

export default function StorePage() {
  const [userPoints, setUserPoints] = useState(150);
  const [mongoUserId, setMongoUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [prizes, setPrizes] = useState<StorePrize[]>([]);
  const [inventory, setInventory] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadUserPointsAndPrizes = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (uid) {
          const mongoUser = await getMongoUserByFirebaseId(uid);
          setMongoUserId(mongoUser._id);
          setUserPoints(mongoUser.points ?? 0);
          setInventory(Array.isArray(mongoUser.inventory) ? mongoUser.inventory : []);
        }
        const fetchedPrizes = await getPrizes();
        setPrizes(Array.isArray(fetchedPrizes) ? fetchedPrizes : []);
      } catch (e) {
        console.error("Failed loading user points or prizes", e);
      } finally {
        setLoading(false);
      }
    };
    loadUserPointsAndPrizes();
  }, []);

  const handlePurchase = async (itemPrice: number, prizeId: string) => {
    if (loading || updating) return;
    if (userPoints < itemPrice) {
      alert("Not enough points to make this purchase.");
      return;
    }
    try {
      setUpdating(true);
      await updateUser(mongoUserId, { 
        $inc: { points: -itemPrice },
        $push: { inventory: prizeId }
      });
      setUserPoints(p => p - itemPrice);
      setInventory(prev => [...prev, prizeId]);
      alert("Purchase successful!");
    } catch (e) {
      console.error("Purchase failed", e);
      alert("Purchase failed. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Filter prizes: only show if title is not in inventory
  const filteredPrizes = prizes.filter(
    prize => !inventory.includes(prize._id)
  );

  return (
    <ScrollView contentContainerStyle={{ paddingVertical: 12 }}>
      {/* Header with back button */}
      <View style={{ 
        paddingHorizontal: 16, 
        marginBottom: 12, 
        flexDirection: "row", 
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{ 
              marginRight: 12,
              padding: 8,
              borderRadius: 20,
              backgroundColor: '#f0f0f0'
            }}
          >
            <AntDesign name="arrowleft" size={20} color="#2d6d73" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "600" }}>Store</Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: "500", color: "#2d6d73" }}>
          Points: {userPoints}{updating ? " ..." : ""}
        </Text>
      </View>

      {/* Store items */}
      <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", justifyContent: "space-around" }}>
        {filteredPrizes.length === 0 && !loading && (
          <Text style={{ textAlign: "center", marginTop: 24 }}>No prizes available.</Text>
        )}
        {filteredPrizes.map(prize => (
          <StoreCard
            key={prize._id}
            title={prize.title}
            subtitle={prize.subtitle}
            content={prize.content}
            price={prize.price}
            userPoints={userPoints}
            imageUrl={prize.imageUrl}
            onPurchase={() => handlePurchase(prize.price, prize._id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

//TODO :: Make the StoreCard responsive to different screen sizes
// TODO :: connect to backend to get real user points and items



