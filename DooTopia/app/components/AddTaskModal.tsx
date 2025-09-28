import React from 'react';
import { Modal, StyleSheet, TextInput, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: () => void;
  taskTitle: string;
  setTaskTitle: (text: string) => void;
  taskText: string;
  setTaskText: (text: string) => void;
  taskPoints: string;
  setTaskPoints: (text: string) => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  visible,
  onClose,
  onAdd,
  taskTitle,
  setTaskTitle,
  taskText,
  setTaskText,
  taskPoints,
  setTaskPoints,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add New Task</Text>
          <TextInput
            style={styles.input}
            placeholder="Task Title"
            value={taskTitle}
            onChangeText={setTaskTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Task Description"
            value={taskText}
            onChangeText={setTaskText}
          />
          <TextInput
            style={styles.input}
            placeholder="Points"
            value={taskPoints}
            onChangeText={setTaskPoints}
            keyboardType="numeric"
          />
          <View style={styles.modalButtons}>
            <Button mode="contained" onPress={onAdd} disabled={!taskTitle || !taskPoints}>
              Add
            </Button>
            <Button mode="outlined" onPress={onClose} style={{ marginLeft: 10 }}>
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
});

export default AddTaskModal;
