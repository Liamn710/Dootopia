import * as React from 'react';
import BottomTabNavigation, { TabRoute } from '../components/BottomTabNavigation';
import CalendarPage from './CalendarPage';
import PrizesPage from './PrizesPage';
import ProfilePage from './ProfilePage';
import TasksPage from './TasksPage';

const MyComponent = () => {
  const routes: TabRoute[] = [
    { 
      key: 'tasks', 
      title: 'Tasks', 
      iconName: 'check',
      component: TasksPage
    },
    { 
      key: 'calendar', 
      title: 'calendar', 
      iconName: 'calendar-month',
      component: CalendarPage
    },
    { 
      key: 'prizes', 
      title: 'rewards', 
      iconName: 'emoji-events',
      component: PrizesPage
    },
    { 
      key: 'profile', 
      title: 'profile', 
      iconName: 'person',
      component: ProfilePage
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