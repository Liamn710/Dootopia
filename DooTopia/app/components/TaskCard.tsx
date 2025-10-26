//TODO: Implement task card UI
//TODO:Add drag and drop functionality
//TODO: Add animations and transitions
//TODO: Add Subtasks functionality
//TODO: Add due date and reminders functionality
//BUG: Fix DropDown alignment issue



import AntDesign from '@expo/vector-icons/AntDesign';
import { useState } from 'react';
import { Alert, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import type { Subtask } from '../types/Subtask';
import type { Task } from '../types/Task';
import CustomCheckbox from './CustomCheckbox';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onToggleExpansion: (taskId: string) => void;
  onAddSubtask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onEditSubtask: (taskId: string, subtaskId: string, newText: string) => void;
  assignedUserName?: string;
  onReassign?: (taskId: string, email: string) => Promise<void>;
  isReassignLoading?: boolean;
  onEditDueDate: (taskId: string) => void;
  editingDueDateTaskId: string | null;
  newDueDate: string;
  setNewDueDate: (date: string) => void;
  handleDueDateUpdate: (taskId: string, dueDate: string) => void;
}

// Move styles above component so it is available when TaskCard is defined
const styles = StyleSheet.create({
  taskCard: {
    marginBottom: 8,
    elevation: 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#5A8A93',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  taskText: {
    flex: 1,
    marginLeft: 8,
    marginTop: 4,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  pointsText: {
    marginLeft: 8,
    color: '#5A8A93',
    fontWeight: '600',
    alignSelf: 'center',
  },
  deleteButton: {
    margin: 0,
  },
  assignmentRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 8,
  },
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
  expandedContent: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  subtasksSection: {
    marginBottom: 8,
  },
  subtasksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subtasksTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A8A93',
  },
  addSubtaskButton: {
    margin: 0,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    marginLeft: 16,
  },
  subtaskText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    backgroundColor: '#ffffff',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  placeholderText: {
    color: '#999',
    fontStyle: 'italic',
  },
  deleteSubtaskButton: {
    margin: 0,
  },
});


