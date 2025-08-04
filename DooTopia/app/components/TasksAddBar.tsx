import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, TextInput } from 'react-native-paper';

interface Subtask {
  id: string;           // Unique identifier
  text: string;         // Subtask content
  completed: boolean;   // Completion status
}

interface Task {
  id: string;           // Unique identifier
  text: string;         // Task content
  completed: boolean;   // Completion status
  subtasks: Subtask[];  // Array of subtasks
  expanded: boolean;    // Show/hide subtasks
}

interface TasksAddBarProps {
  onAddTask: (taskText: string)=>void;
}

const TasksAddBar: React.FC<TasksAddBarProps> = ({ onAddTask }) => (
  <IconButton
    icon="plus"
    iconColor="#5A8A93" // Matches your app's color scheme
    size={24}

  />
);

export default TasksAddBar;