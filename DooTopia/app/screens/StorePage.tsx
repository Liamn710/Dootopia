import * as React from 'react';
import { StyleSheet, View, ScrollView, GestureResponderEvent, useWindowDimensions, Animated} from 'react-native';
import { Button, Dialog, Portal, TextInput, Card, IconButton, PaperProvider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

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


 

    const { width } = useWindowDimensions();
    

    const getCardWidth = () => {
        if (width < 400) {
            return '49%';
        }
        if (width < 768) {
            return '48%';
        } 
        return '33%';
    }

    const PictureCard =({imageUri}: {imageUri: string}) => {
        const scaleAnim = new Animated.Value(1);


        const onCartPress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.2,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };
        return (
            <Card style={[styles.picture_card, { width: getCardWidth() }]}>
                <Card.Cover source={{ uri: imageUri }} />
                <Card.Actions>
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <MaterialIcons name="shopping-cart" size={24} color="black" onPress={onCartPress} />
                    </Animated.View>
                </Card.Actions>
            </Card>
        );
    }

  return (
    <PaperProvider>
      <ScrollView>
        <View style={styles.container}></View>
        <View style={styles.picture_grid_container}>
                    <PictureCard imageUri='https://picsum.photos/300' />
                    <PictureCard imageUri='https://picsum.photos/300' />
                    <PictureCard imageUri='https://picsum.photos/200' />
                    <PictureCard imageUri='https://picsum.photos/300' />
                    <PictureCard imageUri='https://picsum.photos/200' />
                    <PictureCard imageUri='https://picsum.photos/300' />
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
  picture_grid_container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  picture_card: {
    marginVertical: 8,
  },
});

export default StorePage;

