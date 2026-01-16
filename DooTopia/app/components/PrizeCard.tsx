import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Text, Chip } from 'react-native-paper';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
//include ant design icons
import { AntDesign } from '@expo/vector-icons';




interface PrizeCardProps {
  title: string;
  subtitle: string;
  content: string;
  imageUrl?: string;
  pointsRequired: number;
  isCompleted: boolean;
  userPoints: number;
  onCancel: () => void;
  onCompleted: () => void;
  onCardPress?: () => void;
}

const LeftContent = (props: any) => <Avatar.Icon {...props} icon={() => <AntDesign name="gift" size={20} color="white" />} />;

export const PrizeCard: React.FC<PrizeCardProps> = ({
  title,
  subtitle,
  content,
  imageUrl = 'https://picsum.photos/700',
  pointsRequired,
  isCompleted,
  userPoints,
  onCancel,
  onCompleted,
  onCardPress
}) => {
  const hasEnoughPoints = userPoints >= pointsRequired;

  return (
    <Card onPress={onCardPress} style={[styles.card, isCompleted ? styles.completedCard : undefined]}>
      <Card.Title title={title} subtitle={subtitle} left={LeftContent} />
      <Card.Content>
        <Text variant="titleLarge">{title}</Text>
        <Text variant="bodyMedium">{content}</Text>
        <View style={styles.pointsChipContainer}>
          <Chip 
            icon={() => <AntDesign name="star" size={20} color="white" />}
            style={[
              styles.pointsChip,
              !hasEnoughPoints && !isCompleted && styles.insufficientPoints
            ]}
          >
            {pointsRequired} points required
          </Chip>
          {!hasEnoughPoints && !isCompleted && (
            <Text style={styles.warningText}>
              Need {pointsRequired - userPoints} 
            </Text>
          )}
          {isCompleted && (
            <Chip icon={() => <AntDesign name="check" size={20} color="white" />} style={styles.completedChip}>
              Completed
            </Chip>
          )}
        </View>
      </Card.Content>
      <Card.Cover source={{ uri: imageUrl }} />
      <Card.Actions style={styles.cardActions}>
        <Button 
          onPress={onCancel}
          disabled={isCompleted}
          mode="outlined"
          textColor="#d32f2f"
          buttonColor="#fff"
          style={styles.deleteButton}
        >
          Delete
        </Button>
        <Button 
          onPress={onCompleted}
          disabled={!hasEnoughPoints || isCompleted}
          mode={hasEnoughPoints && !isCompleted ? 'contained' : 'text'}
          style={styles.completeButton}
        >
          {isCompleted ? 'Completed' : 'Complete'}
        </Button>
      </Card.Actions>
    </Card>
  );
};

 const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  completedCard: {
    backgroundColor: '#e0e0e0',
    opacity: 0.7,
  },
  pointsChipContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  pointsChip: {
    backgroundColor: '#6200ee',
  },
  insufficientPoints: {
    backgroundColor: '#ff6b6b',
  },
  completedChip: {
    backgroundColor: '#4caf50',
  },
  warningText: {
    color: '#ff6b6b',
    fontSize: 12,
    fontStyle: 'italic',
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  deleteButton: {
    borderColor: '#d32f2f',
    borderWidth: 1,
  },
  completeButton: {
    minWidth: 100,
  },
});
