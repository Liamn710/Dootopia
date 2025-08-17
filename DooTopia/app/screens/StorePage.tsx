import { MaterialIcons } from '@expo/vector-icons';
import * as React from 'react';
import { Animated, GestureResponderEvent, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Card, PaperProvider } from 'react-native-paper';

import { memo, useCallback } from 'react';



const StorePage = memo(() => {
    function handleImagePick(e: GestureResponderEvent): void {
        throw new Error('Function not implemented.');
    }

    const { width } = useWindowDimensions();
    
    const getCardWidth = useCallback(() => {
        if (width < 400) {
            return '49%';
        }
        if (width < 768) {
            return '48%';
        } 
        return '33%';
    }, [width]);

    const PictureCard = memo(({imageUri,text}: {imageUri: string,text: {title: string, subtitle: string}}) => {
        const scaleAnim = new Animated.Value(1);

        const onCartPress = useCallback(() => {
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
        }, [scaleAnim]);

        return (
            <Card style={[styles.picture_card, { width: getCardWidth() }]}>
                <Card.Cover source={{ uri: imageUri }} />
                <Card.Title title={text.title} subtitle={text.subtitle} />
                <Card.Actions>
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <MaterialIcons name="shopping-cart" size={24} color="black" onPress={onCartPress} />
                    </Animated.View>
                </Card.Actions>
                
            </Card>
        );
    });

  return (
    <PaperProvider>
      <ScrollView>
        <View style={styles.container}></View>
        <View style={styles.picture_grid_container}>
                    <PictureCard imageUri='https://picsum.photos/300' text={{ title: 'Title 1', subtitle: 'Subtitle 1' }} />
                    <PictureCard imageUri='https://picsum.photos/300' text={{ title: 'Title 2', subtitle: 'Subtitle 2' }} />
                    <PictureCard imageUri='https://picsum.photos/200' text={{ title: 'Title 3', subtitle: 'Subtitle 3' }} />
                    <PictureCard imageUri='https://picsum.photos/300' text={{ title: 'Title 4', subtitle: 'Subtitle 4' }} />
                    <PictureCard imageUri='https://picsum.photos/200' text={{ title: 'Title 5', subtitle: 'Subtitle 5' }} />
                    <PictureCard imageUri='https://picsum.photos/300' text={{ title: 'Title 6', subtitle: 'Subtitle 6' }} />
        </View>
      </ScrollView>

    </PaperProvider>
  );
});

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

