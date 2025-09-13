import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { extendedTheme } from '../../utils/theme';
import { RootStackParamList, GameType } from '../../navigation/types';
import { useMultiplayer } from '../../contexts/MultiplayerContext';
import { useAuth } from '../../contexts/AuthContext';

type GameLobbyScreenRouteProp = RouteProp<RootStackParamList, 'GameLobby'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const GameLobbyScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GameLobbyScreenRouteProp>();
  const { matchId, gameType } = route.params;
  
  const { state: authState } = useAuth();
  const { state: multiplayerState, createSession, joinSession, setReady, leaveSession, sendMessage } = useMultiplayer();
  
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isJoiningSession, setIsJoiningSession] = useState(false);

  useEffect(() => {
    // Auto-join session if matchId is provided
    if (matchId && authState.user) {
      handleJoinSession();
    }
  }, [matchId, authState.user]);

  const handleCreateSession = async () => {
    if (!authState.user) return;
    
    try {
      setIsCreatingSession(true);
      await createSession(gameType, authState.user.id);
    } catch (error) {
      Alert.alert('Error', 'Failed to create game session');
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleJoinSession = async () => {
    if (!authState.user || !matchId) return;
    
    try {
      setIsJoiningSession(true);
      await joinSession(matchId, authState.user.id);
    } catch (error) {
      Alert.alert('Error', 'Failed to join game session');
    } finally {
      setIsJoiningSession(false);
    }
  };

  const handleReadyToggle = () => {
    setReady(!multiplayerState.isReady);
  };

  const handleLeaveSession = () => {
    Alert.alert(
      'Leave Game',
      'Are you sure you want to leave this game session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: () => {
            leaveSession();
            navigation.goBack();
          }
        },
      ]
    );
  };

  const handleStartGame = () => {
    if (multiplayerState.currentSession) {
      navigation.navigate('GamePlay', { sessionId: multiplayerState.currentSession.id });
    }
  };

  const canStartGame = multiplayerState.isHost && 
                      multiplayerState.players.length >= 2 && 
                      multiplayerState.players.every(player => player.isReady);

  const getGameTypeDisplayName = (type: GameType): string => {
    const displayNames: { [key in GameType]: string } = {
      PuzzleConnect: 'Puzzle Connect',
      GuessAndDraw: 'Guess & Draw',
      SurvivalChallenge: 'Survival Challenge',
      CircuitSwap: 'Circuit Swap',
      MirrorMaze: 'Mirror Maze',
      ColorCodeLock: 'Color Code Lock',
      BridgeBuilders: 'Bridge Builders',
      EchoesOfSound: 'Echoes of Sound',
    };
    return displayNames[type] || type;
  };

  const getGameTypeDescription = (type: GameType): string => {
    const descriptions: { [key in GameType]: string } = {
      PuzzleConnect: 'Work together to solve cooperative puzzles',
      GuessAndDraw: 'Draw and guess with your partner',
      SurvivalChallenge: 'Survive challenges together',
      CircuitSwap: 'Connect wires to complete the circuit',
      MirrorMaze: 'Navigate through a shifting maze',
      ColorCodeLock: 'Remember and input color sequences',
      BridgeBuilders: 'Build a bridge together',
      EchoesOfSound: 'Reproduce melodies together',
    };
    return descriptions[type] || 'Cooperative mini-game';
  };

  const getGameTypeIcon = (type: GameType): string => {
    const icons: { [key in GameType]: string } = {
      PuzzleConnect: '🧩',
      GuessAndDraw: '🎨',
      SurvivalChallenge: '⚡',
      CircuitSwap: '🔌',
      MirrorMaze: '🧭',
      ColorCodeLock: '🎨',
      BridgeBuilders: '🌉',
      EchoesOfSound: '🎵',
    };
    return icons[type] || '🎮';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Game Lobby</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Connection Status */}
      <View style={styles.connectionStatus}>
        <View style={[
          styles.statusIndicator,
          { backgroundColor: multiplayerState.connectionState === 'connected' ? extendedTheme.colors.success : extendedTheme.colors.error }
        ]} />
        <Text style={styles.statusText}>
          {multiplayerState.connectionState === 'connected' ? 'Connected' : 'Disconnected'}
        </Text>
      </View>

      {/* Game Info */}
      <View style={styles.gameInfo}>
        <Text style={styles.gameIcon}>{getGameTypeIcon(gameType)}</Text>
        <View style={styles.gameDetails}>
          <Text style={styles.gameName}>{getGameTypeDisplayName(gameType)}</Text>
          <Text style={styles.gameDescription}>{getGameTypeDescription(gameType)}</Text>
        </View>
      </View>

      {/* Session Management */}
      {!multiplayerState.currentSession ? (
        <View style={styles.sessionActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.createButton]}
            onPress={handleCreateSession}
            disabled={isCreatingSession}
          >
            {isCreatingSession ? (
              <ActivityIndicator color={extendedTheme.colors.background} />
            ) : (
              <Text style={styles.actionButtonText}>Create Game</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.joinButton]}
            onPress={handleJoinSession}
            disabled={isJoiningSession}
          >
            {isJoiningSession ? (
              <ActivityIndicator color={extendedTheme.colors.background} />
            ) : (
              <Text style={styles.actionButtonText}>Join Game</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionTitle}>Game Session</Text>
          <Text style={styles.sessionId}>ID: {multiplayerState.currentSession.id}</Text>
          
          {/* Players List */}
          <View style={styles.playersContainer}>
            <Text style={styles.playersTitle}>Players ({multiplayerState.players.length}/2)</Text>
            <ScrollView style={styles.playersList}>
              {multiplayerState.players.map((player) => (
                <View key={player.id} style={styles.playerItem}>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <View style={[
                      styles.playerStatus,
                      { backgroundColor: player.isConnected ? extendedTheme.colors.success : extendedTheme.colors.error }
                    ]} />
                  </View>
                  <View style={styles.playerReady}>
                    <Text style={styles.readyText}>
                      {player.isReady ? 'Ready' : 'Not Ready'}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Ready Button */}
          <TouchableOpacity
            style={[
              styles.readyButton,
              { backgroundColor: multiplayerState.isReady ? extendedTheme.colors.success : extendedTheme.colors.primary }
            ]}
            onPress={handleReadyToggle}
          >
            <Text style={styles.readyButtonText}>
              {multiplayerState.isReady ? 'Ready ✓' : 'Mark as Ready'}
            </Text>
          </TouchableOpacity>

          {/* Start Game Button (Host Only) */}
          {multiplayerState.isHost && (
            <TouchableOpacity
              style={[
                styles.startButton,
                { backgroundColor: canStartGame ? extendedTheme.colors.success : extendedTheme.colors.borderLight }
              ]}
              onPress={handleStartGame}
              disabled={!canStartGame}
            >
              <Text style={[
                styles.startButtonText,
                { color: canStartGame ? extendedTheme.colors.background : extendedTheme.colors.textSecondary }
              ]}>
                Start Game
              </Text>
            </TouchableOpacity>
          )}

          {/* Leave Session Button */}
          <TouchableOpacity
            style={styles.leaveButton}
            onPress={handleLeaveSession}
          >
            <Text style={styles.leaveButtonText}>Leave Session</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Error Display */}
      {multiplayerState.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{multiplayerState.error}</Text>
        </View>
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: extendedTheme.colors.borderLight,
  },
  backButton: {
    padding: extendedTheme.spacing.sm,
  },
  backButtonText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.primary,
    fontWeight: '600',
  },
  title: {
    ...extendedTheme.typography.h2,
    color: extendedTheme.colors.text,
    fontWeight: '600',
  },
  placeholder: {
    width: 60, // Balance the back button
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.sm,
    backgroundColor: extendedTheme.colors.surface,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: extendedTheme.spacing.sm,
  },
  statusText: {
    ...extendedTheme.typography.bodySmall,
    color: extendedTheme.colors.textSecondary,
  },
  gameInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.lg,
    backgroundColor: extendedTheme.colors.surface,
    marginBottom: extendedTheme.spacing.lg,
  },
  gameIcon: {
    fontSize: 48,
    marginRight: extendedTheme.spacing.lg,
  },
  gameDetails: {
    flex: 1,
  },
  gameName: {
    ...extendedTheme.typography.h3,
    color: extendedTheme.colors.text,
    fontWeight: '600',
    marginBottom: extendedTheme.spacing.xs,
  },
  gameDescription: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
  },
  sessionActions: {
    paddingHorizontal: extendedTheme.spacing.lg,
    gap: extendedTheme.spacing.md,
  },
  actionButton: {
    paddingVertical: extendedTheme.spacing.lg,
    paddingHorizontal: extendedTheme.spacing.lg,
    borderRadius: extendedTheme.borderRadius.lg,
    alignItems: 'center',
    ...extendedTheme.shadows.sm,
  },
  createButton: {
    backgroundColor: extendedTheme.colors.primary,
  },
  joinButton: {
    backgroundColor: extendedTheme.colors.secondary,
  },
  actionButtonText: {
    ...extendedTheme.typography.h4,
    color: extendedTheme.colors.background,
    fontWeight: '600',
  },
  sessionInfo: {
    paddingHorizontal: extendedTheme.spacing.lg,
  },
  sessionTitle: {
    ...extendedTheme.typography.h3,
    color: extendedTheme.colors.text,
    fontWeight: '600',
    marginBottom: extendedTheme.spacing.sm,
  },
  sessionId: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
    marginBottom: extendedTheme.spacing.lg,
  },
  playersContainer: {
    marginBottom: extendedTheme.spacing.lg,
  },
  playersTitle: {
    ...extendedTheme.typography.h4,
    color: extendedTheme.colors.text,
    fontWeight: '600',
    marginBottom: extendedTheme.spacing.sm,
  },
  playersList: {
    maxHeight: 200,
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: extendedTheme.spacing.sm,
    paddingHorizontal: extendedTheme.spacing.md,
    backgroundColor: extendedTheme.colors.background,
    borderRadius: extendedTheme.borderRadius.md,
    marginBottom: extendedTheme.spacing.sm,
    ...extendedTheme.shadows.sm,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerName: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.text,
    fontWeight: '600',
    marginRight: extendedTheme.spacing.sm,
  },
  playerStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  playerReady: {
    alignItems: 'center',
  },
  readyText: {
    ...extendedTheme.typography.bodySmall,
    color: extendedTheme.colors.textSecondary,
  },
  readyButton: {
    paddingVertical: extendedTheme.spacing.lg,
    paddingHorizontal: extendedTheme.spacing.lg,
    borderRadius: extendedTheme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: extendedTheme.spacing.md,
    ...extendedTheme.shadows.sm,
  },
  readyButtonText: {
    ...extendedTheme.typography.h4,
    color: extendedTheme.colors.background,
    fontWeight: '600',
  },
  startButton: {
    paddingVertical: extendedTheme.spacing.lg,
    paddingHorizontal: extendedTheme.spacing.lg,
    borderRadius: extendedTheme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: extendedTheme.spacing.md,
    ...extendedTheme.shadows.sm,
  },
  startButtonText: {
    ...extendedTheme.typography.h4,
    fontWeight: '600',
  },
  leaveButton: {
    paddingVertical: extendedTheme.spacing.md,
    paddingHorizontal: extendedTheme.spacing.lg,
    borderRadius: extendedTheme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: extendedTheme.colors.error,
  },
  leaveButtonText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.error,
    fontWeight: '600',
  },
  errorContainer: {
    margin: extendedTheme.spacing.lg,
    padding: extendedTheme.spacing.md,
    backgroundColor: extendedTheme.colors.error + '20',
    borderRadius: extendedTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: extendedTheme.colors.error,
  },
  errorText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.error,
    textAlign: 'center',
  },
});

export default GameLobbyScreen;
