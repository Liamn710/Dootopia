# 📝 Tasks Page Development Guide

> **Goal**: Build a React Native tasks page with collapsible subtasks, checkboxes, and strike-through completed items

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Prerequisites](#-prerequisites)
3. [File Structure](#-file-structure)
4. [Data Structure Design](#-data-structure-design)
5. [Component Architecture](#-component-architecture)
6. [Step-by-Step Implementation](#-step-by-step-implementation)
7. [Styling Guide](#-styling-guide)
8. [Testing Checklist](#-testing-checklist)
9. [Advanced Features](#-advanced-features)
10. [Troubleshooting](#-troubleshooting)

---

## 🎯 Project Overview

### Features to Implement

- ✅ Add main tasks
- ✅ Add collapsible subtasks to each task
- ✅ Check/uncheck tasks and subtasks with checkboxes
- ✅ Strike-through and gray text for completed items
- ✅ Delete tasks and subtasks
- ✅ Expand/collapse subtasks
- ✅ Clean, modern UI design

### Technical Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Icons**: @expo/vector-icons
- **Navigation**: expo-router
- **State Management**: React hooks (useState)

---

## 🔧 Prerequisites

### Required Dependencies

```json
{
  "@expo/vector-icons": "^14.1.0",
  "expo-router": "~5.1.3",
  "react": "19.0.0",
  "react-native": "0.79.5"
}
```

### Development Environment

- VS Code with React Native extensions
- Expo CLI
- Android Studio/Xcode (for testing)

---

## 📁 File Structure

```
app/screens/
├── TasksPage.tsx        # Main tasks component
├── Navigation.tsx       # Bottom navigation (optional)
└── _layout.tsx         # Screen layout configuration
```

### File Creation Order

1. `TasksPage.tsx` - Core functionality
2. `Navigation.tsx` - Navigation component
3. Update `index.tsx` - Route to tasks page

---

## 🏗️ Data Structure Design

### TypeScript Interfaces

```typescript
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
```

### State Structure

```typescript
const [tasks, setTasks] = useState<Task[]>([]);
const [newTaskText, setNewTaskText] = useState('');
const [newSubtaskText, setNewSubtaskText] = useState('');
const [addingSubtaskTo, setAddingSubtaskTo] = useState<string | null>(null);
```

---

## 🏛️ Component Architecture

### Main Component Structure

```typescript
const TasksPage: React.FC = () => {
  // 1. State Management
  const [tasks, setTasks] = useState<Task[]>([]);
  // ... other state variables

  // 2. Helper Functions
  const generateId = () => Date.now().toString() + Math.random().toString(36);

  // 3. Core Functions
  const addTask = () => { /* Implementation */ };
  const addSubtask = (taskId: string) => { /* Implementation */ };
  const toggleTask = (taskId: string) => { /* Implementation */ };
  const toggleSubtask = (taskId: string, subtaskId: string) => { /* Implementation */ };
  const toggleExpansion = (taskId: string) => { /* Implementation */ };
  const deleteTask = (taskId: string) => { /* Implementation */ };
  const deleteSubtask = (taskId: string, subtaskId: string) => { /* Implementation */ };

  // 4. Render Functions
  const renderTask = (task: Task) => { /* Implementation */ };

  // 5. Main Render
  return (
    <SafeAreaView style={styles.container}>
      {/* UI Components */}
    </SafeAreaView>
  );
};
```

---

## 🚀 Step-by-Step Implementation

### Step 1: Create Base File Structure

**Create `TasksPage.tsx`:**

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Add interfaces here
// Add component here
// Add styles here

export default TasksPage;
```

### Step 2: Implement Data Structures

**Add TypeScript interfaces:**

```typescript
interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
  subtasks: Subtask[];
  expanded: boolean;
}
```

### Step 3: Create Core Functions

#### 3.1 Add Task Function

```typescript
const addTask = () => {
  if (newTaskText.trim() === '') {
    Alert.alert('Error', 'Please enter a task name');
    return;
  }

  const newTask: Task = {
    id: generateId(),
    text: newTaskText.trim(),
    completed: false,
    subtasks: [],
    expanded: false,
  };

  setTasks([...tasks, newTask]);
  setNewTaskText('');
};
```

#### 3.2 Toggle Task Completion

```typescript
const toggleTask = (taskId: string) => {
  setTasks(tasks.map(task => 
    task.id === taskId 
      ? { ...task, completed: !task.completed }
      : task
  ));
};
```

#### 3.3 Add Subtask Function

```typescript
const addSubtask = (taskId: string) => {
  if (newSubtaskText.trim() === '') {
    Alert.alert('Error', 'Please enter a subtask name');
    return;
  }

  const newSubtask: Subtask = {
    id: generateId(),
    text: newSubtaskText.trim(),
    completed: false,
  };

  setTasks(tasks.map(task => 
    task.id === taskId 
      ? { ...task, subtasks: [...task.subtasks, newSubtask] }
      : task
  ));
  
  setNewSubtaskText('');
  setAddingSubtaskTo(null);
};
```

#### 3.4 Toggle Subtask Completion

```typescript
const toggleSubtask = (taskId: string, subtaskId: string) => {
  setTasks(tasks.map(task => 
    task.id === taskId 
      ? {
          ...task,
          subtasks: task.subtasks.map(subtask =>
            subtask.id === subtaskId
              ? { ...subtask, completed: !subtask.completed }
              : subtask
          )
        }
      : task
  ));
};
```

#### 3.5 Toggle Expansion (Collapsible)

```typescript
const toggleExpansion = (taskId: string) => {
  setTasks(tasks.map(task => 
    task.id === taskId 
      ? { ...task, expanded: !task.expanded }
      : task
  ));
};
```

#### 3.6 Delete Functions

```typescript
const deleteTask = (taskId: string) => {
  Alert.alert(
    'Delete Task',
    'Are you sure you want to delete this task?',
    [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: () => setTasks(tasks.filter(task => task.id !== taskId))
      }
    ]
  );
};

const deleteSubtask = (taskId: string, subtaskId: string) => {
  setTasks(tasks.map(task => 
    task.id === taskId 
      ? {
          ...task,
          subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId)
        }
      : task
  ));
};
```

### Step 4: Build UI Components

#### 4.1 Main Layout

```typescript
return (
  <SafeAreaView style={styles.container}>
    <Text style={styles.header}>My Tasks</Text>
  
    {/* Add New Task Input */}
    <View style={styles.addTaskContainer}>
      <TextInput
        style={styles.taskInput}
        placeholder="Enter a new task..."
        value={newTaskText}
        onChangeText={setNewTaskText}
        onSubmitEditing={addTask}
      />
      <TouchableOpacity style={styles.addButton} onPress={addTask}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>

    {/* Tasks List */}
    <ScrollView style={styles.tasksContainer} showsVerticalScrollIndicator={false}>
      {tasks.length === 0 ? (
        <Text style={styles.emptyText}>No tasks yet. Add one above!</Text>
      ) : (
        tasks.map(renderTask)
      )}
    </ScrollView>
  </SafeAreaView>
);
```

#### 4.2 Task Item Renderer

```typescript
const renderTask = (task: Task) => (
  <View key={task.id} style={styles.taskContainer}>
    {/* Main Task Row */}
    <View style={styles.taskRow}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => toggleTask(task.id)}
      >
        <Ionicons
          name={task.completed ? "checkbox" : "square-outline"}
          size={24}
          color={task.completed ? "#ccc" : "#007AFF"}
        />
      </TouchableOpacity>
  
      <Text style={[
        styles.taskText,
        task.completed && styles.completedTaskText
      ]}>
        {task.text}
      </Text>
  
      <View style={styles.taskActions}>
        {task.subtasks.length > 0 && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleExpansion(task.id)}
          >
            <Ionicons
              name={task.expanded ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        )}
    
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setAddingSubtaskTo(task.id)}
        >
          <Ionicons name="add" size={20} color="#007AFF" />
        </TouchableOpacity>
    
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => deleteTask(task.id)}
        >
          <Ionicons name="trash" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>

    {/* Add Subtask Input */}
    {addingSubtaskTo === task.id && (
      <View style={styles.addSubtaskContainer}>
        <TextInput
          style={styles.subtaskInput}
          placeholder="Enter subtask..."
          value={newSubtaskText}
          onChangeText={setNewSubtaskText}
          onSubmitEditing={() => addSubtask(task.id)}
          autoFocus
        />
        <TouchableOpacity
          style={styles.addSubtaskButton}
          onPress={() => addSubtask(task.id)}
        >
          <Ionicons name="checkmark" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelSubtaskButton}
          onPress={() => {
            setAddingSubtaskTo(null);
            setNewSubtaskText('');
          }}
        >
          <Ionicons name="close" size={20} color="white" />
        </TouchableOpacity>
      </View>
    )}

    {/* Subtasks */}
    {task.expanded && task.subtasks.map(subtask => (
      <View key={subtask.id} style={styles.subtaskRow}>
        <View style={styles.subtaskIndent} />
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => toggleSubtask(task.id, subtask.id)}
        >
          <Ionicons
            name={subtask.completed ? "checkbox" : "square-outline"}
            size={20}
            color={subtask.completed ? "#ccc" : "#007AFF"}
          />
        </TouchableOpacity>
    
        <Text style={[
          styles.subtaskText,
          subtask.completed && styles.completedSubtaskText
        ]}>
          {subtask.text}
        </Text>
    
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => deleteSubtask(task.id, subtask.id)}
        >
          <Ionicons name="trash" size={16} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    ))}
  </View>
);
```

---

## 🎨 Styling Guide

### Complete StyleSheet

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  addTaskContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  taskInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tasksContainer: {
    flex: 1,
  },
  taskContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 12,
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    color: '#1c1c1e',
    fontWeight: '500',
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#ccc',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 8,
    padding: 4,
  },
  addSubtaskContainer: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
  },
  subtaskInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
  },
  addSubtaskButton: {
    backgroundColor: '#34C759',
    borderRadius: 6,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  cancelSubtaskButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 6,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  subtaskIndent: {
    width: 20,
  },
  subtaskText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  completedSubtaskText: {
    textDecorationLine: 'line-through',
    color: '#ccc',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 40,
    fontStyle: 'italic',
  },
});
```

