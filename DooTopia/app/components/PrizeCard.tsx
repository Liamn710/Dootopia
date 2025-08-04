import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Avatar, Button, Card, Text } from 'react-native-paper';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';




interface PrizeCardProps {
  title: string;
  subtitle: string;
  content: string;
  imageUrl?: string;
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
  onCancel,
  onCompleted,
  onCardPress
}) => {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleCompleted = () => {
    setIsCompleted(!isCompleted);
    onCompleted();
  };

  return (
    <Card onPress={onCardPress} style={isCompleted ? styles.completedCard : undefined}>
      <Card.Title title={title} subtitle={subtitle} left={LeftContent} />
      <Card.Content>
        <Text variant="titleLarge">{title}</Text>
        <Text variant="bodyMedium">{content}</Text>
      </Card.Content>
      <Card.Cover source={{ uri: imageUrl }} />
      <Card.Actions>
        <Button onPress={onCancel}>Fail</Button>
        <Button onPress={handleCompleted}>Completed</Button>
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
});
