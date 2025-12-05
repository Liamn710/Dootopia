import AntDesign from '@expo/vector-icons/AntDesign';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Alert, Modal, Platform, Pressable, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import type { Subtask } from '../types/Subtask';
import type { Tag as TagItem, Task } from '../types/Task';
import CustomCheckbox from './CustomCheckbox';
import TaskModal, { type AssigneeOption, type EditableTaskValues } from './TaskModal';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onToggleExpansion: (taskId: string) => void;
  onAddSubtask: (taskId: string, subtaskText: string) => void | Promise<void>;
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
  // New: support editing the time alongside the date
  newDueTime?: string;
  setNewDueTime?: (time: string) => void;
  handleDueDateUpdate: (taskId: string, dueDate: string) => void;
  onUpdateTags?: (taskId: string, tags: TagItem[]) => void | Promise<void>;
  onEditTask?: (taskId: string, values: EditableTaskValues) => void | Promise<void>;
  assigneeOptions?: AssigneeOption[];
  updatingTaskId?: string | null;
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
  pressedCard: {
    opacity: 0.92,
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
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    marginLeft: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4C6EF5',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  tagChipText: { color: '#fff', fontSize: 12 },
  tagRemove: { color: '#fff', fontWeight: 'bold', marginLeft: 6 },
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
  editButton: {
    margin: 0,
  },
});


