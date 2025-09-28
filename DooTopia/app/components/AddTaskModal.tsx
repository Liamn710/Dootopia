import React, { useState } from 'react';
import { Modal, View, StyleSheet, TextInput } from 'react-native';
import { Button, Text } from 'react-native-paper';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (assignToId: string) => void;
  taskTitle: string;
  setTaskTitle: (v: string) => void;
  taskText: string;
  setTaskText: (v: string) => void;
  taskPoints: string;
  setTaskPoints: (v: string) => void;
  assignEmail: string;
  setAssignEmail: (v: string) => void;
  isAssignLoading: boolean;
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
  assignEmail,
  setAssignEmail,
  isAssignLoading,
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
          <TextInput
            style={styles.input}
            placeholder="Assign to (email, optional)"
            value={assignEmail}
            onChangeText={setAssignEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <View style={styles.modalButtons}>
            <Button
              mode="contained"
              onPress={() => onAdd(assignEmail)}
              disabled={!taskTitle || !taskPoints || isAssignLoading}
            >
              {isAssignLoading ? "Assigning..." : "Add"}
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
    shadowColor: "#5A8A93",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#5A8A93",
    marginBottom: 18,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#EAF6F9",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#9DBCC3",
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
});

export default AddTaskModal;
