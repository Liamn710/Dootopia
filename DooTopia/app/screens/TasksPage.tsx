import AntDesign from '@expo/vector-icons/AntDesign';
import React, { memo, useCallback } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Divider, IconButton, Text } from 'react-native-paper';
import { auth } from '../../FirebaseConfig';
import CustomCheckbox from '../components/CustomCheckbox';
import TasksAddBar, { Subtask, Task } from '../components/TasksAddBar';
import { createTask, getTasks, updateTask, deleteTask as deleteTaskAPI } from '../../backend/api';
import { set } from 'lodash';


const TasksPage = memo(() => {
  const [tasks, setTasks] = React.useState<{ [id: string]: Task }>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const tasksArray = Object.values(tasks);
  const userId = auth.currentUser?.uid;

 
const fetchTasks = useCallback(async () => {
    if (!userId) return;


    setIsLoading(true);
    try {
      const fetchedTasks = await getTasks(userId);
      if(!fetchedTasks.error){
        const taskMap: { [id: string]: Task } = {};
        fetchedTasks.forEach((task: any) => {
          taskMap[task.id] = {
            id: task.id,
            title: task.title,
            text: task.text,
            points: task.points,
            completed: task.completed,
            subtasks: task.subtasks || [],
            expanded: false,
          };
        });
        setTasks(taskMap);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Fetch Tasks on Mount
  const addTask = async (taskTitle: string, taskText: string, taskPoints: number) => {
  const taskObject = {
    title: taskTitle,
    text: taskText,
    completed: false,
    createdAt: new Date().toISOString(),
    points: taskPoints,
    userId: userId
  };

  try {
    const result = await createTask(taskObject);
    if (!result.error && result.taskId) {
      // Add the task to local state with the MongoDB _id
      const newTask: Task = {
        id: result.taskId,
        title: taskTitle,
        text: taskText,
        points: taskPoints,
        completed: false,
        subtasks: [],
        expanded: false,
      };

      setTasks(prevTasks => ({
        ...prevTasks,
        [result.taskId]: newTask
      }));
    }
  } catch (error) {
    console.error('Error creating task:', error);
  }
};


  const addSubtask = useCallback((taskId: string) => { 
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
   }, []);


  const toggleTask = useCallback(async (taskId: string) => {
  const task = tasks[taskId];
  if (!task) return;

  const updatedTask = {
    ...task,
    completed: !task.completed,
    userId: userId
  };

  try {
    await updateTask(taskId, updatedTask);
    setTasks(prevTasks => ({
      ...prevTasks,
      [taskId]: {
        ...prevTasks[taskId],
        completed: !prevTasks[taskId].completed,
      },
    }));
  } catch (error) {
    console.error('Error updating task:', error);
  }
}, [tasks, userId]);


  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
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
  }, []);

  const toggleExpansion = useCallback((taskId: string) => {
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
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
  try {
    await deleteTaskAPI(taskId);
    setTasks(prevTasks => {
      const { [taskId]: deletedTask, ...remainingTasks } = prevTasks;
      return remainingTasks;
    });
  } catch (error) {
    console.error('Error deleting task:', error);
  }
}, []);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
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
  }, []);

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

      <FlatList
        data={tasksArray}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        style={styles.tasksList}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps= "handled"
      />
      <TasksAddBar onAddTask={addTask} />
    </KeyboardAvoidingView>
  );
});

export default TasksPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '',
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
  taskCard: {
    marginBottom: 8,
    elevation: 50,
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
});
