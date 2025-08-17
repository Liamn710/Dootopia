import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomTabNavigation from '../components/BottomTabNavigation';

const MainApp = memo(() => {
  return (
    <View style={styles.container}>
      <BottomTabNavigation />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MainApp;