import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Modal,
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

  // Local selected cell state for modal
  const [localSelectedCell, setLocalSelectedCell] = useState<{ row: number; col: number } | null>(null);

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
          selectedCell={localSelectedCell}
          onCellPress={(row, col) => {
            handleCellPress(row, col);
            setLocalSelectedCell({ row, col });
          }}
          isPlayerA={isPlayerA}
        />


      </View>

      {/* Clue System */}
      <ClueSystem
        clues={gameData.cluesShared}
        onClueShare={handleClueShare}
        isGameActive={isGameActive}
        playerRole={isPlayerA ? 'A' : 'B'}
      />

      {/* Number Selection Modal */}
      <Modal
        visible={localSelectedCell !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLocalSelectedCell(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.numberModal}>
            <Text style={styles.modalTitle}>
              Select Number for Cell ({localSelectedCell ? localSelectedCell.row + 1 : 0}, {localSelectedCell ? localSelectedCell.col + 1 : 0})
            </Text>
            <View style={styles.numberGrid}>
              {Array.from({ length: gameData.gridSize * gameData.gridSize }, (_, i) => i + 1).map((number) => (
                <TouchableOpacity
                  key={number}
                  style={styles.numberButton}
                  onPress={() => {
                    handleNumberSelect(number);
                    setLocalSelectedCell(null);
                  }}
                >
                  <Text style={styles.numberButtonText}>{number}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setLocalSelectedCell(null)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberModal: {
    backgroundColor: extendedTheme.colors.surface,
    borderRadius: extendedTheme.borderRadius.xl,
    padding: extendedTheme.spacing.xl,
    margin: extendedTheme.spacing.lg,
    minWidth: 280,
    ...extendedTheme.shadows.lg,
  },
  modalTitle: {
    ...extendedTheme.typography.h4,
    textAlign: 'center',
    marginBottom: extendedTheme.spacing.lg,
    color: extendedTheme.colors.text,
  },
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: extendedTheme.spacing.lg,
  },
  numberButton: {
    width: 45,
    height: 45,
    backgroundColor: extendedTheme.colors.primary,
    borderRadius: extendedTheme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    ...extendedTheme.shadows.sm,
  },
  numberButtonText: {
    ...extendedTheme.typography.h3,
    color: extendedTheme.colors.background,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: extendedTheme.colors.borderLight,
    borderRadius: extendedTheme.borderRadius.md,
    paddingVertical: extendedTheme.spacing.md,
    paddingHorizontal: extendedTheme.spacing.lg,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
    fontWeight: '600',
  },
});

export default PuzzleConnectGame;
