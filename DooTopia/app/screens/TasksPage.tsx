import AntDesign from '@expo/vector-icons/AntDesign';
import { useFocusEffect } from '@react-navigation/native';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Chip, Menu, Switch as PaperSwitch, Text } from 'react-native-paper';
import {
    createSubtask,
    createTask,
    createUser,
    deleteSubtask as deleteSubtaskApi,
    deleteTask as deleteTaskApi,
    getMongoUserByEmail,
    getMongoUserByFirebaseId,
    getSubtasks,
    getTasks,
    getUsers,
    updateSubtask, // Add this import
    updateTask,
    updateUser
} from '../../backend/api';
import { auth } from '../../FirebaseConfig';
import AddTaskModal from '../components/AddTaskModal';
import TaskCard from '../components/TaskCard';
import type { Subtask } from '../types/Subtask';
import type { Tag as TagItem, Task, TaskDictionary } from '../types/Task';

const TasksPage = () => {
  const [tasks, setTasks] = useState<TaskDictionary>({});
  const [mongoUserId, setMongoUserId] = useState<string>('');
  const [mongoUserLoading, setMongoUserLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskText, setTaskText] = useState('');
  const [taskPoints, setTaskPoints] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [assignEmail, setAssignEmail] = useState('');
  const [isAssignLoading, setIsAssignLoading] = useState(false);
  const [reassignLoading, setReassignLoading] = useState(false);
  const [usersMap, setUsersMap] = useState<{ [id: string]: string }>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState<TagItem[]>([]);
  const [editingDueDateTaskId, setEditingDueDateTaskId] = useState<string | null>(null);
  const [newDueDate, setNewDueDate] = useState<string>('');
  // Filters
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');
  const [assigneeMenuVisible, setAssigneeMenuVisible] = useState(false);
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
  const incompleteTasks = filteredTasks.filter(task => !task.completed);
  const completedTasks = filteredTasks.filter(task => task.completed);
  const noTasks = filteredTasks.length === 0;
  
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

  const fetchTasks = useCallback(async () => {
    if (!mongoUserId) {
      return;
    }
    try {
      const [tasksData, subtasksData] = await Promise.all([
        getTasks(),
        getSubtasks() // Fetch all subtasks
      ]);

      if (!Array.isArray(tasksData)) {
        throw new Error('Unexpected response when fetching tasks');
      }

      const formattedTasks = tasksData
        .filter(task => task.assignedToId === mongoUserId || task.userId === mongoUserId)
        .reduce((acc: { [id: string]: Task }, task: any) => {
          const taskId = task._id ?? task.id;
          if (!taskId) {
            return acc;
          }

          // Find subtasks for this task
          const taskSubtasks = subtasksData
            .filter((subtask: any) => subtask.parentTaskId === taskId)
            .map((subtask: any) => ({
              id: subtask._id,
              text: subtask.text || subtask.title,
              completed: subtask.completed || false,
            }));

          // Normalize tags from backend: may be strings or objects
          const normalizedTags: TagItem[] = Array.isArray(task.tags)
            ? task.tags.map((t: any) => typeof t === 'string' ? ({ label: t }) : ({ label: t.label ?? String(t), color: t.color }))
            : [];

          acc[taskId as string] = {
            id: taskId as string,
            title: task.title ?? 'Untitled Task',
            text: task.text ?? '',
            points: Number(task.points) || 0,
            completed: Boolean(task.completed),
            subtasks: taskSubtasks, // Use subtasks from MongoDB
            expanded: false,
            assignedToId: task.assignedToId,
            dueDate: task.dueDate,
            tags: normalizedTags,
          };
          return acc;
        }, {} as TaskDictionary);

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, [mongoUserId]);

  // Only fetch tasks after mongoUserId is loaded and not loading
  useFocusEffect(
    useCallback(() => {
      if (!mongoUserLoading && mongoUserId) {
        fetchTasks();
      }
      return undefined;
    }, [fetchTasks, mongoUserId, mongoUserLoading])
  );

  const addTask = async (emailToAssign: string) => {
    if (!mongoUserId) {
      console.warn("Mongo user ID not loaded yet!");
      return;
    }
    setIsAssignLoading(true);
    let assignToId = mongoUserId;
    if (emailToAssign && emailToAssign !== "") {
      try {
        const assignedUser = await getMongoUserByEmail(emailToAssign);
        if (assignedUser && assignedUser._id) {
          assignToId = assignedUser._id;
        } else {
          Alert.alert('Error', 'No user found with that email. Assigning to yourself.');
        }
      } catch (error) {
        Alert.alert('Error', 'No user found with that email. Assigning to yourself.');
      }
    }

    let taskObject = {
      title: taskTitle,
      text: taskText,
      completed: false,
      createdAt: new Date().toISOString(),
      points: Number(taskPoints),
      userId: mongoUserId,
      assignedToId: assignToId,
      dueDate: dueDate || undefined,
      tags: Array.isArray(tags) ? tags.map(t => ({ label: t.label, color: t.color })) : [],
    };

    const result = await createTask(taskObject);

    const newTask: Task = {
      title: taskTitle,
      points: Number(taskPoints),
      id: result._id,
      text: taskText,
      completed: false,
      subtasks: [],
      expanded: false,
      assignedToId: result.assignedToId,
      dueDate: result.dueDate || undefined,
      tags: Array.isArray(result.tags)
        ? result.tags.map((t: any) => typeof t === 'string' ? ({ label: t }) : ({ label: t.label ?? String(t), color: t.color }))
        : (Array.isArray(tags) ? tags : []),
    };
    setTasks(prevTasks => ({
      ...prevTasks,
      [newTask.id]: newTask
    }));
    setModalVisible(false);
    setTaskTitle('');
    setTaskText('');
    setTaskPoints('');
    setAssignEmail('');
    setIsAssignLoading(false);
    setDueDate('');
    setTags([]);
  };
  const addSubtask = async (taskId: string, subtaskText: string) => { 
    if (!subtaskText.trim()) {
      Alert.alert('Error', 'Please enter subtask text');
      return;
    }

    console.log('=== DEBUGGING SUBTASK CREATION ===');
    console.log('TaskId received:', taskId);
    console.log('Task from state:', tasks[taskId]);
    console.log('All tasks keys:', Object.keys(tasks));
    console.log('MongoDB User ID:', mongoUserId);

    try {
      // Create the subtask object for the API
      const subtaskForApi = {
        title: subtaskText.trim(),
        text: subtaskText.trim(),
        parentTaskId: taskId, // This should be the MongoDB _id
        completed: false,
        createdAt: new Date().toISOString(),
        points: 0,
        userId: mongoUserId,
      };

      console.log('Subtask object to send:', subtaskForApi);

      // Call your API to create the subtask in MongoDB
      const result = await createSubtask(subtaskForApi);
      
      console.log('Subtask creation result:', result);
      
      // Update local state with the actual subtask from MongoDB
      const finalSubtask: Subtask = {
        id: result._id, // Use MongoDB's _id
        text: result.text || result.title, // Use text or fall back to title
        completed: result.completed,
      };

      setTasks(prevTasks => {
        const task = prevTasks[taskId];
        if (task) {
          return {
            ...prevTasks,
            [taskId]: {
              ...task,
              subtasks: [...task.subtasks, finalSubtask],
            },
          };
        }
        return prevTasks;
      });
    } catch (error) {
      console.error('Error creating subtask:', error);
      Alert.alert('Error', 'Failed to create subtask');
    }
   };


  const toggleTask = async (taskId: string) => { 
  setTasks(prevTasks => {
    const task = prevTasks[taskId];
    if (task && taskId) {
      const updatedTask = {
        ...task,
        completed: !task.completed,
      };

      // Update task in backend
      updateTask(taskId, { completed: updatedTask.completed });

      // Calculate new points for user
      const pointsChange = updatedTask.completed ? task.points : -task.points;

      // Update user points in backend
      updateUser(mongoUserId, { $inc: { points: pointsChange } });

      return {
        ...prevTasks,
        [taskId]: updatedTask,
      };
    }
    return prevTasks;
  });
};

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    setTasks(prevTasks => {
      const task = prevTasks[taskId];
      if (task) {
        const updatedSubtasks = task.subtasks.map(subtask => {
          if (subtask.id === subtaskId) {
            const updatedSubtask = { ...subtask, completed: !subtask.completed };
            
            // Update subtask in backend with ALL required fields INCLUDING parentTaskId
            updateSubtask(subtaskId, { 
              title: updatedSubtask.text, // Send the text as title
              text: updatedSubtask.text,  // Send the text
              completed: updatedSubtask.completed,
              parentTaskId: taskId, // ADD THIS LINE - preserve the parent task ID
            })
              .catch(error => {
                console.error('Failed to update subtask in backend:', error);
              });
            
            return updatedSubtask;
          }
          return subtask;
        });
        
        return {
          ...prevTasks,
          [taskId]: {
            ...task,
            subtasks: updatedSubtasks,
          },
        };
      }
      return prevTasks;
    });
  };

  const toggleExpansion = (taskId: string) => {
    setTasks(prevTasks => {
      const task = prevTasks[taskId];
      if (task) {
        return {
          ...prevTasks,
          [taskId]: {
            ...task,
            expanded: !task.expanded,
          },
        };
      }
      return prevTasks;
    });
  };

  //TODO : Make asyc in order to delete from backend as well as make it const
  const deleteTask = async (taskId: string) => {
    try {
      await deleteTaskApi(taskId);
      setTasks(prev => {
        const { [taskId]: _removed, ...rest } = prev;
        return rest;
      });
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  //TODO : Make asyc in order to delete from backend as well as make it const
  const deleteSubtask = async (taskId: string, subtaskId: string) => {
    try {
      await deleteSubtaskApi(subtaskId);
      setTasks(prev => {
        const task = prev[taskId];
        if (!task) return prev;
        return {
          ...prev,
          [taskId]: {
            ...task,
            subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId),
          },
        };
      });
    } catch (err) {
      console.error('Failed to delete subtask', err);
    }
  };

  const editSubtask = (taskId: string, subtaskId: string, newText: string) => {
    setTasks(prevTasks => {
      const task = prevTasks[taskId];
      if (task) {
        const updatedSubtasks = task.subtasks.map(subtask =>
          subtask.id === subtaskId ? { ...subtask, text: newText } : subtask
        );
        return {
          ...prevTasks,
          [taskId]: {
            ...task,
            subtasks: updatedSubtasks,
          },
        };
      }
      return prevTasks;
    });
  };  
  
  const handleDueDateUpdate = async (taskId: string, dueDate: string) => {
    try {
      await updateTask(taskId, { dueDate });
      setTasks(prevTasks => ({
        ...prevTasks,
        [taskId]: {
          ...prevTasks[taskId],
          dueDate,
        }
      }));
      setEditingDueDateTaskId(null);
      setNewDueDate('');
    } catch (err) {
      Alert.alert('Error', 'Failed to update due date.');
    }
  };

  // Assignment handler for TaskCard
  const handleReassign = async (taskId: string, email: string) => {
    setReassignLoading(true);
    let newAssignedToId = mongoUserId;
    if (email && email !== "") {
      try {
        const assignedUser = await getMongoUserByEmail(email);
        if (assignedUser && assignedUser._id) {
          newAssignedToId = assignedUser._id;
        } else {
          Alert.alert('Error', 'No user found with that email. Assigning to yourself.');
        }
      } catch (error) {
        Alert.alert('Error', 'No user found with that email. Assigning to yourself.');
      }
    }
    await updateTask(taskId, { assignedToId: newAssignedToId });
    setTasks(prevTasks => ({
      ...prevTasks,
      [taskId]: {
        ...prevTasks[taskId]!,
        assignedToId: newAssignedToId,
      }
    }));
    setReassignLoading(false);
  };

  const getAssignedUserName = (assignedToId?: string) => {
    if (!assignedToId || assignedToId === mongoUserId) return "You";
    return usersMap[assignedToId] || "Unknown";
  };

  // Update tags handler: remove/add tags for existing tasks
  const handleUpdateTags = async (taskId: string, updatedTags: TagItem[]) => {
    try {
      await updateTask(taskId, { tags: updatedTags.map(t => ({ label: t.label, color: t.color })) });
      setTasks(prev => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          tags: updatedTags,
        }
      }));
    } catch (e) {
      console.error('Failed to update tags', e);
      Alert.alert('Error', 'Failed to update tags');
    }
  };



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

      <FlatList
        data={incompleteTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onToggleComplete={toggleTask}
            onDelete={deleteTask}
            onToggleExpansion={toggleExpansion}
            onAddSubtask={addSubtask}
            onToggleSubtask={toggleSubtask}
            onDeleteSubtask={deleteSubtask}
            onEditSubtask={editSubtask}
            assignedUserName={getAssignedUserName(item.assignedToId)}
            onReassign={handleReassign}
            isReassignLoading={reassignLoading}
            onUpdateTags={handleUpdateTags}
            // Add these props:
            onEditDueDate={(taskId: string) => {
              setEditingDueDateTaskId(taskId);
              setNewDueDate(tasks[taskId]?.dueDate?.substring(0, 10) || '');
            }}
            editingDueDateTaskId={editingDueDateTaskId}
            newDueDate={newDueDate}
            setNewDueDate={setNewDueDate}
            handleDueDateUpdate={handleDueDateUpdate}
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

      {/* Add Task Button */}
      <Button
        mode="contained"
        style={styles.addTaskButton}
        onPress={() => setModalVisible(true)}
        icon={() => <AntDesign name="plus" size={20} color="#fff" />}
      >
        Add Task
      </Button>

      {/* Modal for adding a task */}
      <AddTaskModal
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
        dueDate={dueDate} // Pass dueDate
        setDueDate={setDueDate} // Pass setter
        tags={tags}
        setTags={setTags}
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
});

export default TasksPage;
