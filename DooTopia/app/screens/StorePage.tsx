import { StoreCard } from "../components/StoreCard";
import { ScrollView, View ,Text,ActivityIndicator} from "react-native";
import { useEffect,useState } from "react";
import {auth} from "../../FirebaseConfig";
import { getMongoUserByFirebaseId,updateUser } from "@/backend/api";


export default function StorePage() {
  const [userPoints, setUserPoints] = useState(150); // Example user points
  const [mongoUserId, setMongoUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadUserPoints = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          setLoading(false);
          return;
        }
        const mongoUser = await getMongoUserByFirebaseId(uid);
        setMongoUserId(mongoUser._id);
        setUserPoints(mongoUser.points ?? 0);
      } catch (e) {
        console.error("Failed loading user points", e);
      } finally {
        setLoading(false);
      }
    };
    loadUserPoints();
  }, []);

  const handlePurchase = async (itemPrice: number) => {
    if (loading || updating) return;
    if (userPoints < itemPrice) {
      alert("Not enough points to make this purchase.");
      return;
    }
    try {
      setUpdating(true);
      await updateUser(mongoUserId, { $inc: { points: -itemPrice } });
      setUserPoints(p => p - itemPrice);
      alert("Purchase successful!");
    } catch (e) {
      console.error("Purchase failed", e);
      alert("Purchase failed. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

    return (
    <ScrollView contentContainerStyle={{ paddingVertical: 12 }}>
      <View style={{ paddingHorizontal: 16, marginBottom: 12, flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Store</Text>
        <Text style={{ fontSize: 16, fontWeight: "500", color: "#2d6d73" }}>
          Points: {userPoints}{updating ? " ..." : ""}
        </Text>
      </View>
      <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", justifyContent: "space-around" }}>
        <StoreCard
          title="Premium Avatar"
          subtitle="Exclusive avatar for your profile"
          content="Unlock a unique avatar to personalize your profile."
          price={100}
          userPoints={userPoints}
          imageUrl="https://gravatar.com/avatar/61600195df7c1d2452d37adf64c66fa6?s=400&d=robohash&r=x"
          onPurchase={() => handlePurchase(100)}
        />
        <StoreCard
          title="Extra Storage"
          subtitle="Increase your storage limit"
          content="Get more space to save your tasks and rewards."
          price={200}
          userPoints={userPoints}
          imageUrl="https://gravatar.com/avatar/0bfb5a0b8c6fa1819314ba32430072e0?s=400&d=robohash&r=x"
          onPurchase={() => handlePurchase(200)}
        />
        <StoreCard
          title="Ad-Free Experience"
          subtitle="Enjoy the app without ads"
          content="Remove all ads for a smoother experience."
          price={300}
          userPoints={userPoints}
          imageUrl="https://gravatar.com/avatar/1d6c8044229e10d5fc51d275e9055c06?s=400&d=robohash&r=x"
          onPurchase={() => handlePurchase(300)}
        />
        <StoreCard
          title="Custom Themes"
          subtitle="Personalize the app's appearance"
          content="Choose from a variety of themes to customize your app."
          price={150}
          userPoints={userPoints}
          imageUrl="https://gravatar.com/avatar/2c7b3f4e5e6f7a8b9c0d1e2f3a4b5c6d?s=400&d=robohash&r=x"
          onPurchase={() => handlePurchase(150)}
        />
        <StoreCard
          title="Priority Support"
          subtitle="Get help faster"
          content="Access priority customer support for any issues."
          price={250}
          userPoints={userPoints}
          imageUrl="https://gravatar.com/avatar/3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b?s=400&d=robohash&r=x"
          onPurchase={() => handlePurchase(250)}
        />
      </View>
    </ScrollView>
  );
}

//TODO :: Make the StoreCard responsive to different screen sizes
// TODO :: connect to backend to get real user points and items



