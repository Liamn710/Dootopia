import AntDesign from '@expo/vector-icons/AntDesign';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
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
        style={styles.tasksList}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          noTasks ? (
            <Text style={styles.emptyState}>No tasks yet. Add your first one!</Text>
          ) : null
        }
        ListFooterComponent={renderCompletedSection}
      />

      <Button
        mode="contained"
        style={styles.addTaskButton}
        onPress={() => setModalVisible(true)}
        icon={() => <AntDesign name="plus" size={20} color="#fff" />}
      >
        Add Task
      </Button>

      <TaskModal
        mode="create"
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddTask}
        isSaving={isCreatingTask}
      />

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
  tasksList: {
    flex: 1,
    marginBottom: 10,
  },
  // loaderContainer removed
  emptyState: {
    textAlign: 'center',
    color: '#5A8A93',
    marginTop: 40,
  },
  addTaskButton: {
    marginTop: 10,
    backgroundColor: "#5A8A93",
    borderRadius: 8,
    alignSelf: "center",
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
});

export default TasksPage;
