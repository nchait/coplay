import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { extendedTheme } from '../../utils/theme';
import { GameSession, PuzzleConnectData } from '../../types';
import PuzzleGrid from './PuzzleGrid';
import ClueSystem from './ClueSystem';

interface PuzzleConnectGameProps {
  gameSession: GameSession;
  currentUserId: string;
  onGameUpdate: (gameData: PuzzleConnectData) => void;
  onGameComplete: (success: boolean, score: number) => void;
}

const GRID_SIZE = 4; // 4x4 grid for MVP
const GAME_DURATION = 180; // 3 minutes in seconds

const PuzzleConnectGame: React.FC<PuzzleConnectGameProps> = ({
  gameSession,
  currentUserId,
  onGameUpdate,
  onGameComplete,
}) => {
  const [gameData, setGameData] = useState<PuzzleConnectData>(
    gameSession.gameData || generateInitialGameData()
  );
  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION);
  const [isGameActive, setIsGameActive] = useState(true);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  // Determine if current user is Player A or B
  const isPlayerA = gameSession.players[0] === currentUserId;
  const playerView = isPlayerA ? gameData.playerAView : gameData.playerBView;

  // Timer effect
  useEffect(() => {
    if (!isGameActive || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsGameActive(false);
          onGameComplete(false, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive, timeRemaining, onGameComplete]);

  // Check for puzzle completion
  useEffect(() => {
    if (isPuzzleComplete(gameData)) {
      setIsGameActive(false);
      const score = calculateScore(timeRemaining);
      onGameComplete(true, score);
    }
  }, [gameData, timeRemaining, onGameComplete]);

  const handleCellPress = useCallback((row: number, col: number) => {
    if (!isGameActive) return;

    setSelectedCell({ row, col });
  }, [isGameActive]);

  const handleNumberSelect = useCallback((number: number) => {
    if (!selectedCell || !isGameActive) return;

    const { row, col } = selectedCell;
    const newGameData = { ...gameData };
    
    if (isPlayerA) {
      newGameData.playerAView = [...gameData.playerAView];
      newGameData.playerAView[row] = [...newGameData.playerAView[row]];
      newGameData.playerAView[row][col] = number;
    } else {
      newGameData.playerBView = [...gameData.playerBView];
      newGameData.playerBView[row] = [...newGameData.playerBView[row]];
      newGameData.playerBView[row][col] = number;
    }

    setGameData(newGameData);
    onGameUpdate(newGameData);
    setSelectedCell(null);
  }, [selectedCell, isGameActive, gameData, isPlayerA, onGameUpdate]);

  const handleClueShare = useCallback((clue: string) => {
    if (!isGameActive) return;

    const newGameData = {
      ...gameData,
      cluesShared: [...gameData.cluesShared, clue],
    };

    setGameData(newGameData);
    onGameUpdate(newGameData);
  }, [gameData, isGameActive, onGameUpdate]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Puzzle Connect</Text>
        <View style={styles.timerContainer}>
          <Text style={[styles.timer, timeRemaining < 30 && styles.timerWarning]}>
            {formatTime(timeRemaining)}
          </Text>
        </View>
      </View>

      {/* Game Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructions}>
          You are Player {isPlayerA ? 'A' : 'B'}. Work together to solve the puzzle!
        </Text>
      </View>

      {/* Puzzle Grid */}
      <View style={styles.gameArea}>
        <PuzzleGrid
          grid={playerView}
          solution={gameData.solution}
          selectedCell={selectedCell}
          onCellPress={handleCellPress}
          isPlayerA={isPlayerA}
        />

        {/* Number Selection */}
        {selectedCell && (
          <View style={styles.numberSelector}>
            <Text style={styles.numberSelectorTitle}>Select Number:</Text>
            <View style={styles.numberGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                <TouchableOpacity
                  key={number}
                  style={styles.numberButton}
                  onPress={() => handleNumberSelect(number)}
                >
                  <Text style={styles.numberButtonText}>{number}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Clue System */}
      <ClueSystem
        clues={gameData.cluesShared}
        onClueShare={handleClueShare}
        isGameActive={isGameActive}
        playerRole={isPlayerA ? 'A' : 'B'}
      />
    </SafeAreaView>
  );
};

// Helper functions
function generateInitialGameData(): PuzzleConnectData {
  // Generate a solution grid
  const solution = generateSolutionGrid(GRID_SIZE);
  
  // Create asymmetric views for each player
  const playerAView = createPlayerView(solution, 'A');
  const playerBView = createPlayerView(solution, 'B');

  return {
    gridSize: GRID_SIZE,
    playerAView,
    playerBView,
    solution,
    cluesShared: [],
  };
}

function generateSolutionGrid(size: number): number[][] {
  // For MVP, create a simple pattern-based solution
  const grid: number[][] = [];
  
  for (let i = 0; i < size; i++) {
    grid[i] = [];
    for (let j = 0; j < size; j++) {
      // Simple pattern: alternating numbers based on position
      grid[i][j] = ((i + j) % 4) + 1;
    }
  }
  
  return grid;
}

function createPlayerView(solution: number[][], player: 'A' | 'B'): number[][] {
  const size = solution.length;
  const view: number[][] = [];
  
  for (let i = 0; i < size; i++) {
    view[i] = [];
    for (let j = 0; j < size; j++) {
      // Player A sees some cells, Player B sees different cells
      const shouldShow = player === 'A' 
        ? (i + j) % 3 === 0  // Player A sees every 3rd cell in a pattern
        : (i + j) % 3 === 1; // Player B sees different cells
      
      view[i][j] = shouldShow ? solution[i][j] : 0; // 0 means empty
    }
  }
  
  return view;
}

function isPuzzleComplete(gameData: PuzzleConnectData): boolean {
  const { playerAView, playerBView, solution } = gameData;
  
  for (let i = 0; i < solution.length; i++) {
    for (let j = 0; j < solution[i].length; j++) {
      const playerAValue = playerAView[i][j];
      const playerBValue = playerBView[i][j];
      const correctValue = solution[i][j];
      
      // Check if either player has the correct value in this cell
      if (playerAValue !== correctValue && playerBValue !== correctValue) {
        return false;
      }
    }
  }
  
  return true;
}

function calculateScore(timeRemaining: number): number {
  // Score based on time remaining (max 1000 points)
  return Math.round((timeRemaining / GAME_DURATION) * 1000);
}

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
  instructionsContainer: {
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.md,
  },
  instructions: {
    ...extendedTheme.typography.body,
    textAlign: 'center',
    color: extendedTheme.colors.textSecondary,
  },
  gameArea: {
    flex: 1,
    paddingHorizontal: extendedTheme.spacing.lg,
  },
  numberSelector: {
    backgroundColor: extendedTheme.colors.surface,
    borderRadius: extendedTheme.borderRadius.lg,
    padding: extendedTheme.spacing.md,
    marginTop: extendedTheme.spacing.md,
    ...extendedTheme.shadows.sm,
  },
  numberSelectorTitle: {
    ...extendedTheme.typography.h4,
    textAlign: 'center',
    marginBottom: extendedTheme.spacing.sm,
  },
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  numberButton: {
    width: 40,
    height: 40,
    backgroundColor: extendedTheme.colors.primary,
    borderRadius: extendedTheme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    margin: extendedTheme.spacing.xs,
  },
  numberButtonText: {
    ...extendedTheme.typography.h4,
    color: extendedTheme.colors.background,
    fontWeight: '600',
  },
});

export default PuzzleConnectGame;
