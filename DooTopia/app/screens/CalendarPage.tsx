import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Text } from 'react-native-paper';
import { getMongoUserByFirebaseId, getTasks, updateTask, updateUser } from '../../backend/api';
import { auth } from '../../FirebaseConfig';
import CustomCheckbox from '../components/CustomCheckbox';

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [tasksForDate, setTasksForDate] = useState<any[]>([]);
  const [mongoUserId, setMongoUserId] = useState<string>('');

  // Get current user's MongoDB ID
  useEffect(() => {
    const fetchMongoUserId = async () => {
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        const mongoUser = await getMongoUserByFirebaseId(firebaseUser.uid);
        if (mongoUser && mongoUser._id) {
          setMongoUserId(mongoUser._id);
        }
      }
    };
    fetchMongoUserId();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getTasks();
        // Only show tasks created by or assigned to the current user
        const filtered = data.filter(
          (task: any) =>
            task.userId === mongoUserId || task.assignedToId === mongoUserId
        );
        setTasks(filtered);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    if (mongoUserId) {
      fetchTasks();
    }
  }, [mongoUserId]);

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    const filteredTasks = tasks.filter(
      task => task.dueDate && task.dueDate.substring(0, 10) === day.dateString
    );
    setTasksForDate(filteredTasks);
    if (filteredTasks.length > 0) {
      console.log('Tasks for', day.dateString, filteredTasks);
    } else {
      console.log('No task for', day.dateString);
    }
  };

  // Toggle task completion from calendar list
  const toggleTaskFromCalendar = async (task: any) => {
    try {
      const updatedCompleted = !task.completed;
      await updateTask(task._id, { completed: updatedCompleted });
      const delta = updatedCompleted ? (Number(task.points) || 0) : -(Number(task.points) || 0);
      if (mongoUserId && delta !== 0) {
        await updateUser(mongoUserId, { $inc: { points: delta } });
      }
      setTasks(prev => prev.map(t => t._id === task._id ? { ...t, completed: updatedCompleted } : t));
      setTasksForDate(prev => prev.map(t => t._id === task._id ? { ...t, completed: updatedCompleted } : t));
    } catch (e) {
      console.error('Failed to toggle task from calendar:', e);
    }
  };

  // Helper: pick a display color from task tags
  const getTaskColor = (task: any): string => {
    const fallback = '#5A8A93';
    if (!task?.tags || !Array.isArray(task.tags) || task.tags.length === 0) return fallback;
    const first = task.tags[0];
    if (first && typeof first === 'object' && first.color) return first.color;
    return fallback;
  };

  // Build markedDates with multi-colored dots for days with tasks
  const markedDates: { [date: string]: any } = {};
  tasks.forEach(task => {
    if (task.dueDate) {
      const dateKey = task.dueDate.substring(0, 10);
      const color = getTaskColor(task);
      if (!markedDates[dateKey]) {
        markedDates[dateKey] = { dots: [] as any[] };
      }
      markedDates[dateKey].dots.push({
        key: (task._id || task.title) + '-dot',
        color,
        selectedDotColor: color,
      });
      if (selectedDate === dateKey) {
        markedDates[dateKey].selected = true;
        // Use a subtle selection color to avoid clashing with dots
        markedDates[dateKey].selectedColor = '#C7E6ED';
      }
    }
  });

  const renderDay = (props: any) => {
    const { date, state } = props || {};
    const dateString = date.dateString;
    const dayTasks = tasks.filter(
      task => task.dueDate && task.dueDate.substring(0, 10) === dateString
    );
    return (
      <TouchableOpacity onPress={() => handleDayPress({ dateString })}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: state === 'disabled' ? '#d9e1e8' : '#2d4150' }}>
            {date.day}
          </Text>
          {dayTasks.length === 1 && (
            <Text style={{ fontSize: 8, color: getTaskColor(dayTasks[0]) }}>
              {dayTasks[0].title.length > 10
                ? dayTasks[0].title.substring(0, 10) + '...'
                : dayTasks[0].title}
            </Text>
          )}
          {dayTasks.length > 1 && (
            <Text style={{ fontSize: 8, color: '#5A8A93' }}>
              {dayTasks.length} tasks
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Calendar Page</Text>
      <Calendar
        onDayPress={handleDayPress}
        markingType="multi-dot"
        markedDates={markedDates}
        dayComponent={renderDay}
      />
      {selectedDate ? (
        tasksForDate.length > 0 ? (
          <View>
            <Text variant="titleMedium">Tasks for {selectedDate}:</Text>
            {tasksForDate.map((task, idx) => (
              <View
                key={task._id || idx}
                style={{
                  marginVertical: 6,
                  padding: 8,
                  backgroundColor: '#EAF6F9',
                  borderRadius: 8,
                  borderLeftWidth: 4,
                  borderLeftColor: getTaskColor(task),
                  flexDirection: 'row',
                  alignItems: 'flex-start'
                }}
              >
                <CustomCheckbox
                  status={task.completed ? 'checked' : 'unchecked'}
                  onPress={() => toggleTaskFromCalendar(task)}
                />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={{ fontWeight: 'bold', color: getTaskColor(task), textDecorationLine: task.completed ? 'line-through' : 'none' }}>
                    {task.title}
                  </Text>
                  {!!task.text && (
                    <Text style={{ textDecorationLine: task.completed ? 'line-through' : 'none' }}>{task.text}</Text>
                  )}
                  {task.points !== undefined && <Text>Points: {task.points}</Text>}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text>No task for this date.</Text>
        )
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
});

export default CalendarPage;
