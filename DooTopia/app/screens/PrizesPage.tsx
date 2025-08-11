
import * as React from 'react';
import { StyleSheet, View, ScrollView} from 'react-native';
import { Button, Dialog, Portal, TextInput, Card, IconButton, PaperProvider } from 'react-native-paper';
import FavButton from '../components/FavButton';
import { PrizeCard } from '../components/PrizeCard';
import * as ImagePicker from 'expo-image-picker';



export interface Prize {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  imageUrl?: string;
  isCompleted: boolean;
  pointsRequired: number;
}


const PrizesPage = () => {
  const [visible, setVisible] = React.useState(false);
  const [prizes, setPrizes] = React.useState<Prize[]>([]);
  const [newPrize, setNewPrize] = React.useState<Prize>({
    id: '',
    title: '',
    subtitle: '',
    content: '',
    isCompleted: false,
    pointsRequired: 0,
  });
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setNewPrize(prev => ({ ...prev, imageUrl: result.assets[0].uri }));
    }
  };

  const addNewCard = () => {
     if (newPrize.title.trim() && newPrize.content.trim()) {
      const prizeToAdd: Prize = {
        ...newPrize,
        id: Date.now().toString(),
      };
      
      setPrizes([...prizes, prizeToAdd]);
      
      setNewPrize({
        id: '',
        title: '',
        subtitle: '',
        content: '',
        isCompleted: false,
        pointsRequired: 0,
      });
      setVisible(false);
     }
  };

  const handleCancel = () => {
    console.log('Cancel pressed');
  };

  const handleOk = () => {
    console.log('Ok pressed');
  };

  const handleCardPress = () => {
    console.log('Card pressed');
  };

 return (
  <PaperProvider>
    <View style={styles.container}>
      <ScrollView>
        {prizes.map(prize => (
          <PrizeCard
            key={prize.id}
            title={prize.title}
            subtitle={prize.subtitle}
            content={prize.content}
            onCancel={handleCancel}
            onCompleted={handleOk}
            onCardPress={handleCardPress}
          />
        ))}
      </ScrollView>
      
      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>Add New Prize</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Title"
              value={newPrize.title}
              onChangeText={(text) => setNewPrize(prev => ({...prev, title: text}))}
            />
            <TextInput
              label="Content"
              value={newPrize.content}
              onChangeText={(text) => setNewPrize(prev => ({...prev, content: text}))}
            />
            <TextInput
              label="Points Required"
              value={newPrize.pointsRequired.toString()}
              onChangeText={(text) => setNewPrize(prev => ({...prev, pointsRequired: parseInt(text) || 0}))}
              keyboardType="numeric"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Cancel</Button>
            <Button onPress={addNewCard}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      <FavButton onPress={() => setVisible(true)} />
    </View>
  </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
export default PrizesPage;
