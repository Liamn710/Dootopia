import AntDesign from '@expo/vector-icons/AntDesign';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import CustomCheckbox from './CustomCheckbox';

interface Task {
  id: string;
  title: string;
}

interface ListCardProps {
  list: {
    _id: string;
    name: string;
    taskIds: string[];
    userId: string;
  };
  allTasks: Task[]; // All user's tasks
  onPress: (listId: string) => void;
  onDelete: (listId: string) => void;
  onRename: (listId: string, newName: string) => void;
  onAddTask: (listId: string, taskId: string) => void;
  onRemoveTask: (listId: string, taskId: string) => void;
  isExpanded?: boolean; // <-- Added isExpanded prop
}

const ListCard = ({ list, allTasks, onPress, onDelete, onRename, onAddTask, onRemoveTask, isExpanded = false }: ListCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(list.name);
  const [taskModalVisible, setTaskModalVisible] = useState(false);

  const handleSave = () => {
    if (editedName.trim()) {
      onRename(list._id, editedName.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedName(list.name);
    setIsEditing(false);
  };

  const isTaskInList = (taskId: string) => list.taskIds.includes(taskId);

  const handleToggleTask = (taskId: string) => {
    if (isTaskInList(taskId)) {
      onRemoveTask(list._id, taskId);
    } else {
      onAddTask(list._id, taskId);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(list._id)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <AntDesign name="bars" size={24} color="#5A8A93" />
      </View>

      <View style={styles.content}>
        {isEditing ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.input}
              value={editedName}
              onChangeText={setEditedName}
              autoFocus
              onSubmitEditing={handleSave}
            />
            <Button mode="contained" compact onPress={handleSave} style={styles.saveButton}>
              Save
            </Button>
            <Button mode="text" compact onPress={handleCancel}>
              Cancel
            </Button>
          </View>
        ) : (
          <>
            <Text style={styles.listName}>{list.name}</Text>
            <Text style={styles.taskCount}>
              {list.taskIds.length} {list.taskIds.length === 1 ? 'task' : 'tasks'}
            </Text>
          </>
        )}
      </View>

      <View style={styles.actions}>
        {!isEditing && (
          <>
            <IconButton
              icon={() => <AntDesign name="plus" size={18} color="#5A8A93" />}
              size={20}
              onPress={() => setTaskModalVisible(true)}
              style={styles.actionButton}
            />
            <IconButton
              icon={() => <AntDesign name="edit" size={18} color="#5A8A93" />}
              size={20}
              onPress={() => setIsEditing(true)}
              style={styles.actionButton}
            />
            <IconButton
              icon={() => <AntDesign name="delete" size={18} color="#E57373" />}
              size={20}
              onPress={() => onDelete(list._id)}
              style={styles.actionButton}
            />
            {/* Icon to indicate expansion state */}
            <AntDesign 
              name={isExpanded ? 'down' : 'right'} 
              size={16} 
              color="#5A8A93" 
              style={styles.expandIcon}
            />
          </>
        )}
      </View>

      {/* Modal for adding/removing tasks */}
      <Modal
        visible={taskModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTaskModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Manage Tasks in "{list.name}"</Text>
            <ScrollView style={styles.taskList}>
              {allTasks.length === 0 ? (
                <Text style={styles.emptyText}>No tasks available.</Text>
              ) : (
                allTasks.map(task => (
                  <TouchableOpacity
                    key={task.id}
                    style={styles.taskItem}
                    onPress={() => handleToggleTask(task.id)}
                    activeOpacity={0.7}
                  >
                    <CustomCheckbox
                      status={isTaskInList(task.id) ? 'checked' : 'unchecked'}
                      onPress={() => handleToggleTask(task.id)}
                    />
                    <Text style={styles.taskTitle}>{task.title}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <View style={styles.modalButtons}>
              <Button
                mode="contained"
                onPress={() => setTaskModalVisible(false)}
                buttonColor="#5A8A93"
              >
                Done
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#5A8A93',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAF6F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d4150',
  },
  taskCount: {
    fontSize: 12,
    color: '#5A8A93',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    margin: 0,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  input: {
    flex: 1,
    backgroundColor: '#EAF6F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#9DBCC3',
    fontSize: 14,
    marginRight: 8,
  },
  saveButton: {
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(90, 138, 147, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxHeight: '70%',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5A8A93',
    marginBottom: 16,
    textAlign: 'center',
  },
  taskList: {
    maxHeight: 300,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EAF6F9',
  },
  taskTitle: {
    flex: 1,
    fontSize: 14,
    color: '#2d4150',
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  expandIcon: {
    marginLeft: 8,
  },
});

export default ListCard;