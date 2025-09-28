//TODO:: Implement the StoreCard component
// This component will display individual avatars for sale based on the points the user has.
// It will show the avatar image, name, and price in points.
// Users can tap on the card to view more details or purchase the avatar if they have enough points.

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Text } from 'react-native-paper';

interface StoreCardProps {
  title: string;
  subtitle: string;
  content: string;
  imageUrl?: string;
  price: number;
  userPoints?: number; // Add user's current points for purchase validation
  onPurchase: () => void;
  onCardPress?: () => void;
}

const LeftContent = (props: any) => <Avatar.Icon {...props} icon="store" />

export const StoreCard = ({
  title,
  subtitle,
  content,
  imageUrl ,
  price,
  userPoints = 0,
  onPurchase,
  onCardPress
}: StoreCardProps) => {
  const canAfford = userPoints >= price;

  return (
    <Card style={styles.card} onPress={onCardPress}>
      <Card.Title title={title} subtitle={subtitle} left={LeftContent} />
      <Card.Cover source={{ uri: imageUrl }} style={styles.cover} />
      <Card.Content>
        <Text variant="bodyMedium">{content}</Text>
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
          icon="shopping"
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
    height: 200,
    //fill
    resizeMode: 'cover',
    width: '100%',
    
  },
  priceContainer: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  priceText: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});
