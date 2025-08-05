import React from 'react';
import { StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import AntDesign from 'react-native-vector-icons/AntDesign';


const FavButton = () => (
  <FAB
    icon={() => <AntDesign name="plus" size={24} color="white" />}
    style={styles.fab}
    onPress={() => console.log('Pressed')}
  />
);

const styles = StyleSheet.create({
  fab: {
    color: 'white',
    backgroundColor: '#6200EE',
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default FavButton;