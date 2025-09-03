import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DiscoverStackParamList } from './types';
import DiscoverHomeScreen from '../screens/Matching/DiscoverHomeScreen';
import { UserProfileScreen } from '../screens/PlaceholderScreens';

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

const DiscoverNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="DiscoverHome" component={DiscoverHomeScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
    </Stack.Navigator>
  );
};

export default DiscoverNavigator;
