import React from 'react';
import { Avatar, Button, Card, Text } from 'react-native-paper';



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
  return (
    <Card onPress={onCardPress}>
      <Card.Title title={title} subtitle={subtitle} left={LeftContent} />
      <Card.Content>
        <Text variant="titleLarge">{title}</Text>
        <Text variant="bodyMedium">{content}</Text>
      </Card.Content>
      <Card.Cover source={{ uri: imageUrl }} />
      <Card.Actions>
        <Button onPress={onCancel}>Fail 💩</Button>
        <Button onPress={onCompleted}>Completed</Button>
      </Card.Actions>
    </Card>
  );
};