### Key Styling Concepts

#### Completed Items Styling

- **Strike-through**: `textDecorationLine: 'line-through'`
- **Gray color**: `color: '#ccc'`
- **Checkbox color**: Same gray for consistency

#### Layout Patterns

- **Card design**: White background with shadows
- **Indentation**: 20px left margin for subtasks
- **Flexible layout**: Using `flex: 1` for expandable text
- **Consistent spacing**: 8-12px margins/padding

---

## ✅ Testing Checklist

### Basic Functionality

- [ ] Add a new task
- [ ] Check/uncheck task checkbox
- [ ] Task text becomes strikethrough and gray when completed
- [ ] Add subtask to a task
- [ ] Check/uncheck subtask checkbox
- [ ] Subtask text becomes strikethrough and gray when completed

### Collapsible Feature

- [ ] Expand button appears when task has subtasks
- [ ] Click expand button shows subtasks
- [ ] Click collapse button hides subtasks
- [ ] Chevron icon changes direction (up/down)

### Delete Functionality

- [ ] Delete task shows confirmation alert
- [ ] Confirm delete removes task completely
- [ ] Cancel delete keeps task
- [ ] Delete subtask removes immediately

### UI/UX

- [ ] Input fields clear after adding items
- [ ] Buttons are touch-friendly (44px minimum)
- [ ] Scrolling works smoothly
- [ ] Empty state shows helpful message
- [ ] Icons are clear and meaningful

