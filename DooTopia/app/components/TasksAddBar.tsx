import AntDesign from '@expo/vector-icons/AntDesign';
import * as React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { IconButton, TextInput} from 'react-native-paper';
import FavButton from './FavButton';
import { useState } from 'react';


export interface Subtask {
  id: string;           // Unique identifier
  text: string;         // Subtask content
  completed: boolean;   // Completion status
}

export interface Task {
  id: string;
  title: string;
  text: string;
  points: number;
  completed: boolean;
  subtasks: Subtask[];
  expanded: boolean;
}


interface TasksAddBarProps {
  onAddTask: (title: string, text: string, points: number) => void;
}

const TasksAddBar: React.FC<TasksAddBarProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [points, setPoints] = useState('');

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Task Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Task Description"
        value={text}
        onChangeText={setText}
      />
      <TextInput
        style={styles.input}
        placeholder="Points"
        value={points}
        onChangeText={setPoints}
        keyboardType="numeric"
      />
      <Button
        title="Add Task"
        onPress={() => {
          if (title && text && points) {
            onAddTask(title, text, parseInt(points, 10));
            setTitle('');
            setText('');
            setPoints('');
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
    
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        marginRight: 8,
    },
    button: {
        margin: 0,
    },
});

export default TasksAddBar;