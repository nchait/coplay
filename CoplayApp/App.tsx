import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import WelcomeScreen from './src/screens/Auth/WelcomeScreen';

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleGetStarted = () => {
    setShowWelcome(false);
    // TODO: Navigate to authentication flow
  };

  if (showWelcome) {
    return (
      <>
        <WelcomeScreen onGetStarted={handleGetStarted} />
        <StatusBar style="dark" />
      </>
    );
  }

  return (
    <AuthProvider>
      {/* TODO: Add navigation and main app content */}
      <WelcomeScreen onGetStarted={() => {}} />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
