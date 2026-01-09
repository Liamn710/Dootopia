
// This component will display individual avatars for sale based on the points the user has.
// It will show the avatar image, name, and price in points.
// Users can tap on the card to view more details or purchase the avatar if they have enough points.

import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Avatar, Button, Card, Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';


interface StoreCardProps {
  title: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  price: number;
  userPoints?: number; // Add user's current points for purchase validation
  onPurchase: () => void;
  onCardPress?: () => void;
  cardWidth?: number | string;          
  coverHeight?: number;                 
  cardStyle?: any;                      // allow external override
}
// try using ant design icons or material icons for the store icon
const LeftContent = (props: any) => <Avatar.Icon {...props} icon={() => <MaterialIcons name="store" size={20} color="white" />} />

export const StoreCard = ({
  title,
  subtitle,
  content,
  imageUrl ,
  price,
  userPoints = 0,
  onPurchase,
  onCardPress,
  cardWidth = '100%',        // default full width
  coverHeight = 200,         // default image height
  cardStyle
}: StoreCardProps) => {
  const canAfford = userPoints >= price;
   const { width: screenWidth } = useWindowDimensions();


  const responsiveWidth = React.useMemo(() => {
    if (cardWidth) return cardWidth; // explicit override
    if (screenWidth >= 1000) return '23%'; // ~4 per row with gaps
    if (screenWidth >= 760)  return '30%'; // 3 per row
    if (screenWidth >= 520)  return '46%'; // 2 per row
    return '100%';                        // 1 per row
  }, [screenWidth, cardWidth]);

  return (
    <Card style={styles.card} onPress={onCardPress}>
      <Card.Title title={title} subtitle={subtitle || ""} left={LeftContent} />
      <Card.Cover source={{ uri: imageUrl }} style={styles.cover} />
      <Card.Content>
        {content ? <Text variant="bodyMedium">{content}</Text> : null}
        <View style={styles.priceContainer}>
          <Text variant="headlineSmall" style={styles.priceText}>
            {price} points
          </Text>
        </View>
      </Card.Content>
      <Card.Actions>
        <Button 
          mode={canAfford ? "contained" : "outlined"}
          disabled={!canAfford}
          onPress={onPurchase}
          icon={() => <MaterialIcons name="shopping-cart" size={24} color="white" />}
        >
          {canAfford ? "Purchase" : "Not enough points"}
        </Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 10,

  },
  cover: {
    width: '100%',
  },
  priceContainer: {
    marginTop: 8,
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  priceText: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
});
export default StoreCard;