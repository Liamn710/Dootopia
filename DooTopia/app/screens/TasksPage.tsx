import AntDesign from '@expo/vector-icons/AntDesign';
import { useFocusEffect } from '@react-navigation/native';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, FlatList } from 'react-native';
import { Button, Chip, Menu, Switch as PaperSwitch, Text } from 'react-native-paper';
import {
  addTaskToList,
  createList,
  createSubtask,
  createTask,
  createUser,
  deleteList,
  deleteSubtask as deleteSubtaskApi,
  deleteTask as deleteTaskApi,
  getListsByUserId,
  getMongoUserByEmail,
  getMongoUserByFirebaseId,
  getSubtasks,
  getTasks,
  getUsers,
  removeTaskFromList,
  updateListName,
  updateSubtask,
  updateTask,
  updateUser
} from '../../backend/api';
import { auth } from '../../FirebaseConfig';
import AddTaskModal from '../components/AddTaskModal';
import ListCard from '../components/ListCard'; // Add this import
import TaskCard from '../components/TaskCard';
import TaskFilters from '../components/TaskFilters';
import TaskModal, { type AssigneeOption, type CreatableTaskValues } from '../components/TaskModal';
import useCurrentUser from '../hooks/useCurrentUser';
import useTasksData from '../hooks/useTasksData';
import useUsersMap from '../hooks/useUsersMap';
import type { Task } from '../types/Task';

