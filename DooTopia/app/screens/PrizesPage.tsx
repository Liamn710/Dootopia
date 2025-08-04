
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { PrizeCard } from '../components/PrizeCard';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';


const PrizesPage = () => {
  
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
