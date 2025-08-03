import { MaterialIcons } from '@expo/vector-icons';
import * as React from 'react';
import { BottomNavigation } from 'react-native-paper';
import CalendarPage from '../screens/CalendarPage';
import PrizesPage from '../screens/PrizesPage';
import ProfilePage from '../screens/ProfilePage';
import TasksPage from '../screens/TasksPage';

interface TabRoute {
  key: string;
  title: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  component: React.ComponentType<any>;
}

const BottomTabNavigation = () => {
  const [index, setIndex] = React.useState(0);

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

  const handleIndexChange = (newIndex: number) => {
    setIndex(newIndex);
    console.log('Tab changed to index:', newIndex);
  };

  const navigationRoutes = routes.map(route => ({
    key: route.key,
    title: route.title,
    focusedIcon: ({ size, color }: { size: number; color: string }) => (
      <MaterialIcons name={route.iconName} size={size} color={color} />
    ),
  }));

  const renderScene = React.useMemo(() => {
    const sceneMap: { [key: string]: React.ComponentType<any> } = {};
    routes.forEach(route => {
      sceneMap[route.key] = (props: any) => <route.component {...props} />;
    });
    return BottomNavigation.SceneMap(sceneMap);
  }, [routes]);

  return (
    <BottomNavigation
      navigationState={{ index, routes: navigationRoutes }}
      onIndexChange={handleIndexChange}
      renderScene={renderScene}
    />
  );
};

export default BottomTabNavigation;