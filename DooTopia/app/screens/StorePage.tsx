import { MaterialIcons } from '@expo/vector-icons';
import * as React from 'react';
import { Animated, GestureResponderEvent, Image, ImageSourcePropType, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Card, PaperProvider } from 'react-native-paper';

import { memo, useCallback } from 'react';



const StorePage = memo(() => {
    function handleImagePick(e: GestureResponderEvent): void {
        throw new Error('Function not implemented.');
    }

    const { width } = useWindowDimensions();
    
    const getCardWidth = useCallback(() => {
        if (width < 400) {
            return '45%';
        }
        if (width < 768) {
            return '30%';
        } 
        return '20%';
    }, [width]);

    const PictureCard = memo(({image,text}: {image: ImageSourcePropType,text: {title: string, subtitle: string}}) => {
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
                <View style={styles.image_container}>
                    <Image 
                        source={ image } 
                        style={styles.card_cover}
                        resizeMode="contain"
                    />
                </View>
                <Card.Title 
                    title={text.title} 
                    subtitle={text.subtitle} 
                    titleStyle={styles.card_title}
                    subtitleStyle={styles.card_subtitle}
                />
                <Card.Actions style={styles.card_actions}>
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <MaterialIcons name="shopping-cart" size={24} color="black" onPress={onCartPress} />
                    </Animated.View>
                </Card.Actions>
            </Card>
        );
    });

  return (
    <PaperProvider>
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.picture_grid_container}>
          <PictureCard image={require('../../assets/images/avatar.png')} text={{ title: 'Title 1', subtitle: 'Subtitle 1' }} />
          <PictureCard image={require('../../assets/images/hippo.svg')} text={{ title: 'Title 2', subtitle: 'Subtitle 2' }} />
          <PictureCard image={require('../../assets/images/cow.svg')} text={{ title: 'Title 3', subtitle: 'Subtitle 3' }} />
          <PictureCard image={require('../../assets/images/cat.svg')} text={{ title: 'Title 4', subtitle: 'Subtitle 4' }} />
          <PictureCard image={require('../../assets/images/bear.svg')} text={{ title: 'Title 5', subtitle: 'Subtitle 5' }} />
          <PictureCard image={require('../../assets/images/monkey.svg')} text={{ title: 'Title 6', subtitle: 'Subtitle 6' }} />
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
    alignItems: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 16,
  },
  image_container: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
    marginBottom: 8,
  },
  card_cover: {
    width: 80,
    height: 80,
  },
  picture_card: {
    marginBottom: 16,
    marginHorizontal: 4,
    minHeight: 200,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderRadius: 8,
  },
  card_title: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 'bold',
  },
  card_subtitle: {
    textAlign: 'center',
    fontSize: 11,
  },
  card_actions: {
    justifyContent: 'center',
    paddingTop: 4,
    paddingBottom: 12,
  }
});

export default StorePage;

