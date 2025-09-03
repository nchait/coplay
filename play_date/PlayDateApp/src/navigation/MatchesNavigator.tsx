import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MatchesStackParamList } from './types';
import MatchesListScreen from '../screens/Matching/MatchesListScreen';
import { ChatScreen, GameInviteScreen } from '../screens/PlaceholderScreens';

const Stack = createNativeStackNavigator<MatchesStackParamList>();

const MatchesNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MatchesList" component={MatchesListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="GameInvite" component={GameInviteScreen} />
    </Stack.Navigator>
  );
};

export default MatchesNavigator;
