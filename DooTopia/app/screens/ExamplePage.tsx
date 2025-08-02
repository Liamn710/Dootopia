import * as React from 'react';
import { Text } from 'react-native-paper';
import BottomTabNavigation, { TabRoute } from '../components/BottomTabNavigation';

// Example page components
const HomeRoute = () => <Text>Home Page Content</Text>;
const SettingsRoute = () => <Text>Settings Page Content</Text>;
const HelpRoute = () => <Text>Help Page Content</Text>;

const ExamplePage = () => {
  const routes: TabRoute[] = [
    { 
      key: 'home', 
      title: 'Home', 
      iconName: 'home',
      component: HomeRoute
    },
    { 
      key: 'settings', 
      title: 'Settings', 
      iconName: 'settings',
      component: SettingsRoute
    },
    { 
      key: 'help', 
      title: 'Help', 
      iconName: 'help',
      component: HelpRoute
    },
  ];

  return (
    <BottomTabNavigation 
      routes={routes}
      initialIndex={0}
    />
  );
};

export default ExamplePage;
