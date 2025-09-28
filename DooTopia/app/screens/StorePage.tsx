import { StoreCard } from "../components/StoreCard";

import { ScrollView, View } from "react-native";
import { useState } from "react";

export default function StorePage() {
  const [userPoints, setUserPoints] = useState(150); // Example user points

  const handlePurchase = (itemPrice: number) => {
    if (userPoints >= itemPrice) {
      setUserPoints(userPoints - itemPrice);
      alert("Purchase successful!");
    } else {
      alert("Not enough points to make this purchase.");
    }
  };

  return (
    <ScrollView>
    <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-around" }}>
      <StoreCard
        title="Premium Avatar"
        subtitle="Exclusive avatar for your profile"
        content="Unlock a unique avatar to personalize your profile."
        price={100}
        userPoints={userPoints}
        imageUrl="https://gravatar.com/avatar/61600195df7c1d2452d37adf64c66fa6?s=400&d=robohash&r=x" // Example image URL
        onPurchase={() => handlePurchase(100)}
      />
      <StoreCard
        title="Extra Storage"
        subtitle="Increase your storage limit"
        content="Get more space to save your tasks and rewards."
        price={200}
        userPoints={userPoints}
        imageUrl="https://gravatar.com/avatar/0bfb5a0b8c6fa1819314ba32430072e0?s=400&d=robohash&r=x" // Example image URL
        onPurchase={() => handlePurchase(200)}
      />
      <StoreCard
        title="Ad-Free Experience"
        subtitle="Enjoy the app without ads"
        content="Remove all ads for a smoother experience."
        price={300}
        userPoints={userPoints}
        imageUrl="https://gravatar.com/avatar/1d6c8044229e10d5fc51d275e9055c06?s=400&d=robohash&r=x" // Example image URL
        onPurchase={() => handlePurchase(300)}
      />
    </View>
    </ScrollView>
  );
}

//make the page work as grid with 2 columns