const TaskCard = ({ task, ...props }: TaskCardProps) => {
  const isWeb = Platform.OS === 'web';
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

  // Local pickers visibility for editing due date/time
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [addingSubtask, setAddingSubtask] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);

  const handleEditTask = async (values: EditableTaskValues) => {
    if (!props.onEditTask) {
      return;
    }
    try {
      await props.onEditTask(task.id, values);
      setEditModalVisible(false);
    } catch (error) {
      console.error('Failed to edit task', error);
    }
  };

  const handleLongPressEdit = () => {
    if (!isWeb && props.onEditTask) {
      setEditModalVisible(true);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.taskCard, !isWeb && pressed && styles.pressedCard]}
      onLongPress={!isWeb && props.onEditTask ? handleLongPressEdit : undefined}
      delayLongPress={!isWeb && props.onEditTask ? 400 : undefined}
    >
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
            <View style={{ flexDirection: 'column', alignItems: 'center', marginTop: 2 }}>
              {(() => {
                const d = new Date(task.dueDate);
                const hasTime = !isNaN(d.getTime()) && (d.getHours() !== 0 || d.getMinutes() !== 0);
                const timeStr = hasTime ? d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';
                return (
                  <Text
                    style={{
                      fontSize: 12,
                      color: '#5A8A93',
                      // add right margin when in row layout
                      marginRight: Platform.OS === 'web' ? 8 : 0,
                    }}>
                    {`Due: ${d.toLocaleDateString()}${hasTime ? ` • ${timeStr}` : ''}`}
                  </Text>
                );
              })()}
              {task.expanded && (
                props.editingDueDateTaskId === task.id ? (
                  <>
                    {Platform.OS === 'web' ? (
                      <>
                        <input
                          type="date"
                          style={{ ...styles.input, width: 140, padding: 8, fontSize: 12, marginLeft: 8 }}
                          value={props.newDueDate || (task.dueDate ? new Date(task.dueDate).toISOString().substring(0, 10) : '')}
                          onChange={(e) => props.setNewDueDate(e.target.value)}
                        />
                        <input
                          type="time"
                          style={{ ...styles.input, width: 110, padding: 8, fontSize: 12, marginLeft: 6 }}
                          value={props.newDueTime || (() => {
                            try {
                              const d = task.dueDate ? new Date(task.dueDate) : null;
                              return d ? `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` : '';
                            } catch { return ''; }
                          })()}
                          onChange={(e) => props.setNewDueTime && props.setNewDueTime(e.target.value)}
                        />
                      </>
                    ) : (
                      <>
                        <TouchableOpacity style={[styles.input, { width: 140, marginLeft: 8 }]} onPress={() => setShowDatePicker(true)}>
                          <Text style={{ fontSize: 12, color: '#000' }}>
                            {props.newDueDate || (task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Select date')}
                          </Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                          <DateTimePicker
                            value={task.dueDate ? new Date(task.dueDate) : new Date()}
                            mode="date"
                            display="spinner"
                            onChange={(event, selectedDate) => {
                              setShowDatePicker(false);
                              if (selectedDate && props.setNewDueDate) {
                                const y = selectedDate.getFullYear();
                                const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
                                const d = String(selectedDate.getDate()).padStart(2, '0');
                                props.setNewDueDate(`${y}-${m}-${d}`);
                              }
                            }}
                          />
                        )}
                        <TouchableOpacity style={[styles.input, { width: 110, marginLeft: 6 }]} onPress={() => setShowTimePicker(true)}>
                          <Text style={{ fontSize: 12, color: '#000' }}>
                            {props.newDueTime || (() => {
                              try {
                                const d = task.dueDate ? new Date(task.dueDate) : null;
                                return d ? `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` : 'Select time';
                              } catch { return 'Select time'; }
                            })()}
                          </Text>
                        </TouchableOpacity>
                        {showTimePicker && (
                          <DateTimePicker
                            value={task.dueDate ? new Date(task.dueDate) : new Date()}
                            mode="time"
                            display="spinner"
                            onChange={(event, selectedDate) => {
                              setShowTimePicker(false);
                              if (selectedDate && props.setNewDueTime) {
                                const hh = String(selectedDate.getHours()).padStart(2, '0');
                                const mm = String(selectedDate.getMinutes()).padStart(2, '0');
                                props.setNewDueTime(`${hh}:${mm}`);
                              }
                            }}
                          />
                        )}
                      </>
                    )}
                    <Button
                      mode="contained"
                      compact
                      style={{ marginLeft: 4 }}
                      onPress={() => {
                        // Compose ISO string from provided date and time
                        const toIso = (dateStr?: string, timeStr?: string, current?: string) => {
                          // Determine date part
                          let baseDate: string;
                          if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                            baseDate = dateStr;
                          } else if (current) {
                            baseDate = new Date(current).toISOString().substring(0, 10);
                          } else {
                            baseDate = new Date().toISOString().substring(0, 10);
                          }

                          // Determine time part
                          let hours = 0, minutes = 0;
                          if (timeStr && /^([01]\d|2[0-3]):[0-5]\d$/.test(timeStr)) {
                            const [h, m] = timeStr.split(":");
                            hours = parseInt(h, 10);
                            minutes = parseInt(m, 10);
                          } else if (current) {
                            const dcur = new Date(current);
                            hours = dcur.getHours();
                            minutes = dcur.getMinutes();
                          }

                          const d = new Date(`${baseDate}T00:00:00`);
                          d.setHours(hours, minutes, 0, 0);
                          return d.toISOString();
                        };

                        const iso = toIso(props.newDueDate, props.newDueTime, task.dueDate);
                        props.handleDueDateUpdate(task.id, iso);
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      mode="text"
                      compact
                      style={{ marginLeft: 4 }}
                      onPress={() => {
                        props.setNewDueDate('');
                        props.setNewDueTime && props.setNewDueTime('');
                        props.onEditDueDate('');
                      }}
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
          {!!task.tags && task.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {task.tags.map((t) => (
                <View key={t.label} style={[styles.tagChip, { backgroundColor: t.color || '#4C6EF5' }]}>
                  <Text style={styles.tagChipText}>{t.label}</Text>
                  {task.expanded && !task.completed && props.onUpdateTags && (
                    <TouchableOpacity
                      onPress={() => {
                        const updated = (task.tags || []).filter(tag => tag.label !== t.label);
                        props.onUpdateTags?.(task.id, updated);
                      }}
                    >
                      <Text style={styles.tagRemove}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
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
        {props.onEditTask && isWeb && (
          <IconButton
            icon={() => <AntDesign name="edit" size={18} color="#5A8A93" />}
            size={20}
            onPress={() => setEditModalVisible(true)}
            style={styles.editButton}
          />
        )}
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

      {props.onEditTask && (
        <TaskModal
          mode="edit"
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          task={task}
          assigneeOptions={props.assigneeOptions}
          onSubmit={handleEditTask}
          isSaving={props.updatingTaskId === task.id}
        />
      )}
    </Pressable>
  );
};



export default TaskCard;