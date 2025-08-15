import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

interface FavButtonProps {
  onPress: () => void;
}

const FavButton: React.FC<FavButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <MaterialIcons 
        name="add"
        size={30}
        color="white"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#6200ee',
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default FavButton;