import { MaterialIcons } from '@expo/vector-icons';
import * as React from 'react';
import { BottomNavigation } from 'react-native-paper';

export interface TabRoute {
  key: string;
  title: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  component: React.ComponentType<any>;
}

interface BottomTabNavigationProps {
  routes: TabRoute[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
}

const BottomTabNavigation: React.FC<BottomTabNavigationProps> = ({
  routes,
  initialIndex = 0,
  onIndexChange
}) => {
  const [index, setIndex] = React.useState(initialIndex);

  const handleIndexChange = (newIndex: number) => {
    setIndex(newIndex);
    onIndexChange?.(newIndex);
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
      // Wrap the component to handle the navigation props
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
