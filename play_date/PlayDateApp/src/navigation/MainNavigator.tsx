import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from './types';
import { extendedTheme } from '../utils/theme';

// Stack Navigators
import DiscoverNavigator from './DiscoverNavigator';
import MatchesNavigator from './MatchesNavigator';
import GamesNavigator from './GamesNavigator';
import ProfileNavigator from './ProfileNavigator';

// Individual Screens that are modals/overlays
import { GameLobbyScreen, GamePlayScreen, ChatScreen } from '../screens/PlaceholderScreens';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: extendedTheme.colors.surface,
          borderTopColor: extendedTheme.colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarActiveTintColor: extendedTheme.colors.primary,
        tabBarInactiveTintColor: extendedTheme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Discover"
        component={DiscoverNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="🔍" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="💝" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Games"
        component={GamesNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="🎮" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="👤" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Simple icon component using emoji
const TabIcon: React.FC<{ name: string; color: string; size: number }> = ({
  name,
  size
}) => (
  <Text style={{ fontSize: size }}>{name}</Text>
);

const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="GameLobby" component={GameLobbyScreen} />
        <Stack.Screen name="GamePlay" component={GamePlayScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default MainNavigator;
