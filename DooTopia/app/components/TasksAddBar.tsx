import AntDesign from '@expo/vector-icons/AntDesign';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, TextInput} from 'react-native-paper';
import FavButton from './FavButton';


export interface Subtask {
  id: string;           // Unique identifier
  text: string;         // Subtask content
  completed: boolean;   // Completion status
}

export interface Task {
  id: string;           // Unique identifier
  text: string;         // Task content
  completed: boolean;   // Completion status
  subtasks: Subtask[];  // Array of subtasks
  expanded: boolean;  
  points: number;       // Points associated with the task
  userId: string;      // ID of the user who created the task
}


export interface TasksAddBarProps {
    onAddTask: (taskText: string) => void; // Function to handle adding a new task
    }

const TasksAddBar = ({onAddTask} : TasksAddBarProps) => {
    const [taskText , setTaskText] = React.useState<string>(''); // State for task input

    const handleAddTask = () => {
        if (taskText.trim()) {
            onAddTask(taskText.trim()); // Call the function to add the task
            setTaskText(''); // Clear the input field
        }
    };
    
    return (
        <View style={styles.container}>
            <TextInput
                label="Add a new task"
                value={taskText}
                onChangeText={setTaskText}
                style={styles.input}
                mode="outlined"
                autoCapitalize="sentences"
                returnKeyType="done"
                onSubmitEditing={handleAddTask}
                blurOnSubmit={false}
            />
            <IconButton
                icon={() => <AntDesign name="plus" size={24} color="#666" />}
                size={24}
                onPress={handleAddTask}
                style={styles.button}
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