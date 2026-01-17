import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Checkbox, Text } from 'react-native-paper';
import { getUsers } from '../../backend/api';

interface User {
  _id: string;
  name?: string;
  email?: string;
  username?: string;
}

interface ShareRewardModalProps {
  visible: boolean;
  onClose: () => void;
  onShare: (selectedUserIds: string[]) => void;
  currentUserId: string;
  alreadySharedWith?: string[];
}

const ShareRewardModal: React.FC<ShareRewardModalProps> = ({
  visible,
  onClose,
  onShare,
  currentUserId,
  alreadySharedWith = [],
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadUsers();
      setSelectedUsers(alreadySharedWith);
    }
  }, [visible, alreadySharedWith]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getUsers();
      
      // Filter out the current user and handle error cases
      if (allUsers && !allUsers.error && Array.isArray(allUsers)) {
        const filteredUsers = allUsers.filter((user: User) => user._id !== currentUserId);
        setUsers(filteredUsers);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleShare = () => {
    if (selectedUsers.length === 0) {
      Alert.alert('No Users Selected', 'Please select at least one user to share with.');
      return;
    }
    onShare(selectedUsers);
    onClose();
  };

  const getUserDisplayName = (user: User) => {
    return user.name || user.username || user.email || 'Unknown User';
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Share Reward With</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6200ee" />
              <Text>Loading users...</Text>
            </View>
          ) : users.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No other users found</Text>
            </View>
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item) => item._id}
              style={styles.userList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.userItem}
                  onPress={() => toggleUser(item._id)}
                >
                  <Checkbox
                    status={selectedUsers.includes(item._id) ? 'checked' : 'unchecked'}
                    onPress={() => toggleUser(item._id)}
                  />
                  <Text style={styles.userName}>{getUserDisplayName(item)}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          <View style={styles.modalButtons}>
            <Button
              mode="contained"
              onPress={handleShare}
              disabled={selectedUsers.length === 0}
              style={styles.shareButton}
            >
              Share with {selectedUsers.length} {selectedUsers.length === 1 ? 'user' : 'users'}
            </Button>
            <Button
              mode="outlined"
              onPress={() => {
                setSelectedUsers(alreadySharedWith);
                onClose();
              }}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  userList: {
    maxHeight: 400,
    marginBottom: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  userName: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
    color: '#333',
  },
  modalButtons: {
    gap: 12,
  },
  shareButton: {
    marginBottom: 8,
  },
  cancelButton: {
    borderColor: '#6200ee',
  },
});

export default ShareRewardModal;
