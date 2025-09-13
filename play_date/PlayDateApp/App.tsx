import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { ToastProvider } from './src/contexts/ToastContext';
import { MultiplayerProvider } from './src/contexts/MultiplayerContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <AuthProvider>
          <MultiplayerProvider>
            <RootNavigator />
            <StatusBar style="auto" />
          </MultiplayerProvider>
        </AuthProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
