
import * as ImagePicker from 'expo-image-picker';
import * as React from 'react';
import { memo, useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, PaperProvider, Portal, TextInput } from 'react-native-paper';
import FavButton from '../components/FavButton';
import { PrizeCard } from '../components/PrizeCard';



export interface Prize {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  imageUrl?: string;
  isCompleted: boolean;
  pointsRequired: number;
}


const PrizesPage = memo(() => {
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
  
  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setNewPrize(prev => ({ ...prev, imageUrl: result.assets[0].uri }));
    }
  }, []);

  const addNewCard = useCallback(() => {
     if (newPrize.title.trim() && newPrize.content.trim()) {
      const prizeToAdd: Prize = {
        ...newPrize,
        id: Date.now().toString(),
      };
      
      setPrizes(prev => [...prev, prizeToAdd]);
      
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
  }, [newPrize]);

  const handleCancel = useCallback(() => {
    console.log('Cancel pressed');
  }, []);

  const handleOk = useCallback(() => {
    console.log('Ok pressed');
  }, []);

  const handleCardPress = useCallback(() => {
    console.log('Card pressed');
  }, []);

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
});

export default PrizesPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
