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
    { id: '4', name: 'Circuit Swap', icon: '🔌', description: 'Wire connection puzzle', gameType: 'CircuitSwap' as GameType },
    { id: '5', name: 'Mirror Maze', icon: '🧭', description: 'Navigate shifting maze', gameType: 'MirrorMaze' as GameType },
    { id: '6', name: 'Color Code Lock', icon: '🎨', description: 'Color sequence memory', gameType: 'ColorCodeLock' as GameType },
  ];

  const handleGamePress = (gameType: GameType, gameName: string) => {
    // Navigate to user selection screen for challenging
    navigation.navigate('UserSelection', { gameType, gameName });
  };

  const handleViewChallenges = () => {
    navigation.navigate('Challenges');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Games</Text>
          <TouchableOpacity style={styles.challengesButton} onPress={handleViewChallenges}>
            <Text style={styles.challengesButtonText}>Challenges</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Choose a game to challenge someone</Text>
      </View>

      <ScrollView style={styles.content}>
        {games.map((game) => (
          <TouchableOpacity
            key={game.id}
            style={styles.gameCard}
            onPress={() => handleGamePress(game.gameType, game.name)}
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: extendedTheme.spacing.xs,
  },
  challengesButton: {
    backgroundColor: extendedTheme.colors.primary,
    paddingHorizontal: extendedTheme.spacing.md,
    paddingVertical: extendedTheme.spacing.sm,
    borderRadius: extendedTheme.borderRadius.md,
  },
  challengesButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
