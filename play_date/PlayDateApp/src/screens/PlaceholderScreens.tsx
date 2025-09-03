import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { extendedTheme } from '../utils/theme';

// Generic placeholder screen component
const PlaceholderScreen: React.FC<{ title: string; subtitle?: string; onBack?: () => void }> = ({ 
  title, 
  subtitle, 
  onBack 
}) => (
  <SafeAreaView style={styles.container}>
    {onBack && (
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
    )}
    <View style={styles.content}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <Text style={styles.comingSoon}>Coming Soon</Text>
    </View>
  </SafeAreaView>
);

// Individual screen exports
export const UserProfileScreen: React.FC = () => (
  <PlaceholderScreen title="User Profile" subtitle="View user details" />
);

export const ChatScreen: React.FC = () => (
  <PlaceholderScreen title="Chat" subtitle="Message your match" />
);

export const GameInviteScreen: React.FC = () => (
  <PlaceholderScreen title="Game Invite" subtitle="Invite to play a game" />
);

export const GameLobbyScreen: React.FC = () => (
  <PlaceholderScreen title="Game Lobby" subtitle="Waiting for players" />
);

export const GamePlayScreen: React.FC = () => (
  <PlaceholderScreen title="Game Play" subtitle="Playing the game" />
);

export const GameResultsScreen: React.FC = () => (
  <PlaceholderScreen title="Game Results" subtitle="See how you did" />
);

export const EditProfileScreen: React.FC = () => (
  <PlaceholderScreen title="Edit Profile" subtitle="Update your information" />
);

export const SettingsScreen: React.FC = () => (
  <PlaceholderScreen title="Settings" subtitle="App preferences" />
);

export const PrivacyScreen: React.FC = () => (
  <PlaceholderScreen title="Privacy" subtitle="Privacy settings" />
);

export const HelpScreen: React.FC = () => (
  <PlaceholderScreen title="Help" subtitle="Get support" />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: extendedTheme.colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: extendedTheme.spacing.lg,
    marginTop: extendedTheme.spacing.lg,
  },
  backButtonText: {
    fontSize: 24,
    color: extendedTheme.colors.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: extendedTheme.spacing.lg,
  },
  title: {
    ...extendedTheme.typography.h1,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: extendedTheme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
    marginBottom: extendedTheme.spacing.lg,
    textAlign: 'center',
  },
  comingSoon: {
    ...extendedTheme.typography.h3,
    color: extendedTheme.colors.primary,
    fontWeight: '600',
  },
});

export default PlaceholderScreen;