const TasksPage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [editingDueDateTaskId, setEditingDueDateTaskId] = useState<string | null>(null);
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');
  const [selectedTagLabels, setSelectedTagLabels] = useState<string[]>([]);
  const [tagMatchAll, setTagMatchAll] = useState<boolean>(false);
  const tasksArray: Task[] = Object.values(tasks);
  const allTagLabels = Array.from(new Set(tasksArray.flatMap(t => (t.tags || []).map(tag => tag.label))));
  const matchesAssignee = (task: Task) => assigneeFilter === 'ALL' ? true : task.assignedToId === assigneeFilter;
  const matchesTags = (task: Task) => {
    if (selectedTagLabels.length === 0) return true;
    const labels = new Set((task.tags || []).map(t => t.label));
    return tagMatchAll
      ? selectedTagLabels.every(l => labels.has(l))
      : selectedTagLabels.some(l => labels.has(l));
  };
  const filteredTasks = tasksArray.filter(t => matchesAssignee(t) && matchesTags(t));
  
  // Note: incompleteTasks, completedTasks, and noTasks will be calculated after lists is declared
  // Remove these lines from here:
  // const incompleteTasks = filteredTasks.filter(task => !task.completed);
  // const completedTasks = filteredTasks.filter(task => task.completed);
  // const noTasks = filteredTasks.length === 0;
  
  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setMongoUserId('');
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch Mongo user when userId changes
  useEffect(() => {
    const fetchOrCreateMongoUser = async () => {
      setMongoUserLoading(true);
      if (userId) {
        try {
          let mongoUser = await getMongoUserByFirebaseId(userId);
          if (!mongoUser || !mongoUser._id) {
            // Try to get Firebase user info
            const firebaseUser = auth.currentUser;
            if (firebaseUser) {
              // Compose new user object for Mongo
              const newUser = {
                firebaseUserId: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email || 'Unnamed User',
                email: firebaseUser.email || '',
                // Add any other default fields you want here
              };
              mongoUser = await createUser(newUser);
              if (mongoUser && mongoUser._id) {
                setMongoUserId(mongoUser._id);
              } else {
                setMongoUserId('');
                console.error('Failed to create Mongo user:', mongoUser);
              }
            } else {
              setMongoUserId('');
              console.error('No Firebase user found for Mongo user creation.');
            }
          } else {
            setMongoUserId(mongoUser._id);
          }
        } catch (error) {
          setMongoUserId('');
          console.error('Error fetching or creating MongoDB user:', error);
        }
      } else {
        setMongoUserId('');
      }
      setMongoUserLoading(false);
    };
    fetchOrCreateMongoUser();
  }, [userId]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getUsers(); // Your API call to /users
        // Build a map: { userId: name }
        const map: { [id: string]: string } = {};
        users.forEach((user: any) => {
          map[user._id] = user.name;
        });
        setUsersMap(map);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

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

  useFocusEffect(
    useCallback(() => {
      if (!mongoUserLoading && mongoUserId) {
        refreshTasks();
      }
      return undefined;
    }, [mongoUserId, mongoUserLoading, refreshTasks])
  );

  const tasksArray = useMemo(() => Object.values(tasks), [tasks]);
  const allTagLabels = useMemo(
    () => Array.from(new Set(tasksArray.flatMap(task => (task.tags ?? []).map(tag => tag.label)))),
    [tasksArray]
  );

  const assigneeOptions: AssigneeOption[] = useMemo(() => {
    const options = Object.entries(usersMap).map(([id, name]) => ({
      id,
      label: id === mongoUserId ? 'You' : (name || 'Unknown'),
    }));
    if (mongoUserId && !options.some(option => option.id === mongoUserId)) {
      options.unshift({ id: mongoUserId, label: 'You' });
    }
    return options;
  }, [usersMap, mongoUserId]);

  const matchesAssignee = useCallback((task: Task) => {
    return assigneeFilter === 'ALL' ? true : task.assignedToId === assigneeFilter;
  }, [assigneeFilter]);

  const matchesTags = useCallback((task: Task) => {
    if (selectedTagLabels.length === 0) {
      return true;
    }
    const labels = new Set((task.tags || []).map(tag => tag.label));
    return tagMatchAll
      ? selectedTagLabels.every(label => labels.has(label))
      : selectedTagLabels.some(label => labels.has(label));
  }, [selectedTagLabels, tagMatchAll]);

  const filteredTasks = useMemo(
    () => tasksArray.filter(task => matchesAssignee(task) && matchesTags(task)),
    [tasksArray, matchesAssignee, matchesTags]
  );

  const incompleteTasks = useMemo(() => filteredTasks.filter(task => !task.completed), [filteredTasks]);
  const completedTasks = useMemo(() => filteredTasks.filter(task => task.completed), [filteredTasks]);
  const noTasks = filteredTasks.length === 0;

  const getAssignedUserName = useCallback((assignedToId?: string) => {
    if (!assignedToId || assignedToId === mongoUserId) {
      return 'You';
    }
    return usersMap[assignedToId] || 'Unknown';
  }, [mongoUserId, usersMap]);

  const handleDueDateUpdate = useCallback(async (taskId: string, dueDate: string) => {
    await updateDueDate(taskId, dueDate);
    setEditingDueDateTaskId(null);
    setNewDueDate('');
  }, [updateDueDate]);

  const handleAddTask = useCallback(async (values: CreatableTaskValues) => {
    const wasSuccessful = await addTask(values);
    if (wasSuccessful) {
      setModalVisible(false);
    }
  }, [addTask]);

  // Add these states for list creation
  const [listModalVisible, setListModalVisible] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [lists, setLists] = useState<any[]>([]);
  const [showLists, setShowLists] = useState(true);
  const [listCompletedVisible, setListCompletedVisible] = useState<{ [listId: string]: boolean }>({});

  // Change selectedListId to expandedListId for in-place expansion
  const [expandedListId, setExpandedListId] = useState<string | null>(null);

  // Get all task IDs that are in any list
  const taskIdsInLists = new Set(lists.flatMap(list => list.taskIds || []));
  
  // Filter out tasks that are in any list from the main tasks view
  const tasksNotInLists = filteredTasks.filter(task => !taskIdsInLists.has(task.id));
  
  // Now calculate incomplete/completed from tasks NOT in lists
  const incompleteTasks = tasksNotInLists.filter(task => !task.completed);
  const completedTasks = tasksNotInLists.filter(task => task.completed);
  const noTasks = tasksNotInLists.length === 0 && lists.length === 0;

  // Get the expanded list object
  const expandedList = lists.find(l => l._id === expandedListId);

  // Get tasks that belong to the expanded list
  const getTasksInList = (listId: string) => {
    const list = lists.find(l => l._id === listId);
    if (!list) return [];
    return tasksArray.filter(task => list.taskIds?.includes(task.id));
  };

  // Update handleListPress to toggle expansion
  const handleListPress = (listId: string) => {
    setExpandedListId(prev => prev === listId ? null : listId);
  };

  // Add this function to create a new list
  const handleCreateList = async () => {
    if (!newListName.trim()) {
      Alert.alert('Error', 'Please enter a list name');
      return;
    }
    
    setIsCreatingList(true);
    try {
      const newList = {
        name: newListName.trim(),
        taskIds: [],
        userId: mongoUserId,
        createdAt: new Date().toISOString(),
      };
      
      const result = await createList(newList); // Changed from createUser to createList
      console.log('List created:', result);
      
      // Add new list to state
      setLists(prev => [...prev, result]);
      
      Alert.alert('Success', `List "${newListName}" created!`);
      setListModalVisible(false);
      setNewListName('');
    } catch (error) {
      console.error('Error creating list:', error);
      Alert.alert('Error', 'Failed to create list');
    } finally {
      setIsCreatingList(false);
    }
  };

  // Add function to fetch lists
  const fetchLists = useCallback(async () => {
    if (!mongoUserId) return;
    try {
      const userLists = await getListsByUserId(mongoUserId);
      setLists(Array.isArray(userLists) ? userLists : []);
    } catch (error) {
      console.error('Error fetching lists:', error);
      setLists([]);
    }
  }, [mongoUserId]);

  // Fetch lists when mongoUserId is available
  useFocusEffect(
    useCallback(() => {
      if (!mongoUserLoading && mongoUserId) {
        fetchTasks();
        fetchLists(); // Add this
      }
      return undefined;
    }, [fetchTasks, fetchLists, mongoUserId, mongoUserLoading])
  );

  const handleDeleteList = async (listId: string) => {
    try {
      await deleteList(listId);
      setLists(prev => prev.filter(l => l._id !== listId));
    } catch (error) {
      console.error('Error deleting list:', error);
      Alert.alert('Error', 'Failed to delete list');
    }
  };

  const handleRenameList = async (listId: string, newName: string) => {
    try {
      await updateListName(listId, newName);
      setLists(prev => prev.map(l => 
        l._id === listId ? { ...l, name: newName } : l
      ));
    } catch (error) {
      console.error('Error renaming list:', error);
      Alert.alert('Error', 'Failed to rename list');
    }
  };

  const handleAddTaskToList = async (listId: string, taskId: string) => {
    try {
      const updatedList = await addTaskToList(listId, taskId);
      setLists(prev => prev.map(l => 
        l._id === listId ? { ...l, taskIds: updatedList.taskIds } : l
      ));
    } catch (error) {
      console.error('Error adding task to list:', error);
      Alert.alert('Error', 'Failed to add task to list');
    }
  };

  const handleRemoveTaskFromList = async (listId: string, taskId: string) => {
    try {
      const updatedList = await removeTaskFromList(listId, taskId);
      setLists(prev => prev.map(l => 
        l._id === listId ? { ...l, taskIds: updatedList.taskIds } : l
      ));
    } catch (error) {
      console.error('Error removing task from list:', error);
      Alert.alert('Error', 'Failed to remove task from list');
    }
  };
  const handleToggleTag = useCallback((label: string) => {
    setSelectedTagLabels(prev => prev.includes(label)
      ? prev.filter(item => item !== label)
      : [...prev, label]);
  }, []);

  const handleOpenDueDateEditor = useCallback((taskId: string) => {
    setEditingDueDateTaskId(taskId);
    setNewDueDate(tasks[taskId]?.dueDate?.substring(0, 10) || '');
  }, [tasks]);

  const renderCompletedSection = () => {
    if (completedTasks.length === 0) {
      return null;
    }
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
          <AntDesign
            name={showCompleted ? 'up' : 'down'}
            size={16}
            color="#5A8A93"
          />
        </TouchableOpacity>
        {showCompleted && (
          <View style={styles.completedList}>
            {completedTasks.map(task => (
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
                handleDueDateUpdate={handleDueDateUpdate}
                onEditTask={editTask}
                assigneeOptions={assigneeOptions}
                updatingTaskId={updatingTaskId}
              />
            ))}
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
        {/* Filters */}
        <View style={styles.filtersRow}>
          <Menu
            visible={assigneeMenuVisible}
            onDismiss={() => setAssigneeMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setAssigneeMenuVisible(true)}
                style={styles.filterButton}
              >
                Assigned: {assigneeFilter === 'ALL' ? 'All' : (assigneeFilter === mongoUserId ? 'You' : (usersMap[assigneeFilter] || 'Unknown'))}
              </Button>
            }
          >
            <Menu.Item onPress={() => { setAssigneeFilter('ALL'); setAssigneeMenuVisible(false); }} title="All" />
            <Menu.Item onPress={() => { setAssigneeFilter(mongoUserId); setAssigneeMenuVisible(false); }} title="You" />
            {Object.entries(usersMap).filter(([id]) => id !== mongoUserId).map(([id, name]) => (
              <Menu.Item key={id} onPress={() => { setAssigneeFilter(id); setAssigneeMenuVisible(false); }} title={name} />
            ))}
          </Menu>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsFilterScroll} style={{ flex: 1 }}>
            {allTagLabels.map(label => {
              const selected = selectedTagLabels.includes(label);
              return (
                <Chip
                  key={label}
                  selected={selected}
                  onPress={() => setSelectedTagLabels(prev => selected ? prev.filter(l => l !== label) : [...prev, label])}
                  style={[styles.tagFilterChip, selected && styles.tagFilterChipSelected]}
                >
                  {label}
                </Chip>
              );
            })}
          </ScrollView>
          <View style={styles.matchToggle}>
            <Text style={styles.matchToggleLabel}>{tagMatchAll ? 'All' : 'Any'}</Text>
            <PaperSwitch value={tagMatchAll} onValueChange={setTagMatchAll} />
          </View>
        </View>

        <Text variant="headlineMedium" style={styles.title}>Tasks Page</Text>

        {/* Lists Section with expandable tasks */}
        {lists.length > 0 && (
          <View style={styles.listsSection}>
            <TouchableOpacity
              style={styles.listsSectionHeader}
              onPress={() => setShowLists(prev => !prev)}
              activeOpacity={0.7}
            >
              <Text style={styles.listsSectionTitle}>
                My Lists ({lists.length})
              </Text>
              <AntDesign
                name={showLists ? 'up' : 'down'}
                size={16}
                color="#5A8A93"
              />
            </TouchableOpacity>
            {showLists && (
              <View style={styles.listsList}>
                {lists.map(list => {
                  const isExpanded = expandedListId === list._id;
                  const listTasks = getTasksInList(list._id);
                  const incompleteListTasks = listTasks.filter(t => !t.completed);
                  const completedListTasks = listTasks.filter(t => t.completed);
                  
                  return (
                    <View key={list._id}>
                      <ListCard
                        list={list}
                        allTasks={tasksArray.map(t => ({ id: t.id, title: t.title }))}
                        onPress={handleListPress}
                        onDelete={handleDeleteList}
                        onRename={handleRenameList}
                        onAddTask={handleAddTaskToList}
                        onRemoveTask={handleRemoveTaskFromList}
                        isExpanded={isExpanded}
                      />
                      {/* Expanded tasks for this list */}
                      {isExpanded && (
                        <View style={styles.expandedListTasks}>
                          {listTasks.length === 0 ? (
                            <Text style={styles.emptyListText}>No tasks in this list yet.</Text>
                          ) : (
                            <>
                              {incompleteListTasks.map(task => (
                                <TaskCard
                                  key={task.id}
                                  task={task}
                                  onToggleComplete={toggleTask}
                                  onDelete={deleteTask}
                                  onToggleExpansion={toggleExpansion}
                                  onAddSubtask={addSubtask}
                                  onToggleSubtask={toggleSubtask}
                                  onDeleteSubtask={deleteSubtask}
                                  onEditSubtask={editSubtask}
                                  assignedUserName={getAssignedUserName(task.assignedToId)}
                                  onReassign={handleReassign}
                                  isReassignLoading={reassignLoading}
                                  onUpdateTags={handleUpdateTags}
                                  onEditDueDate={(taskId: string) => {
                                    setEditingDueDateTaskId(taskId);
                                    setNewDueDate(tasks[taskId]?.dueDate?.substring(0, 10) || '');
                                  }}
                                  editingDueDateTaskId={editingDueDateTaskId}
                                  newDueDate={newDueDate}
                                  setNewDueDate={setNewDueDate}
                                  handleDueDateUpdate={handleDueDateUpdate}
                                />
                              ))}
                              {completedListTasks.length > 0 && (
                                <TouchableOpacity
                                  style={styles.listCompletedHeader}
                                  onPress={() => setListCompletedVisible(prev => ({
                                    ...prev,
                                    [list._id]: prev[list._id] === undefined ? false : !prev[list._id]
                                  }))}
                                  activeOpacity={0.7}
                                >
                                  <Text style={styles.completedListLabel}>
                                    Completed ({completedListTasks.length})
                                  </Text>
                                  <AntDesign
                                    name={listCompletedVisible[list._id] !== false ? 'up' : 'down'}
                                    size={14}
                                    color="#5A8A93"
                                  />
                                </TouchableOpacity>
                              )}
                              {listCompletedVisible[list._id] !== false && completedListTasks.map(task => (
                                <TaskCard
                                  key={task.id}
                                  task={task}
                                  onToggleComplete={toggleTask}
                                  onDelete={deleteTask}
                                  onToggleExpansion={toggleExpansion}
                                  onAddSubtask={addSubtask}
                                  onToggleSubtask={toggleSubtask}
                                  onDeleteSubtask={deleteSubtask}
                                  onEditSubtask={editSubtask}
                                  assignedUserName={getAssignedUserName(task.assignedToId)}
                                  onReassign={handleReassign}
                                  isReassignLoading={reassignLoading}
                                  onUpdateTags={handleUpdateTags}
                                  onEditDueDate={(taskId: string) => {
                                    setEditingDueDateTaskId(taskId);
                                    setNewDueDate(tasks[taskId]?.dueDate?.substring(0, 10) || '');
                                  }}
                                  editingDueDateTaskId={editingDueDateTaskId}
                                  newDueDate={newDueDate}
                                  setNewDueDate={setNewDueDate}
                                  handleDueDateUpdate={handleDueDateUpdate}
                                />
                              ))}
                            </>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
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

      <FlatList
        data={incompleteTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onToggleComplete={toggleTaskCompletion}
            onDelete={deleteTask}
            onToggleExpansion={toggleTaskExpansion}
            onAddSubtask={addSubtask}
            onToggleSubtask={toggleSubtaskCompletion}
            onDeleteSubtask={deleteSubtask}
            onEditSubtask={editSubtaskText}
            assignedUserName={getAssignedUserName(item.assignedToId)}
            onReassign={reassignTask}
            isReassignLoading={isReassignLoading}
            onUpdateTags={updateTaskTags}
            onEditDueDate={handleOpenDueDateEditor}
            editingDueDateTaskId={editingDueDateTaskId}
            newDueDate={newDueDate}
            setNewDueDate={setNewDueDate}
            handleDueDateUpdate={handleDueDateUpdate}
            onEditTask={editTask}
            assigneeOptions={assigneeOptions}
            updatingTaskId={updatingTaskId}
          />
        )}

        {/* All Tasks Section */}
        <View style={styles.allTasksSection}>
          {noTasks ? (
            <Text style={styles.emptyState}>No tasks yet. Add your first one!</Text>
          ) : (
            <>
              {incompleteTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={toggleTask}
                  onDelete={deleteTask}
                  onToggleExpansion={toggleExpansion}
                  onAddSubtask={addSubtask}
                  onToggleSubtask={toggleSubtask}
                  onDeleteSubtask={deleteSubtask}
                  onEditSubtask={editSubtask}
                  assignedUserName={getAssignedUserName(task.assignedToId)}
                  onReassign={handleReassign}
                  isReassignLoading={reassignLoading}
                  onUpdateTags={handleUpdateTags}
                  onEditDueDate={(taskId: string) => {
                    setEditingDueDateTaskId(taskId);
                    setNewDueDate(tasks[taskId]?.dueDate?.substring(0, 10) || '');
                  }}
                  editingDueDateTaskId={editingDueDateTaskId}
                  newDueDate={newDueDate}
                  setNewDueDate={setNewDueDate}
                  handleDueDateUpdate={handleDueDateUpdate}
                />
              ))}
              {renderCompletedSection()}
            </>
          )}
        </View>
      </ScrollView>

      {/* Buttons Row - Fixed at bottom */}
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

      <TaskModal
        mode="create"
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={addTask}
        taskTitle={taskTitle}
        setTaskTitle={setTaskTitle}
        taskText={taskText}
        setTaskText={setTaskText}
        taskPoints={taskPoints}
        setTaskPoints={setTaskPoints}
        assignEmail={assignEmail}
        setAssignEmail={setAssignEmail}
        isAssignLoading={isAssignLoading}
        dueDate={dueDate}
        setDueDate={setDueDate}
        tags={tags}
        setTags={setTags}
        onSubmit={handleAddTask}
        isSaving={isCreatingTask}
      />

      {/* Modal for creating a list */}
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
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  // loaderContainer removed
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
  reassignButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 8,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterButton: {
    marginRight: 8,
    borderColor: '#9DBCC3',
  },
  tagsFilterScroll: {
    paddingVertical: 4,
  },
  tagFilterChip: {
    marginRight: 6,
    backgroundColor: '#EAF6F9',
  },
  tagFilterChipSelected: {
    backgroundColor: '#C7E6ED',
  },
  matchToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  matchToggleLabel: {
    marginRight: 6,
    color: '#5A8A93',
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
  },
  listsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5A8A93',
  },
  listsList: {
    marginTop: 8,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#EAF6F9',
    borderRadius: 8,
    marginRight: 12,
  },
  backButtonText: {
    marginLeft: 6,
    color: '#5A8A93',
    fontWeight: '600',
  },
  listTitle: {
    flex: 1,
    color: '#2d4150',
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
   scrollView: {
    flex: 1,
  },
  allTasksSection: {
    flex: 1,
    marginBottom: 10,
  },
  
});

export default TasksPage;
