import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Text, Chip } from 'react-native-paper';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';




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

const LeftContent = (props: any) => <Avatar.Icon {...props} icon="medal" />

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
            icon="star" 
            style={[
              styles.pointsChip,
              !hasEnoughPoints && !isCompleted && styles.insufficientPoints
            ]}
          >
            {pointsRequired} points required
          </Chip>
          {!hasEnoughPoints && !isCompleted && (
            <Text style={styles.warningText}>
              Need {pointsRequired - userPoints} more points
            </Text>
          )}
          {isCompleted && (
            <Chip icon="check" style={styles.completedChip}>
              Completed
            </Chip>
          )}
        </View>
      </Card.Content>
      <Card.Cover source={{ uri: imageUrl }} />
      <Card.Actions>
        <Button 
          onPress={onCancel}
          disabled={!isCompleted}
        >
          Fail
        </Button>
        <Button 
          onPress={onCompleted}
          disabled={!hasEnoughPoints || isCompleted}
          mode={hasEnoughPoints && !isCompleted ? 'contained' : 'text'}
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
});
