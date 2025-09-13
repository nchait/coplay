import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { extendedTheme } from '../../utils/theme';
import { RootStackParamList } from '../../navigation/types';
import { GameSession, GameType, PuzzleConnectData, GuessAndDrawData, SurvivalChallengeData } from '../../types';

// Import the actual game components
import { PuzzleConnectGame } from '../../games/PuzzleConnect';
import { GuessAndDrawGame } from '../../games/GuessAndDraw';
import { SurvivalChallengeGame } from '../../games/SurvivalChallenge';
import { CircuitSwapGame, MirrorMazeGame, ColorCodeLockGame } from '../../games/DualMinds';

type GamePlayScreenRouteProp = RouteProp<RootStackParamList, 'GamePlay'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const GamePlayScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GamePlayScreenRouteProp>();
  const { sessionId } = route.params;

  // For demo purposes, we'll create a mock game session
  // In a real app, this would be fetched from the backend using the sessionId
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock current user ID - in a real app this would come from auth context
  const currentUserId = 'demo-user-1';

  useEffect(() => {
    // Simulate loading a game session
    // In a real app, you'd fetch this from your backend
    const mockGameSession: GameSession = {
      id: sessionId,
      matchId: 'demo-match',
      gameType: 'PuzzleConnect', // This should come from the session data
      players: ['demo-user-1', 'demo-user-2'],
      status: 'active',
      startedAt: new Date(),
      gameData: null, // Will be initialized by the game component
    };

    // Extract game type from sessionId if it contains the info
    // This is a hack for demo purposes
    if (sessionId.includes('GuessAndDraw')) {
      mockGameSession.gameType = 'GuessAndDraw';
    } else if (sessionId.includes('SurvivalChallenge')) {
      mockGameSession.gameType = 'SurvivalChallenge';
    } else if (sessionId.includes('CircuitSwap')) {
      mockGameSession.gameType = 'CircuitSwap';
    } else if (sessionId.includes('MirrorMaze')) {
      mockGameSession.gameType = 'MirrorMaze';
    } else if (sessionId.includes('ColorCodeLock')) {
      mockGameSession.gameType = 'ColorCodeLock';
    }

    setGameSession(mockGameSession);
    setIsLoading(false);
  }, [sessionId]);

  const handleGameUpdate = (gameData: any) => {
    if (!gameSession) return;
    
    // Update the game session with new game data
    setGameSession(prev => prev ? { ...prev, gameData } : null);
    
    // In a real app, you'd send this update to your backend
    console.log('Game updated:', gameData);
  };

  const handleGameComplete = (success: boolean, score: number) => {
    if (!gameSession) return;

    Alert.alert(
      'Game Complete!',
      `${success ? 'Congratulations!' : 'Game Over'}\nScore: ${score}`,
      [
        {
          text: 'Play Again',
          onPress: () => {
            // Reset the game session
            setGameSession(prev => prev ? { ...prev, gameData: null, status: 'active' } : null);
          },
        },
        {
          text: 'Back to Games',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const renderGame = () => {
    if (!gameSession) return null;

    const commonProps = {
      gameSession,
      currentUserId,
      onGameUpdate: handleGameUpdate,
      onGameComplete: handleGameComplete,
    };

    switch (gameSession.gameType) {
      case 'PuzzleConnect':
        return <PuzzleConnectGame {...commonProps} />;
      case 'GuessAndDraw':
        return <GuessAndDrawGame {...commonProps} />;
      case 'SurvivalChallenge':
        return <SurvivalChallengeGame {...commonProps} />;
      case 'CircuitSwap':
        return <CircuitSwapGame {...commonProps} />;
      case 'MirrorMaze':
        return <MirrorMazeGame {...commonProps} />;
      case 'ColorCodeLock':
        return <ColorCodeLockGame {...commonProps} />;
      default:
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Unknown game type: {gameSession.gameType}</Text>
          </View>
        );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading game...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.gameTitle}>
          {gameSession?.gameType.replace(/([A-Z])/g, ' $1').trim()}
        </Text>
      </View>
      
      <View style={styles.gameContainer}>
        {renderGame()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: extendedTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingTop: extendedTheme.spacing.md,
    paddingBottom: extendedTheme.spacing.sm,
  },
  backButton: {
    padding: extendedTheme.spacing.sm,
  },
  backButtonText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.primary,
    fontWeight: '600',
  },
  gameTitle: {
    ...extendedTheme.typography.h2,
    flex: 1,
    textAlign: 'center',
    marginRight: extendedTheme.spacing.xl, // Balance the back button
  },
  gameContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...extendedTheme.typography.h3,
    color: extendedTheme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: extendedTheme.spacing.lg,
  },
  errorText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.error,
    textAlign: 'center',
  },
});

export default GamePlayScreen;
