import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { extendedTheme } from '../../utils/theme';
import { GameSession, PuzzleConnectData } from '../../types';
import PuzzleGrid from './PuzzleGrid';
import ClueSystem from './ClueSystem';
import PuzzleAnimations from './PuzzleAnimations';
import { PuzzleValidator } from './PuzzleLogic';
import { usePuzzleConnect } from './usePuzzleConnect';

interface PuzzleConnectGameProps {
  gameSession: GameSession;
  currentUserId: string;
  onGameUpdate: (gameData: PuzzleConnectData) => void;
  onGameComplete: (success: boolean, score: number) => void;
}

const PuzzleConnectGame: React.FC<PuzzleConnectGameProps> = ({
  gameSession,
  currentUserId,
  onGameUpdate,
  onGameComplete,
}) => {
  const {
    gameData,
    timeRemaining,
    isGameActive,
    selectedCell,
    hintsUsed,
    completionPercentage,
    isPlayerA,
    playerView,
    lastMoveResult,
    handleCellPress,
    handleNumberSelect,
    handleClueShare,
    handleGetHint,
    formatTime,
  } = usePuzzleConnect({
    gameSession,
    currentUserId,
    onGameUpdate,
    onGameComplete,
  });

  // Animation states
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCorrectPlacement, setShowCorrectPlacement] = useState(false);
  const [showIncorrectPlacement, setShowIncorrectPlacement] = useState(false);
  const [lastCompletionPercentage, setLastCompletionPercentage] = useState(0);

  // Trigger success animation when game completes
  useEffect(() => {
    if (!isGameActive && completionPercentage === 100) {
      setShowSuccess(true);
    }
  }, [isGameActive, completionPercentage]);

  // Trigger feedback animations based on move results
  useEffect(() => {
    if (lastMoveResult === 'correct') {
      setShowCorrectPlacement(true);
      setTimeout(() => setShowCorrectPlacement(false), 600);
    } else if (lastMoveResult === 'incorrect') {
      setShowIncorrectPlacement(true);
      setTimeout(() => setShowIncorrectPlacement(false), 600);
    }
  }, [lastMoveResult]);

  // Trigger feedback animations when completion percentage changes
  useEffect(() => {
    if (completionPercentage > lastCompletionPercentage) {
      setShowCorrectPlacement(true);
      setTimeout(() => setShowCorrectPlacement(false), 600);
    }
    setLastCompletionPercentage(completionPercentage);
  }, [completionPercentage, lastCompletionPercentage]);



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

      {/* Game Instructions and Progress */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructions}>
          You are Player {isPlayerA ? 'A' : 'B'}. Work together to solve the puzzle!
        </Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Progress: {Math.round(completionPercentage)}%
          </Text>
          <TouchableOpacity style={styles.hintButton} onPress={handleGetHint}>
            <Text style={styles.hintButtonText}>💡 Hint ({hintsUsed})</Text>
          </TouchableOpacity>
        </View>
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

      {/* Animations Overlay */}
      <PuzzleAnimations
        showSuccess={showSuccess}
        showCorrectPlacement={showCorrectPlacement}
        showIncorrectPlacement={showIncorrectPlacement}
        completionPercentage={completionPercentage}
        onAnimationComplete={() => setShowSuccess(false)}
      />
    </SafeAreaView>
  );
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
  instructionsContainer: {
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.md,
  },
  instructions: {
    ...extendedTheme.typography.body,
    textAlign: 'center',
    color: extendedTheme.colors.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: extendedTheme.spacing.sm,
  },
  progressText: {
    ...extendedTheme.typography.bodySmall,
    color: extendedTheme.colors.gameAccent,
    fontWeight: '600',
  },
  hintButton: {
    backgroundColor: extendedTheme.colors.secondary,
    paddingHorizontal: extendedTheme.spacing.sm,
    paddingVertical: extendedTheme.spacing.xs,
    borderRadius: extendedTheme.borderRadius.sm,
  },
  hintButtonText: {
    ...extendedTheme.typography.bodySmall,
    color: extendedTheme.colors.background,
    fontWeight: '600',
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
