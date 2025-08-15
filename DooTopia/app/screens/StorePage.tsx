import * as React from 'react';
import { StyleSheet, View, ScrollView, GestureResponderEvent} from 'react-native';
import { Button, Dialog, Portal, TextInput, Card, IconButton, PaperProvider } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { auth } from '../../FirebaseConfig'; // Adjust path if needed
import { router ,Tabs } from 'expo-router';
import { signOut } from 'firebase/auth';
import BottomTabNavigation from '../components/BottomTabNavigation';

const StorePage = () => {
    function handleImagePick(e: GestureResponderEvent): void {
        throw new Error('Function not implemented.');
    }

  return (
    <PaperProvider>
      <ScrollView>
        <View style={styles.container}>
        </View>
      </ScrollView>

    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});

export default StorePage;

