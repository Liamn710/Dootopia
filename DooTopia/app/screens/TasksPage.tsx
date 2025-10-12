import AntDesign from '@expo/vector-icons/AntDesign';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, Divider, IconButton, Text } from 'react-native-paper';
import { auth } from '../../FirebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { createTask, getMongoUserByFirebaseId, getTasks, updateTask, updateUser, getUsers, getMongoUserByEmail } from '../../backend/api';
import CustomCheckbox from '../components/CustomCheckbox';
import AddTaskModal from '../components/AddTaskModal';
import { deleteTask as deleteTaskApi,deleteSubtask as deleteSubtaskApi} from '../../backend/api';
import TaskCard from '../components/TaskCard';
import type { Subtask } from '../types/Subtask';
import type { Task, TaskDictionary } from '../types/Task';

const TasksPage = () => {
  const [tasks, setTasks] = useState<TaskDictionary>({});
  // Removed loading animation/state
  const [mongoUserId, setMongoUserId] = useState<string>('');
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
  const tasksArray: Task[] = Object.values(tasks);
  const incompleteTasks = tasksArray.filter(task => !task.completed);
  const completedTasks = tasksArray.filter(task => task.completed);
  const noTasks = tasksArray.length === 0;
  
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
    const fetchMongoUser = async () => {
      if (userId) {
        try {
          const mongoUser = await getMongoUserByFirebaseId(userId);
          if (mongoUser && mongoUser._id) {
            setMongoUserId(mongoUser._id);
          } else {
            setMongoUserId('');
            console.error('Mongo user not found or missing _id:', mongoUser);
          }
        } catch (error) {
          setMongoUserId('');
          console.error('Error fetching MongoDB user:', error);
        }
      } else {
        setMongoUserId('');
      }
    };
    fetchMongoUser();
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
      const data = await getTasks();
      if (!Array.isArray(data)) {
        throw new Error('Unexpected response when fetching tasks');
      }

      const formattedTasks = data
        .filter(task => task.assignedToId === mongoUserId || task.userId === mongoUserId)
        .reduce((acc: { [id: string]: Task }, task: any) => {
          const taskId = task._id ?? task.id;
          if (!taskId) {
            return acc;
          }
          acc[taskId as string] = {
            id: taskId as string,
            title: task.title ?? 'Untitled Task',
            text: task.text ?? '',
            points: Number(task.points) || 0,
            completed: Boolean(task.completed),
            subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
            expanded: false,
            assignedToId: task.assignedToId, // <-- add this line
          };
          return acc;
        }, {} as TaskDictionary);

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      // no loading state to update
    }
  }, [mongoUserId]);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
      return undefined;
    }, [fetchTasks])
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
      assignedToId: assignToId // <-- use assignedToId here
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
      assignedToId: result.assignedToId, // <-- add this line
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
  };
  const addSubtask = (taskId: string) => { 
    const newSubtask: Subtask = {
      id: Date.now().toString(),
      text: 'Tap to add subtask',
      completed: false,
    };

    setTasks(prevTasks => {
      const task = prevTasks[taskId];
      if (task) {
        return {
          ...prevTasks,
          [taskId]: {
            ...task,
            subtasks: [...task.subtasks, newSubtask],
          },
        };
      }
      return prevTasks;
    });
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

  //
  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prevTasks => {
      const task = prevTasks[taskId];
      if (task) {
        const updatedSubtasks = task.subtasks.map(subtask =>
          subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
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
              />
            ))}
          </View>
        )}
      </View>
    );
  };


  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
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
