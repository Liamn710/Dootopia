import React from 'react';
import { View, StyleSheet } from 'react-native';
import BottomTabNavigation from '../components/BottomTabNavigation';

const MainApp = () => {
  return (
    <View style={styles.container}>
      <BottomTabNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MainApp;