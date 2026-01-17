import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Chip, Text } from 'react-native-paper';
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
  onShare?: () => void; // New prop for share functionality
  isOwner?: boolean; // Whether current user is the owner
  isShared?: boolean; // Whether this reward was shared with current user
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
  onCardPress,
  onShare,
  isOwner = true,
  isShared = false
}) => {
  const hasEnoughPoints = userPoints >= pointsRequired;

  return (
    <Card onPress={onCardPress} style={[styles.card, isCompleted ? styles.completedCard : undefined]}>
      <Card.Title 
        title={title} 
        subtitle={subtitle} 
        left={LeftContent}
        right={(props) => (
          <>
            {isShared && (
              <Chip 
                icon={() => <AntDesign name="sharealt" size={16} color="#6200ee" />}
                style={styles.sharedBadge}
                textStyle={styles.sharedBadgeText}
              >
                Shared
              </Chip>
            )}
            {isOwner && onShare && !isCompleted && (
              <Button 
                {...props}
                onPress={onShare}
                mode="text"
                icon={() => <AntDesign name="sharealt" size={18} color="#6200ee" />}
                compact
              >
                Share
              </Button>
            )}
          </>
        )}
      />
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
          {isOwner ? 'Delete' : 'Remove'}
        </Button>
        <Button 
          onPress={onCompleted}
          disabled={!hasEnoughPoints || isCompleted}
          mode={hasEnoughPoints && !isCompleted ? 'contained' : 'text'}
          style={styles.completeButton}
        >
          {isCompleted ? 'Completed' : isShared ? 'Claim' : 'Complete'}
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
  sharedBadge: {
    backgroundColor: '#e3f2fd',
    marginRight: 8,
  },
  sharedBadgeText: {
    color: '#6200ee',
    fontSize: 12,
  },
});
