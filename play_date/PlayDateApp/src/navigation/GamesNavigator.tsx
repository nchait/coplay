import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GamesStackParamList } from './types';
import GamesListScreen from '../screens/Games/GamesListScreen';
import GameLobbyScreen from '../screens/Games/GameLobbyScreen';
import GamePlayScreen from '../screens/Games/GamePlayScreen';
import { GameResultsScreen } from '../screens/PlaceholderScreens';

const Stack = createNativeStackNavigator<GamesStackParamList>();

const GamesNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="GamesList" component={GamesListScreen} />
      <Stack.Screen 
        name="GameLobby" 
        component={GameLobbyScreen}
        options={{
          headerShown: true,
          title: 'Game Lobby',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="GamePlay" 
        component={GamePlayScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="GameResults" component={GameResultsScreen} />
    </Stack.Navigator>
  );
};

export default GamesNavigator;
