import AntDesign from '@expo/vector-icons/AntDesign';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Modal, Platform, StyleSheet, TextInput, View } from 'react-native';
import { Button, Divider, IconButton, Text } from 'react-native-paper';
import { auth } from '../../FirebaseConfig';
import { createTask, getMongoUserByFirebaseId, getTasks, updateTask, updateUser } from '../../backend/api';
import CustomCheckbox from '../components/CustomCheckbox';

type Subtask = {
  id: string;
  text: string;
  completed: boolean;
};

type Task = {
  id: string;
  title: string;
  text: string;
  points: number;
  completed: boolean;
  subtasks: Subtask[];
  expanded: boolean;
};

const TasksPage = () => {
  const [tasks, setTasks] = useState<{ [id: string]: Task }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [mongoUserId, setMongoUserId] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskText, setTaskText] = useState('');
  const [taskPoints, setTaskPoints] = useState('');
  const tasksArray = Object.values(tasks);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchMongoUser = async () => {
      if (userId) {
        try {
          const mongoUser = await getMongoUserByFirebaseId(userId);
          setMongoUserId(mongoUser._id);
        } catch (error) {
          console.error('Error fetching MongoDB user:', error);
        }
      }
    };
    fetchMongoUser();
  }, [userId]);

  const fetchTasks = useCallback(async () => {
    if (!mongoUserId) {
      return;
    }
    try {
      setIsLoading(true);
      const data = await getTasks();
      if (!Array.isArray(data)) {
        throw new Error('Unexpected response when fetching tasks');
      }

      const formattedTasks = data
        .filter(task => task.userId === mongoUserId)
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
          };
          return acc;
        }, {} as { [id: string]: Task });

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [mongoUserId]);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
      return undefined;
    }, [fetchTasks])
  );

  const addTask = async () => {
    if (!mongoUserId) {
      console.warn("Mongo user ID not loaded yet!");
      return;
    }
    let taskObject = {
      title: taskTitle,
      text: taskText,
      completed: false,
      createdAt: new Date().toISOString(),
      points: Number(taskPoints),
      userId: mongoUserId
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
    };
    setTasks(prevTasks => ({
      ...prevTasks,
      [newTask.id]: newTask
    }));
    setModalVisible(false);
    setTaskTitle('');
    setTaskText('');
    setTaskPoints('');
  };

  const addSubtask = (taskId: string) => { 
    const newSubtask: Subtask = {
      id: Date.now().toString(),
      text: 'New Subtask',
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

  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => {
      const { [taskId]: deletedTask, ...remainingTasks } = prevTasks;
      return remainingTasks;
    });
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prevTasks => {
      const task = prevTasks[taskId];
      if (task) {
        const updatedSubtasks = task.subtasks.filter(subtask => subtask.id !== subtaskId);
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
  //fetch tasks from backend every time i come back to this screen
  
  

  // 4. Render Functions
  const renderTask = ({ item }: { item: Task }) => (
    <View style={styles.taskCard}>
      <View style={styles.taskContent}>
        <CustomCheckbox
          status={item.completed ? 'checked' : 'unchecked'}
          onPress={() => toggleTask(item.id)}
        />
        <View style={{ flex: 1 }}>
          <Text variant="titleMedium" style={styles.taskTitle}>
            {item.title}
          </Text>
          <Text
            variant="bodyLarge"
            style={[styles.taskText, item.completed && styles.completedTask]}
          >
            {item.text}
          </Text>
        </View>
        <Text style={styles.pointsText}>
          {item.points ?? 0} pts
        </Text>
        <IconButton
          icon={() => <AntDesign name="close" size={20} color="#666" />}
          size={20}
          onPress={() => deleteTask(item.id)}
          style={styles.deleteButton}
        />
      </View>
      <Divider />
    </View>
  );


  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Text variant="headlineMedium" style={styles.title}>Tasks Page</Text>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#5A8A93" />
        </View>
      ) : (
        <FlatList
          data={tasksArray}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          style={styles.tasksList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text style={styles.emptyState}>No tasks yet. Add your first one!</Text>
          }
        />
      )}

      {/* Add Task Button */}
      <Button
        mode="contained"
        style={styles.addTaskButton}
        onPress={() => setModalVisible(true)}
        icon="plus"
      >
        Add Task
      </Button>

      {/* Modal for adding a task */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
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
              <Button mode="contained" onPress={addTask} disabled={!taskTitle || !taskPoints}>
                Add
              </Button>
              <Button mode="outlined" onPress={() => setModalVisible(false)} style={{ marginLeft: 10 }}>
                Cancel
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
  taskTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  pointsText: {
    marginLeft: 8,
    color: '#5A8A93',
    fontWeight: '600',
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  tasksList: {
    flex: 1,
    marginBottom: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    textAlign: 'center',
    color: '#5A8A93',
    marginTop: 40,
  },
  taskCard: {
    marginBottom: 8,
    elevation: 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: "#5A8A93",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskText: {
    flex: 1,
    marginLeft: 8,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  deleteButton: {
    margin: 0,
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
});

export default TasksPage;
