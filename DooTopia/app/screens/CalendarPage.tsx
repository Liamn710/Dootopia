import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Text } from 'react-native-paper';
import { getTasks } from '../../backend/api';

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [tasksForDate, setTasksForDate] = useState<any[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, []);

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

  // Build markedDates with custom styles for days with tasks
  const markedDates: { [date: string]: any } = {};
  tasks.forEach(task => {
    if (task.dueDate) {
      const dateKey = task.dueDate.substring(0, 10);
      markedDates[dateKey] = {
        customStyles: {
          container: {},
          text: {},
          // Add a custom text below the day number
          // react-native-calendars doesn't support subtitle directly,
          // but you can use dots or custom styles.
        },
        dots: [
          {
            key: task._id || task.title,
            color: '#5A8A93',
            selectedDotColor: '#5A8A93'
          }
        ],
        // Optionally, highlight selected date
        ...(selectedDate === dateKey && { selected: true, selectedColor: 'blue' })
      };
    }
  });

  // If you want to show the title, use dayComponent prop:
  const renderDay = ({ date, state }) => {
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
            <Text style={{ fontSize: 8, color: '#5A8A93' }}>
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
        markingType="custom"
        markedDates={markedDates}
        dayComponent={renderDay}
      />
      {selectedDate ? (
        tasksForDate.length > 0 ? (
          <View>
            <Text variant="titleMedium">Tasks for {selectedDate}:</Text>
            {tasksForDate.map((task, idx) => (
              <View key={task._id || idx} style={{ marginVertical: 6, padding: 8, backgroundColor: '#EAF6F9', borderRadius: 8 }}>
                <Text style={{ fontWeight: 'bold' }}>{task.title}</Text>
                <Text>{task.text}</Text>
                {task.points !== undefined && <Text>Points: {task.points}</Text>}
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