const TaskCard = ({ task, ...props }: TaskCardProps) => {
  // Assignment modal state
  const [reassignModalVisible, setReassignModalVisible] = useState(false);
  const [reassignEmail, setReassignEmail] = useState('');
  const handleReassign = async () => {
    if (props.onReassign) {
      await props.onReassign(task.id, reassignEmail);
      setReassignModalVisible(false);
      setReassignEmail('');
    }
  };
  //using useState in order to be able to edit subtasks first value in a useState 
  const [editingSubtaskId, setEditingSubtaskId] = useState<string>('');
  const [tempSubtaskText, setTempSubtaskText] = useState<string>('');

  const handleEditSubtask = (subtaskId: string, currentText: string) => {
    setEditingSubtaskId(subtaskId);
    // Clear placeholder text when editing
    setTempSubtaskText(currentText === 'Tap to add subtask' ? '' : currentText);
  };

  const handleSaveSubtask = (subtaskId: string) => {
    const finalText = tempSubtaskText.trim() || 'Tap to add subtask';
    props.onEditSubtask(task.id, subtaskId, finalText);
    setEditingSubtaskId('');
    setTempSubtaskText('');
  };

  const handleCancelEdit = () => {
    setEditingSubtaskId('');
    setTempSubtaskText('');
  };

  const [addingSubtask, setAddingSubtask] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  return (
    <View style={styles.taskCard}>
      <View style={styles.taskContent}>
        <CustomCheckbox
          status={task.completed ? 'checked' : 'unchecked'}
          onPress={() => props.onToggleComplete(task.id)}
        />
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={() => props.onToggleExpansion(task.id)}
            activeOpacity={0.7}
          >
            <Text variant="titleMedium" style={styles.taskTitle}>
              {task.title}
            </Text>
          </TouchableOpacity>
          {/* Show due date below the title */}
          {task.dueDate && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Text style={{ fontSize: 12, color: '#5A8A93' }}>
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </Text>
              {task.expanded && (
                props.editingDueDateTaskId === task.id ? (
                  <>
                    <TextInput
                      style={[styles.input, { width: 120, fontSize: 12, marginLeft: 8 }]}
                      value={props.newDueDate}
                      onChangeText={props.setNewDueDate}
                      placeholder="YYYY-MM-DD"
                    />
                    <Button
                      mode="contained"
                      compact
                      style={{ marginLeft: 4 }}
                      onPress={() => props.handleDueDateUpdate(task.id, props.newDueDate)}
                    >
                      Save
                    </Button>
                    <Button
                      mode="text"
                      compact
                      style={{ marginLeft: 4 }}
                      onPress={() => props.onEditDueDate('')}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  !task.completed && (
                    <Button
                      mode="text"
                      compact
                      style={{ marginLeft: 8 }}
                      onPress={() => props.onEditDueDate(task.id)}
                    >
                      Edit
                    </Button>
                  )
                )
              )}
            </View>
          )}
          {task.expanded && task.text && (
            <Text
              variant="bodyLarge"
              style={[styles.taskText, task.completed && styles.completedTask]}
            >
              {task.text}
            </Text>
          )}
        </View>
        <Text style={styles.pointsText}>
          {task.points ?? 0} pts
        </Text>
        <IconButton
          icon={() => <AntDesign name="close" size={20} color="#666" />}
          size={20}
          onPress={() => props.onDelete(task.id)}
          style={styles.deleteButton}
        />
      </View>

      {/* Assignment Button */}
      <View style={styles.assignmentRow}>
        <Button
          mode="outlined"
          style={{ marginRight: 8 }}
          onPress={() => setReassignModalVisible(true)}
        >
          {props.assignedUserName || 'Assign'}
        </Button>
      </View>

      {/* Assignment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={reassignModalVisible}
        onRequestClose={() => setReassignModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Reassign Task</Text>
            <TextInput
              style={styles.input}
              placeholder="Assign to (email, optional)"
              value={reassignEmail}
              onChangeText={setReassignEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <View style={styles.modalButtons}>
              <Button
                mode="contained"
                onPress={handleReassign}
                disabled={props.isReassignLoading}
              >
                {props.isReassignLoading ? "Assigning..." : "Change Assignment"}
              </Button>
              <Button mode="outlined" onPress={() => setReassignModalVisible(false)} style={{ marginLeft: 10 }}>
                Cancel
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {task.expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.subtasksSection}>
            {/* Existing subtasks */}
            {task.subtasks.map((subtask: Subtask) => (
              <View key={subtask.id} style={styles.subtaskItem}>
                <CustomCheckbox
                  status={subtask.completed ? 'checked' : 'unchecked'}
                  onPress={() => props.onToggleSubtask(task.id, subtask.id)}
                />
                {editingSubtaskId === subtask.id ? (
                  <TextInput
                    style={[styles.subtaskText, subtask.completed && styles.completedTask]}
                    value={tempSubtaskText}
                    onChangeText={setTempSubtaskText}
                    onBlur={() => handleSaveSubtask(subtask.id)}
                    onSubmitEditing={() => handleSaveSubtask(subtask.id)}
                    autoFocus={true}
                  />
                ) : (
                  <TouchableOpacity 
                    style={{ flex: 1 }}
                    onPress={() => handleEditSubtask(subtask.id, subtask.text)}
                  >
                    <Text style={[
                      styles.subtaskText, 
                      subtask.completed && styles.completedTask,
                      subtask.text === 'Tap to add subtask' && styles.placeholderText
                    ]}>
                      {subtask.text}
                    </Text>
                  </TouchableOpacity>
                )}
                <IconButton
                  icon={() => <AntDesign name="close" size={14} color="#666" />}
                  size={16}
                  onPress={() => props.onDeleteSubtask(task.id, subtask.id)}
                  style={styles.deleteSubtaskButton}
                />
              </View>
            ))}

            {/* Add subtask input */}
            {addingSubtask ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  placeholder="Enter subtask text"
                  value={newSubtaskText}
                  onChangeText={setNewSubtaskText}
                  autoFocus
                />
                <Button
                  mode="contained"
                  compact
                  onPress={() => {
                    if (newSubtaskText.trim()) {
                      console.log('TaskCard: calling onAddSubtask with taskId:', task.id); // Debug log
                      props.onAddSubtask(task.id, newSubtaskText);
                      setNewSubtaskText('');
                      setAddingSubtask(false);
                    } else {
                      Alert.alert('Error', 'Please enter subtask text');
                    }
                  }}
                >
                  OK
                </Button>
                <Button
                  mode="text"
                  compact
                  onPress={() => {
                    setAddingSubtask(false);
                    setNewSubtaskText('');
                  }}
                >
                  Cancel
                </Button>
              </View>
            ) : (
              <Button
                mode="outlined"
                onPress={() => setAddingSubtask(true)}
                style={{ marginTop: 8 }}
                icon={() => <AntDesign name="plus" size={16} color="#5A8A93" />}
              >
                Add Subtask
              </Button>
            )}
          </View>
        </View>
      )}
    </View>
  );
};



export default TaskCard;