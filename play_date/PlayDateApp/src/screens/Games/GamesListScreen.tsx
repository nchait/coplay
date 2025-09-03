import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { extendedTheme } from '../../utils/theme';
import { RootStackParamList } from '../../navigation/types';
import { GameType } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const GamesListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const games = [
    { id: '1', name: 'Puzzle Connect', icon: '🧩', description: 'Cooperative puzzle solving', gameType: 'PuzzleConnect' as GameType },
    { id: '2', name: 'Guess & Draw', icon: '🎨', description: 'Drawing and guessing game', gameType: 'GuessAndDraw' as GameType },
    { id: '3', name: 'Survival Challenge', icon: '⚡', description: 'Quick reflex challenges', gameType: 'SurvivalChallenge' as GameType },
  ];

  const handleGamePress = (gameType: GameType) => {
    // Create a mock session ID that includes the game type for demo purposes
    // In a real app, this would come from creating a new game session on the backend
    const mockSessionId = `demo-session-${gameType}-${Date.now()}`;
    navigation.navigate('GamePlay', { sessionId: mockSessionId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Games</Text>
        <Text style={styles.subtitle}>Choose a game to play</Text>
      </View>

      <ScrollView style={styles.content}>
        {games.map((game) => (
          <TouchableOpacity
            key={game.id}
            style={styles.gameCard}
            onPress={() => handleGamePress(game.gameType)}
          >
            <Text style={styles.gameIcon}>{game.icon}</Text>
            <View style={styles.gameInfo}>
              <Text style={styles.gameName}>{game.name}</Text>
              <Text style={styles.gameDescription}>{game.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: extendedTheme.colors.background,
  },
  header: {
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingTop: extendedTheme.spacing.lg,
    paddingBottom: extendedTheme.spacing.md,
  },
  title: {
    ...extendedTheme.typography.h1,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: extendedTheme.spacing.xs,
  },
  subtitle: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: extendedTheme.spacing.lg,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: extendedTheme.colors.surface,
    borderRadius: extendedTheme.borderRadius.lg,
    padding: extendedTheme.spacing.lg,
    marginBottom: extendedTheme.spacing.md,
    ...extendedTheme.shadows.sm,
  },
  gameIcon: {
    fontSize: 32,
    marginRight: extendedTheme.spacing.md,
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    ...extendedTheme.typography.h3,
    fontWeight: '600',
    marginBottom: extendedTheme.spacing.xs,
  },
  gameDescription: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
  },
});

export default GamesListScreen;
