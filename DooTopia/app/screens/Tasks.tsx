import * as React from 'react';
import { Text } from 'react-native-paper';
import BottomTabNavigation, { TabRoute } from '../components/BottomTabNavigation';

const TasksRoute = () => <Text>Tasks</Text>;
const CalendarRoute = () => <Text>calendar</Text>;
const PrizesRoute = () => <Text>Prizes</Text>;
const ProfileRoute = () => <Text>Profile</Text>;

const MyComponent = () => {
  const routes: TabRoute[] = [
    { 
      key: 'tasks', 
      title: 'Tasks', 
      iconName: 'check',
      component: TasksRoute
    },
    { 
      key: 'calendar', 
      title: 'calendar', 
      iconName: 'calendar-month',
      component: CalendarRoute
    },
    { 
      key: 'prizes', 
      title: 'rewards', 
      iconName: 'emoji-events',
      component: PrizesRoute
    },
    { 
      key: 'profile', 
      title: 'profile', 
      iconName: 'person',
      component: ProfileRoute
    },
  ];

  return (
    <BottomTabNavigation 
      routes={routes}
      initialIndex={0}
      onIndexChange={(index) => {
        // Optional: Handle tab changes
        console.log('Tab changed to index:', index);
      }}
    />
  );
};

export default MyComponent;