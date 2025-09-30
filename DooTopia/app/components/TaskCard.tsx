//TODO:: Implement task card UI
//TODO::Add drag and drop functionality
//TODO:: Add edit and delete functionality
//TODO:: Add backend integration
//TODO:: Add animations and transitions
//TODO:: Add Subtasks functionality
//TODO:: Add due date and reminders functionality

import AntDesign from '@expo/vector-icons/AntDesign';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, IconButton, Text } from 'react-native-paper';
import type { Task } from '../types/Task';
import CustomCheckbox from './CustomCheckbox';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard = ({ task, onToggleComplete, onDelete }: TaskCardProps) => (
  <View style={styles.taskCard}>
    <View style={styles.taskContent}>
      <CustomCheckbox
        status={task.completed ? 'checked' : 'unchecked'}
        onPress={() => onToggleComplete(task.id)}
      />
      <View style={{ flex: 1 }}>
        <Text variant="titleMedium" style={styles.taskTitle}>
          {task.title}
        </Text>
        <Text
          variant="bodyLarge"
          style={[styles.taskText, task.completed && styles.completedTask]}
        >
          {task.text}
        </Text>
      </View>
      <Text style={styles.pointsText}>
        {task.points ?? 0} pts
      </Text>
      <IconButton
        icon={() => <AntDesign name="close" size={20} color="#666" />}
        size={20}
        onPress={() => onDelete(task.id)}
        style={styles.deleteButton}
      />
    </View>
    <Divider />
  </View>
);

const styles = StyleSheet.create({
  taskCard: {
    marginBottom: 8,
    elevation: 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#5A8A93',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  taskText: {
    flex: 1,
    marginLeft: 8,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  pointsText: {
    marginLeft: 8,
    color: '#5A8A93',
    fontWeight: '600',
    alignSelf: 'center',
  },
  deleteButton: {
    margin: 0,
  },
});

export default TaskCard;