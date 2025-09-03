import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { extendedTheme } from '../../utils/theme';
import { GameSession, GuessAndDrawData, DrawingStroke } from '../../types';
import DrawingCanvas from './DrawingCanvas';
import GuessingInterface from './GuessingInterface';
import { wordPromptSystem, WordPrompt, DifficultyLevel } from './WordPromptSystem';

interface GuessAndDrawGameProps {
  gameSession: GameSession;
  currentUserId: string;
  onGameUpdate: (gameData: GuessAndDrawData) => void;
  onGameComplete: (success: boolean, score: number) => void;
}

type GamePhase = 'word_selection' | 'drawing' | 'completed';
type PlayerRole = 'drawer' | 'guesser';

const GuessAndDrawGame: React.FC<GuessAndDrawGameProps> = ({
  gameSession,
  currentUserId,
  onGameUpdate,
  onGameComplete,
}) => {
  const [gameData, setGameData] = useState<GuessAndDrawData>(
    gameSession.gameData || generateInitialGameData()
  );
  const [gamePhase, setGamePhase] = useState<GamePhase>('word_selection');
  const [timeRemaining, setTimeRemaining] = useState(90); // 1.5 minutes default
  const [isGameActive, setIsGameActive] = useState(true);
  const [wordChoices, setWordChoices] = useState<WordPrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<WordPrompt | null>(null);
  const [showWordSelection, setShowWordSelection] = useState(false);

  // Determine player roles
  const currentDrawer = gameData.currentDrawer;
  const isCurrentUserDrawer = currentDrawer === currentUserId;
  const playerRole: PlayerRole = isCurrentUserDrawer ? 'drawer' : 'guesser';

  // Initialize game
  useEffect(() => {
    if (gamePhase === 'word_selection' && isCurrentUserDrawer) {
      const choices = wordPromptSystem.generateChoices('medium', 3);
      setWordChoices(choices);
      setShowWordSelection(true);
    }
  }, [gamePhase, isCurrentUserDrawer]);

  // Timer effect
  useEffect(() => {
    if (!isGameActive || timeRemaining <= 0 || gamePhase !== 'drawing') return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsGameActive(false);
          setGamePhase('completed');
          onGameComplete(false, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive, timeRemaining, gamePhase, onGameComplete]);

  // Check for correct guess
  useEffect(() => {
    if (gameData.correctGuess && selectedPrompt) {
      setIsGameActive(false);
      setGamePhase('completed');
      const score = wordPromptSystem.calculatePoints(
        selectedPrompt.difficulty,
        timeRemaining,
        90,
        0 // hints used - could be tracked separately
      );
      onGameComplete(true, score);
    }
  }, [gameData.correctGuess, selectedPrompt, timeRemaining, onGameComplete]);

  const handleWordSelection = useCallback((prompt: WordPrompt) => {
    setSelectedPrompt(prompt);
    const timeLimit = wordPromptSystem.getTimeLimit(prompt.difficulty);
    setTimeRemaining(timeLimit);
    
    const newGameData: GuessAndDrawData = {
      ...gameData,
      prompt: prompt.word,
    };
    
    setGameData(newGameData);
    onGameUpdate(newGameData);
    setShowWordSelection(false);
    setGamePhase('drawing');
  }, [gameData, onGameUpdate]);

  const handleStrokeAdd = useCallback((stroke: DrawingStroke) => {
    const newGameData: GuessAndDrawData = {
      ...gameData,
      drawing: [...gameData.drawing, stroke],
    };
    
    setGameData(newGameData);
    onGameUpdate(newGameData);
  }, [gameData, onGameUpdate]);

  const handleGuessSubmit = useCallback(async (guess: string) => {
    if (!selectedPrompt) return;

    const isCorrect = wordPromptSystem.isCorrectGuess(guess, selectedPrompt.word);
    
    const newGameData: GuessAndDrawData = {
      ...gameData,
      guesses: [...gameData.guesses, guess],
      correctGuess: isCorrect ? guess : gameData.correctGuess,
    };
    
    setGameData(newGameData);
    onGameUpdate(newGameData);

    if (isCorrect) {
      // Success will be handled by the useEffect above
    }
  }, [gameData, selectedPrompt, onGameUpdate]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderWordSelectionModal = () => (
    <Modal
      visible={showWordSelection}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Choose a Word to Draw</Text>
          <Text style={styles.modalSubtitle}>Pick one that you can draw well!</Text>
        </View>
        
        <View style={styles.wordChoicesContainer}>
          {wordChoices.map((choice, index) => (
            <TouchableOpacity
              key={index}
              style={styles.wordChoiceButton}
              onPress={() => handleWordSelection(choice)}
            >
              <Text style={styles.wordChoiceText}>{choice.word}</Text>
              <Text style={styles.wordChoiceDifficulty}>
                {choice.difficulty.toUpperCase()} • {choice.category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.modalFooter}>
          <Text style={styles.modalFooterText}>
            Choose wisely - your partner needs to guess it!
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Guess & Draw</Text>
          <Text style={styles.roleText}>
            You are the {playerRole === 'drawer' ? '🎨 Drawer' : '🤔 Guesser'}
          </Text>
        </View>
        {gamePhase === 'drawing' && (
          <View style={styles.timerContainer}>
            <Text style={[styles.timer, timeRemaining < 30 && styles.timerWarning]}>
              {formatTime(timeRemaining)}
            </Text>
          </View>
        )}
      </View>

      {/* Game Content */}
      <View style={styles.gameContent}>
        {gamePhase === 'word_selection' && !isCurrentUserDrawer && (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>
              Waiting for the drawer to choose a word...
            </Text>
          </View>
        )}

        {gamePhase === 'drawing' && (
          <>
            {/* Drawing Canvas */}
            <View style={styles.canvasSection}>
              <DrawingCanvas
                strokes={gameData.drawing}
                onStrokeAdd={handleStrokeAdd}
                isDrawingEnabled={isCurrentUserDrawer}
              />
            </View>

            {/* Guessing Interface */}
            <View style={styles.guessingSection}>
              <GuessingInterface
                guesses={gameData.guesses}
                onGuessSubmit={handleGuessSubmit}
                isGuessingEnabled={!isCurrentUserDrawer}
                currentPrompt={isCurrentUserDrawer ? selectedPrompt?.word : undefined}
                isCorrectGuess={!!gameData.correctGuess}
                timeRemaining={timeRemaining}
                showPromptToDrawer={isCurrentUserDrawer}
              />
            </View>
          </>
        )}

        {gamePhase === 'completed' && (
          <View style={styles.completedContainer}>
            <Text style={styles.completedTitle}>
              {gameData.correctGuess ? '🎉 Success!' : '⏰ Time\'s Up!'}
            </Text>
            <Text style={styles.completedSubtitle}>
              {gameData.correctGuess 
                ? `The word was "${selectedPrompt?.word}" - Great job!`
                : `The word was "${selectedPrompt?.word}" - Better luck next time!`
              }
            </Text>
          </View>
        )}
      </View>

      {/* Word Selection Modal */}
      {renderWordSelectionModal()}
    </SafeAreaView>
  );
};

// Helper function to generate initial game data
function generateInitialGameData(): GuessAndDrawData {
  return {
    currentDrawer: '', // Will be set by the game session
    prompt: '',
    drawing: [],
    guesses: [],
    correctGuess: undefined,
  };
}

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
  headerLeft: {
    flex: 1,
  },
  title: {
    ...extendedTheme.typography.h2,
    color: extendedTheme.colors.gameAccent,
    fontWeight: '700',
  },
  roleText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
    marginTop: extendedTheme.spacing.xs,
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
  gameContent: {
    flex: 1,
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: extendedTheme.spacing.lg,
  },
  waitingText: {
    ...extendedTheme.typography.h3,
    color: extendedTheme.colors.textSecondary,
    textAlign: 'center',
  },
  canvasSection: {
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.md,
  },
  guessingSection: {
    flex: 1,
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: extendedTheme.spacing.lg,
  },
  completedTitle: {
    ...extendedTheme.typography.h1,
    textAlign: 'center',
    marginBottom: extendedTheme.spacing.md,
  },
  completedSubtitle: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: extendedTheme.colors.background,
  },
  modalHeader: {
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.xl,
    alignItems: 'center',
  },
  modalTitle: {
    ...extendedTheme.typography.h2,
    color: extendedTheme.colors.gameAccent,
    fontWeight: '700',
    marginBottom: extendedTheme.spacing.sm,
  },
  modalSubtitle: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
    textAlign: 'center',
  },
  wordChoicesContainer: {
    flex: 1,
    paddingHorizontal: extendedTheme.spacing.lg,
  },
  wordChoiceButton: {
    backgroundColor: extendedTheme.colors.surface,
    borderRadius: extendedTheme.borderRadius.lg,
    padding: extendedTheme.spacing.lg,
    marginBottom: extendedTheme.spacing.md,
    alignItems: 'center',
    ...extendedTheme.shadows.sm,
  },
  wordChoiceText: {
    ...extendedTheme.typography.h2,
    color: extendedTheme.colors.primary,
    fontWeight: '700',
    marginBottom: extendedTheme.spacing.xs,
  },
  wordChoiceDifficulty: {
    ...extendedTheme.typography.bodySmall,
    color: extendedTheme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalFooter: {
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.lg,
  },
  modalFooterText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default GuessAndDrawGame;