### Edge Cases

- [ ] Empty task text shows error alert
- [ ] Empty subtask text shows error alert
- [ ] Multiple rapid taps don't break functionality
- [ ] Long text wraps properly
- [ ] Many tasks/subtasks perform well

---

## 🚀 Advanced Features

### Persistence

```typescript
// Save to AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

const saveTasks = async (tasks: Task[]) => {
  try {
    await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks:', error);
  }
};

const loadTasks = async () => {
  try {
    const tasksJson = await AsyncStorage.getItem('tasks');
    if (tasksJson) {
      setTasks(JSON.parse(tasksJson));
    }
  } catch (error) {
    console.error('Failed to load tasks:', error);
  }
};
```

### Animations

```typescript
import { Animated } from 'react-native';

// Fade in animation for new tasks
const fadeAnim = useRef(new Animated.Value(0)).current;

const animateNewTask = () => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 300,
    useNativeDriver: true,
  }).start();
};
```

### Search & Filter

```typescript
const [searchText, setSearchText] = useState('');
const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

const filteredTasks = tasks.filter(task => {
  const matchesSearch = task.text.toLowerCase().includes(searchText.toLowerCase());
  const matchesFilter = 
    filter === 'all' ? true :
    filter === 'completed' ? task.completed :
    !task.completed;
  
  return matchesSearch && matchesFilter;
});
```

---

## 🐛 Troubleshooting

### Common Issues

#### Icons Not Showing

```bash
# Install vector icons if missing
expo install @expo/vector-icons
```

#### TypeScript Errors

```typescript
// Ensure proper typing
const [tasks, setTasks] = useState<Task[]>([]);
// Not: const [tasks, setTasks] = useState([]);
```

#### State Not Updating

```typescript
// Always create new objects/arrays
setTasks([...tasks, newTask]); // ✅ Correct
setTasks(tasks.push(newTask)); // ❌ Wrong
```

#### Performance Issues

```typescript
// Use React.memo for task items
const TaskItem = React.memo(({ task, onToggle, onDelete }) => {
  // Component implementation
});
```

### Debug Tips

- Use console.log to track state changes
- Check React Native debugger
- Test on physical device for performance
- Use TypeScript strict mode

---

## 📚 Resources

### Documentation

- [React Native Documentation](https://reactnative.dev/)
- [Expo Vector Icons](https://icons.expo.fyi/)
- [TypeScript Handbook](https://www.typescriptlang.org/)

### Design Inspiration

- Apple Reminders app
- Google Tasks
- Todoist
- Any.do

---

## 🎉 Completion Checklist

- [ ] All core functions implemented
- [ ] UI matches design requirements
- [ ] TypeScript types are correct
- [ ] Styling is complete and responsive
- [ ] Testing checklist passed
- [ ] Code is clean and commented
- [ ] Performance is acceptable
- [ ] Ready for deployment

---

**Happy Coding! 🚀**

*This guide should help you build a professional-quality tasks page from scratch. Take it step by step and test each feature as you implement it.*
