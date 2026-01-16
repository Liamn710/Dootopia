import AntDesign from '@expo/vector-icons/AntDesign';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import ListCard from '../components/ListCard';
import TaskCard from '../components/TaskCard';
import TaskFilters from '../components/TaskFilters';
import TaskModal, { type AssigneeOption, type CreatableTaskValues } from '../components/TaskModal';
import useCurrentUser from '../hooks/useCurrentUser';
import useListsData from '../hooks/useListsData';
import useTasksData from '../hooks/useTasksData';
import useUsersMap from '../hooks/useUsersMap';
import type { Task } from '../types/Task';

const TasksPage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [editingDueDateTaskId, setEditingDueDateTaskId] = useState<string | null>(null);
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [newDueTime, setNewDueTime] = useState<string>('');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');
  const [selectedTagLabels, setSelectedTagLabels] = useState<string[]>([]);
  const [tagMatchAll, setTagMatchAll] = useState<boolean>(false);

  // List UI states
  const [listModalVisible, setListModalVisible] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showLists, setShowLists] = useState(true);
  const [listCompletedVisible, setListCompletedVisible] = useState<{ [listId: string]: boolean }>({});
  const [expandedListId, setExpandedListId] = useState<string | null>(null);

  // Hooks
  const { mongoUserId, mongoUserLoading } = useCurrentUser();
  const { usersMap } = useUsersMap();
  const {
    tasks,
    refreshTasks,
    addTask,
    addSubtask,
    toggleTaskCompletion,
    toggleSubtaskCompletion,
    toggleTaskExpansion,
    deleteTask,
    deleteSubtask,
    editSubtaskText,
    updateDueDate,
    reassignTask,
    updateTaskTags,
    editTask,
    isCreatingTask,
    isReassignLoading,
    updatingTaskId,
  } = useTasksData(mongoUserId);

  // Use the new lists hook
  const {
    lists,
    refreshLists,
    createList,
    deleteList,
    renameList,
    addTaskToList,
    removeTaskFromList,
    isCreatingList,
  } = useListsData(mongoUserId);

  // Fetch tasks and lists when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (!mongoUserLoading && mongoUserId) {
        console.log('TasksPage: Refreshing data for user:', mongoUserId);
        refreshTasks();
        refreshLists();
      }
      return undefined;
    }, [mongoUserId, mongoUserLoading, refreshTasks, refreshLists])
  );

  // Also fetch when mongoUserId first becomes available
  useEffect(() => {
    if (mongoUserId && !mongoUserLoading) {
      refreshLists();
    }
  }, [mongoUserId, mongoUserLoading, refreshLists]);

  // Debug: Log lists state changes
  useEffect(() => {
    console.log('Lists state updated:', lists.length, 'lists');
  }, [lists]);

  // Memoized values
  const tasksArray = useMemo(() => Object.values(tasks), [tasks]);
  
  const allTagLabels = useMemo(
    () => Array.from(new Set(tasksArray.flatMap(task => (task.tags ?? []).map(tag => tag.label)))),
    [tasksArray]
  );

  const assigneeOptions: AssigneeOption[] = useMemo(() => {
    // Get unique assignee IDs from tasks that the current user created
    const relevantAssigneeIds = new Set<string>();
    tasksArray.forEach(task => {
      if (task.userId === mongoUserId && task.assignedToId) {
        relevantAssigneeIds.add(task.assignedToId);
      }
    });
    
    // Always include the current user
    if (mongoUserId) {
      relevantAssigneeIds.add(mongoUserId);
    }
    
    // Build options only for relevant users
    const options: AssigneeOption[] = [];
    relevantAssigneeIds.forEach(id => {
      options.push({
        id,
        label: id === mongoUserId ? 'You' : (usersMap[id] || 'Unknown'),
      });
    });
    
    // Sort so 'You' appears first
    return options.sort((a, b) => {
      if (a.id === mongoUserId) return -1;
      if (b.id === mongoUserId) return 1;
      return a.label.localeCompare(b.label);
    });
  }, [usersMap, mongoUserId, tasksArray]);

  // Filter functions
  const matchesAssignee = useCallback((task: Task) => {
    return assigneeFilter === 'ALL' ? true : task.assignedToId === assigneeFilter;
  }, [assigneeFilter]);

  const matchesTags = useCallback((task: Task) => {
    if (selectedTagLabels.length === 0) return true;
    const labels = new Set((task.tags || []).map(tag => tag.label));
    return tagMatchAll
      ? selectedTagLabels.every(label => labels.has(label))
      : selectedTagLabels.some(label => labels.has(label));
  }, [selectedTagLabels, tagMatchAll]);

  const filteredTasks = useMemo(
    () => tasksArray.filter(task => matchesAssignee(task) && matchesTags(task)),
    [tasksArray, matchesAssignee, matchesTags]
  );

  // Get all task IDs that are in any list
  const taskIdsInLists = useMemo(
    () => new Set(lists.flatMap(list => list.taskIds || [])),
    [lists]
  );

  // Filter out tasks that are in any list from the main tasks view
  const tasksNotInLists = useMemo(
    () => filteredTasks.filter(task => !taskIdsInLists.has(task.id)),
    [filteredTasks, taskIdsInLists]
  );

  const incompleteTasks = useMemo(() => tasksNotInLists.filter(task => !task.completed), [tasksNotInLists]);
  const completedTasks = useMemo(() => tasksNotInLists.filter(task => task.completed), [tasksNotInLists]);
  const noTasks = tasksNotInLists.length === 0 && lists.length === 0;

  // Helper functions
  const getAssignedUserName = useCallback((assignedToId?: string) => {
    if (!assignedToId || assignedToId === mongoUserId) return 'You';
    return usersMap[assignedToId] || 'Unknown';
  }, [mongoUserId, usersMap]);

  const getTasksInList = useCallback((listId: string) => {
    const list = lists.find(l => l._id === listId);
    if (!list) return [];
    return tasksArray.filter(task => list.taskIds?.includes(task.id));
  }, [lists, tasksArray]);

  // Handlers
  const handleDueDateUpdate = useCallback(async (taskId: string, dueDate: string) => {
    await updateDueDate(taskId, dueDate);
    setEditingDueDateTaskId(null);
    setNewDueDate('');
    setNewDueTime('');
  }, [updateDueDate]);

  const handleAddTask = useCallback(async (values: CreatableTaskValues) => {
    const wasSuccessful = await addTask(values);
    if (wasSuccessful) {
      setModalVisible(false);
    }
  }, [addTask]);

  const handleToggleTag = useCallback((label: string) => {
    setSelectedTagLabels(prev => prev.includes(label)
      ? prev.filter(item => item !== label)
      : [...prev, label]);
  }, []);

  const handleOpenDueDateEditor = useCallback((taskId: string) => {
    setEditingDueDateTaskId(taskId);
    setNewDueDate(tasks[taskId]?.dueDate?.substring(0, 10) || '');
  }, [tasks]);

  const handleListPress = useCallback((listId: string) => {
    setExpandedListId(prev => prev === listId ? null : listId);
  }, []);

  const handleCreateList = async () => {
    const success = await createList(newListName);
    if (success) {
      setListModalVisible(false);
      setNewListName('');
    }
  };

  // Render task card helper
  const renderTaskCard = useCallback((task: Task) => (
    <TaskCard
      key={task.id}
      task={task}
      onToggleComplete={toggleTaskCompletion}
      onDelete={deleteTask}
      onToggleExpansion={toggleTaskExpansion}
      onAddSubtask={addSubtask}
      onToggleSubtask={toggleSubtaskCompletion}
      onDeleteSubtask={deleteSubtask}
      onEditSubtask={editSubtaskText}
      assignedUserName={getAssignedUserName(task.assignedToId)}
      onReassign={reassignTask}
      isReassignLoading={isReassignLoading}
      onUpdateTags={updateTaskTags}
      onEditDueDate={handleOpenDueDateEditor}
      editingDueDateTaskId={editingDueDateTaskId}
      newDueDate={newDueDate}
      setNewDueDate={setNewDueDate}
      newDueTime={newDueTime}
      setNewDueTime={setNewDueTime}
      handleDueDateUpdate={handleDueDateUpdate}
      onEditTask={editTask}
      assigneeOptions={assigneeOptions}
      updatingTaskId={updatingTaskId}
    />
  ), [
    toggleTaskCompletion, deleteTask, toggleTaskExpansion, addSubtask,
    toggleSubtaskCompletion, deleteSubtask, editSubtaskText, getAssignedUserName,
    reassignTask, isReassignLoading, updateTaskTags, handleOpenDueDateEditor,
    editingDueDateTaskId, newDueDate, newDueTime, handleDueDateUpdate,
    editTask, assigneeOptions, updatingTaskId
  ]);

  const renderCompletedSection = () => {
    if (completedTasks.length === 0) return null;
    return (
      <View style={styles.completedSection}>
        <TouchableOpacity
          style={styles.completedHeader}
          onPress={() => setShowCompleted(prev => !prev)}
          activeOpacity={0.7}
        >
          <Text style={styles.completedTitle}>
            Completed ({completedTasks.length})
          </Text>
          <AntDesign name={showCompleted ? 'up' : 'down'} size={16} color="#5A8A93" />
        </TouchableOpacity>
        {showCompleted && (
          <View style={styles.completedList}>
            {completedTasks.map(renderTaskCard)}
          </View>
        )}
      </View>
    );
  };

  if (mongoUserLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
        <ActivityIndicator size="large" color="#5A8A93" />
        <Text style={{ marginTop: 16, color: '#5A8A93' }}>Loading your account...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TaskFilters
          currentUserId={mongoUserId}
          assigneeFilter={assigneeFilter}
          assigneeOptions={assigneeOptions}
          onChangeAssignee={setAssigneeFilter}
          availableTagLabels={allTagLabels}
          selectedTagLabels={selectedTagLabels}
          onToggleTag={handleToggleTag}
          tagMatchAll={tagMatchAll}
          onToggleTagMatch={setTagMatchAll}
        />

        <Text variant="headlineMedium" style={styles.title}>Tasks Page</Text>

        {/* Lists Section */}
        <View style={styles.listsSection}>
          <TouchableOpacity
            style={styles.listsSectionHeader}
            onPress={() => setShowLists(prev => !prev)}
            activeOpacity={0.7}
          >
            <Text style={styles.listsSectionTitle}>My Lists ({lists.length})</Text>
            <AntDesign name={showLists ? 'up' : 'down'} size={16} color="#5A8A93" />
          </TouchableOpacity>
          {showLists && (
            <View style={styles.listsList}>
              {lists.length === 0 ? (
                <Text style={styles.emptyListText}>No lists yet. Create one below!</Text>
              ) : (
                lists.map(list => {
                  const isExpanded = expandedListId === list._id;
                  const listTasks = getTasksInList(list._id);
                  const incompleteListTasks = listTasks.filter((t: Task) => !t.completed);
                  const completedListTasks = listTasks.filter((t: Task) => t.completed);
                  
                  return (
                    <View key={list._id}>
                      <ListCard
                        list={list}
                        allTasks={tasksArray.map(t => ({ id: t.id, title: t.title }))}
                        onPress={handleListPress}
                        onDelete={deleteList}
                        onRename={renameList}
                        onAddTask={addTaskToList}
                        onRemoveTask={removeTaskFromList}
                        isExpanded={isExpanded}
                      />
                      {isExpanded && (
                        <View style={styles.expandedListTasks}>
                          {listTasks.length === 0 ? (
                            <Text style={styles.emptyListText}>No tasks in this list yet.</Text>
                          ) : (
                            <>
                              {incompleteListTasks.map(renderTaskCard)}
                              {completedListTasks.length > 0 && (
                                <TouchableOpacity
                                  style={styles.listCompletedHeader}
                                  onPress={() => setListCompletedVisible(prev => ({
                                    ...prev,
                                    [list._id]: !prev[list._id]
                                  }))}
                                  activeOpacity={0.7}
                                >
                                  <Text style={styles.completedListLabel}>
                                    Completed ({completedListTasks.length})
                                  </Text>
                                  <AntDesign
                                    name={listCompletedVisible[list._id] ? 'up' : 'down'}
                                    size={14}
                                    color="#5A8A93"
                                  />
                                </TouchableOpacity>
                              )}
                              {listCompletedVisible[list._id] && completedListTasks.map(renderTaskCard)}
                            </>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </View>
          )}
        </View>

        {/* All Tasks Section */}
        <View style={styles.allTasksSection}>
          {noTasks ? (
            <Text style={styles.emptyState}>No tasks yet. Add your first one!</Text>
          ) : (
            <>
              {incompleteTasks.map(renderTaskCard)}
              {renderCompletedSection()}
            </>
          )}
        </View>
      </ScrollView>

      {/* Buttons Row */}
      <View style={styles.buttonsRow}>
        <Button
          mode="contained"
          style={styles.addTaskButton}
          onPress={() => setModalVisible(true)}
          icon={() => <AntDesign name="plus" size={20} color="#fff" />}
        >
          Add Task
        </Button>
        
        <Button
          mode="outlined"
          style={styles.createListButton}
          onPress={() => setListModalVisible(true)}
          icon={() => <AntDesign name="bars" size={20} color="#5A8A93" />}
        >
          Create List
        </Button>
      </View>

      {/* Add Task Modal */}
      <TaskModal
        mode="create"
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        assigneeOptions={assigneeOptions}
        onSubmit={handleAddTask}
        isSaving={isCreatingTask}
      />

      {/* Create List Modal */}
      <Modal
        visible={listModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setListModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create New List</Text>
            <TextInput
              style={styles.input}
              placeholder="List Name"
              value={newListName}
              onChangeText={setNewListName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => {
                  setListModalVisible(false);
                  setNewListName('');
                }}
                style={{ marginRight: 10 }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleCreateList}
                loading={isCreatingList}
                disabled={isCreatingList}
                buttonColor="#5A8A93"
              >
                Create
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#D6ECF2',
  },
  scrollView: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyState: {
    textAlign: 'center',
    color: '#5A8A93',
    marginTop: 40,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 12,
  },
  addTaskButton: {
    backgroundColor: "#5A8A93",
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  createListButton: {
    borderColor: "#5A8A93",
    borderRadius: 8,
    paddingHorizontal: 24,
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
  completedSection: {
    marginTop: 16,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5A8A93',
  },
  completedList: {
    marginTop: 8,
  },
  listsSection: {
    marginBottom: 16,
  },
  listsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: '#EAF6F9',
    borderRadius: 8,
  },
  listsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5A8A93',
  },
  listsList: {
    marginTop: 8,
  },
  expandedListTasks: {
    marginLeft: 16,
    marginBottom: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#9DBCC3',
  },
  emptyListText: {
    color: '#5A8A93',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  completedListLabel: {
    color: '#5A8A93',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  listCompletedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 8,
  },
  allTasksSection: {
    flex: 1,
    marginBottom: 10,
  },
});

export default TasksPage;
