
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import FavButton from '../components/FavButton';
import { PrizeCard } from '../components/PrizeCard';

const PrizesPage = () => {
  


  const addNewCard = () => {
    console.log('Add new card pressed');
    
  }

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
    <View style={styles.container}>
      <PrizeCard
        title="Hot Springs"
        subtitle=""
        content="an enjoyable flight to the hotsprings in neverlands for all myhard work and determination."
        onCancel={handleCancel}
        onCompleted={handleOk}
        onCardPress={handleCardPress}
      />
      <FavButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'flex-start',
    padding: 16,
  },
});

export default PrizesPage;
