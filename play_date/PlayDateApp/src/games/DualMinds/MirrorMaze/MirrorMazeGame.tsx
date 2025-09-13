import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { extendedTheme } from '../../../utils/theme';
import { GameSession, MirrorMazeData } from '../../../types';
import { DualMindsGameProps, DualMindsGameState } from '../types';
import MazeMap from './MazeMap';
import MazeNavigator from './MazeNavigator';
import GameHUD from '../components/GameHUD';
import CommunicationPanel from '../components/CommunicationPanel';
import { useMirrorMaze } from './useMirrorMaze';

const MirrorMazeGame: React.FC<DualMindsGameProps> = ({
  gameSession,
  currentUserId,
  onGameUpdate,
  onGameComplete,
}) => {
  const {
    gameData,
    gameState,
    handlePlayerMove,
    handleHintRequest,
    sendCommunication,
    formatTime,
  } = useMirrorMaze({
    gameSession,
    currentUserId,
    onGameUpdate,
    onGameComplete,
  });

  const [showCommunication, setShowCommunication] = useState(false);

  // Initialize game data if not present
  useEffect(() => {
    if (!gameData) {
      const initialGameData: MirrorMazeData = {
        mazeLayout: generateMazeLayout(),
        playerPosition: { x: 1, y: 1 },
        wallPositions: generateWallPositions(),
        exitPosition: { x: 8, y: 8 },
        hintsRemaining: 3,
        timeRemaining: 240, // 4 minutes
        playerARole: 'map_viewer',
        playerBRole: 'maze_navigator',
      };
      onGameUpdate(initialGameData);
    }
  }, [gameData, onGameUpdate]);

  const isPlayerA = gameState.isPlayerA;
  const playerRole = isPlayerA ? 'map_viewer' : 'maze_navigator';

  const handleGameComplete = (success: boolean) => {
    const score = calculateScore(gameData);
    onGameComplete(success, score);
  };

  const calculateScore = (data: MirrorMazeData): number => {
    if (!data) return 0;
    
    const timeBonus = Math.max(0, data.timeRemaining * 3);
    const hintBonus = data.hintsRemaining * 50;
    const efficiencyBonus = data.timeRemaining > 120 ? 100 : 0;
    
    return timeBonus + hintBonus + efficiencyBonus;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Game Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mirror Maze</Text>
        <View style={styles.timerContainer}>
          <Text style={[styles.timer, gameState.timeRemaining < 30 && styles.timerWarning]}>
            {formatTime(gameState.timeRemaining)}
          </Text>
        </View>
      </View>

      {/* Player Role Display */}
      <View style={styles.roleContainer}>
        <Text style={styles.roleText}>
          You are the {playerRole === 'map_viewer' ? 'Map Viewer' : 'Maze Navigator'}
        </Text>
        <Text style={styles.instructionText}>
          {playerRole === 'map_viewer' 
            ? 'Guide your partner through the shifting maze'
            : 'Follow your partner\'s directions to reach the exit'
          }
        </Text>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        {isPlayerA ? (
          <MazeMap
            mazeLayout={gameData?.mazeLayout || []}
            playerPosition={gameData?.playerPosition || { x: 1, y: 1 }}
            exitPosition={gameData?.exitPosition || { x: 8, y: 8 }}
            wallPositions={gameData?.wallPositions || []}
            onHintRequest={handleHintRequest}
          />
        ) : (
          <MazeNavigator
            playerPosition={gameData?.playerPosition || { x: 1, y: 1 }}
            onMove={handlePlayerMove}
            onHintRequest={handleHintRequest}
          />
        )}
      </View>

      {/* Game HUD */}
      <GameHUD
        timeRemaining={gameState.timeRemaining}
        progress={gameData?.playerPosition ? 
          Math.round((gameData.playerPosition.x + gameData.playerPosition.y) / 2) : 0
        }
        maxProgress={16}
        hintsUsed={3 - (gameData?.hintsRemaining || 3)}
        onHintPress={handleHintRequest}
        onCommunicationPress={() => setShowCommunication(true)}
      />

      {/* Communication Panel Modal */}
      <Modal
        visible={showCommunication}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCommunication(false)}
      >
        <CommunicationPanel
          playerRole={playerRole}
          onSendMessage={sendCommunication}
          onClose={() => setShowCommunication(false)}
        />
      </Modal>
    </SafeAreaView>
  );
};

// Helper functions to generate game data
const generateMazeLayout = () => {
  const size = 10;
  const maze: any[][] = [];
  
  for (let y = 0; y < size; y++) {
    maze[y] = [];
    for (let x = 0; x < size; x++) {
      maze[y][x] = {
        x,
        y,
        hasWall: false,
        isExit: x === 8 && y === 8,
        isStart: x === 1 && y === 1,
        isVisibleToPlayerA: true,
        isVisibleToPlayerB: false,
      };
    }
  }
  
  // Add some walls to create a maze
  const walls = [
    { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 },
    { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 5, y: 4 },
    { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 },
    { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 },
    { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 },
  ];
  
  walls.forEach(wall => {
    if (maze[wall.y] && maze[wall.y][wall.x]) {
      maze[wall.y][wall.x].hasWall = true;
    }
  });
  
  return maze;
};

const generateWallPositions = () => {
  return [
    {
      id: 'wall1',
      x: 3,
      y: 1,
      width: 1,
      height: 3,
      isMoving: true,
      moveDirection: 'vertical' as const,
      moveSpeed: 0.5,
    },
    {
      id: 'wall2',
      x: 5,
      y: 2,
      width: 1,
      height: 3,
      isMoving: true,
      moveDirection: 'horizontal' as const,
      moveSpeed: 0.3,
    },
  ];
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: extendedTheme.colors.gameBackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.md,
    backgroundColor: extendedTheme.colors.surface,
    ...extendedTheme.shadows.sm,
  },
  title: {
    ...extendedTheme.typography.h2,
    color: extendedTheme.colors.gameAccent,
    fontWeight: '700',
  },
  timerContainer: {
    backgroundColor: extendedTheme.colors.primary,
    paddingHorizontal: extendedTheme.spacing.md,
    paddingVertical: extendedTheme.spacing.sm,
    borderRadius: extendedTheme.borderRadius.md,
  },
  timer: {
    ...extendedTheme.typography.h3,
    color: extendedTheme.colors.background,
    fontWeight: '600',
  },
  timerWarning: {
    color: extendedTheme.colors.warning,
  },
  roleContainer: {
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.md,
    backgroundColor: extendedTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: extendedTheme.colors.borderLight,
  },
  roleText: {
    ...extendedTheme.typography.h4,
    color: extendedTheme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  instructionText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
    textAlign: 'center',
    marginTop: extendedTheme.spacing.xs,
  },
  gameArea: {
    flex: 1,
    padding: extendedTheme.spacing.lg,
  },
});

export default MirrorMazeGame;
