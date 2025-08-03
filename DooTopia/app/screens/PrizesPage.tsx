
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { PrizeCard } from '../components/PrizeCars';

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
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
});

export default PrizesPage;
