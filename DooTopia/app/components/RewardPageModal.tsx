import React from 'react';
import { Image, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

interface RewardPageModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (reward: { title: string; description: string; points: number; imageUri?: string }) => void;
  owner?: string; // optional owner id for backend
}

const RewardPageModal: React.FC<RewardPageModalProps> = ({ visible, onClose, onAdd }) => {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [points, setPoints] = React.useState('');
  const [imageUri, setImageUri] = React.useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = React.useState(false);

  const reset = () => {
    setTitle('');
    setDescription('');
    setPoints('');
    setImageUri(undefined);
  };

  const handleAdd = async () => {
    if (!title.trim() || !points.trim()) return;
    const reward = { title: title.trim(), description: description.trim(), points: parseInt(points) || 0, imageUri };
    setSubmitting(true);
    try {
      onAdd(reward);
      reset();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={() => { if (!submitting) onClose(); }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add New Reward</Text>
          <TextInput
            style={styles.input}
            placeholder="Reward Title"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TextInput
            style={styles.input}
            placeholder="Points Cost"
            value={points}
            onChangeText={setPoints}
            keyboardType="numeric"
          />
          {/* Future: image picker integration. Keeping placeholder for consistent layout */}
          {imageUri ? (
            <TouchableOpacity onPress={() => setImageUri(undefined)} style={styles.imagePreviewWrapper}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <Text style={styles.removeImageText}>Remove image</Text>
            </TouchableOpacity>
          ) : null}
          <View style={styles.modalButtons}>
            <Button mode="contained" onPress={handleAdd} disabled={!title || !points || submitting} loading={submitting}>
              Add
            </Button>
            <Button mode="outlined" onPress={() => { if (!submitting) { onClose(); reset(); } }} style={{ marginLeft: 10 }}>
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
    backgroundColor: 'rgba(90, 138, 147, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#5A8A93',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5A8A93',
    marginBottom: 18,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#EAF6F9',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#9DBCC3',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  imagePreviewWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 6,
  },
  removeImageText: {
    color: '#b00',
    fontSize: 14,
  },
});

export default RewardPageModal;
//create a pop up modal for adding a new reward ,similar to AddTaskModal.tsx
