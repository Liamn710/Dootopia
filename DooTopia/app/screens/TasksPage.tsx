import AntDesign from '@expo/vector-icons/AntDesign';
import React from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Divider, IconButton, Text } from 'react-native-paper';
import CustomCheckbox from '../components/CustomCheckbox';
import TasksAddBar, { Subtask, Task } from '../components/TasksAddBar';
import { auth } from '../../FirebaseConfig';
import {createTask} from '../../backend/api'


const TasksPage = () => {
  const [tasks, setTasks] = React.useState<{ [id: string]: Task }>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const tasksArray = Object.values(tasks);
    const userId = auth.currentUser?.uid;


  const addTask = (taskTitle: string, taskText: string, taskPoints: number) => {
      const newTask: Task = {
      title: taskTitle,
      points: taskPoints,
      id: Date.now().toString(),
      text: taskText,
      completed:false,
      subtasks: [],
      expanded: false,
    }
    let taskObject = {
      title: newTask.title,
      text: newTask.text,
      completed: newTask.completed,
      createdAt: new Date().toISOString(),
      points: newTask.points,
      userId: userId
    }
    createTask(taskObject);

    setTasks(prevTasks => ({
    ...prevTasks,
    [newTask.id]: newTask
  }));
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


  const toggleTask = (taskId: string) => { 
    setTasks(prevTasks => {
      const task = prevTasks[taskId];
      if (task) {
        return {
          ...prevTasks,
          [taskId]: {
            ...task,
            completed: !task.completed,
          },
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
};

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

export default TasksPage;
