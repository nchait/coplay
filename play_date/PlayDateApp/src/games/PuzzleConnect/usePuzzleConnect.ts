import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { GameSession, PuzzleConnectData } from '../../types';
import { PuzzleGenerator, PuzzleValidator, PuzzleScorer } from './PuzzleLogic';

interface UsePuzzleConnectProps {
  gameSession: GameSession;
  currentUserId: string;
  onGameUpdate: (gameData: PuzzleConnectData) => void;
  onGameComplete: (success: boolean, score: number) => void;
}

interface UsePuzzleConnectReturn {
  gameData: PuzzleConnectData;
  timeRemaining: number;
  isGameActive: boolean;
  selectedCell: { row: number; col: number } | null;
  hintsUsed: number;
  completionPercentage: number;
  isPlayerA: boolean;
  playerView: number[][];
  
  // Actions
  handleCellPress: (row: number, col: number) => void;
  handleNumberSelect: (number: number) => void;
  handleClueShare: (clue: string) => void;
  handleGetHint: () => void;
  formatTime: (seconds: number) => string;
}

export const usePuzzleConnect = ({
  gameSession,
  currentUserId,
  onGameUpdate,
  onGameComplete,
}: UsePuzzleConnectProps): UsePuzzleConnectReturn => {
  // Initialize game data
  const [gameData, setGameData] = useState<PuzzleConnectData>(() => {
    return gameSession.gameData || PuzzleGenerator.generatePuzzle({
      gridSize: 4,
      difficulty: 'medium',
      patternType: 'sequence',
    });
  });

  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes
  const [isGameActive, setIsGameActive] = useState(true);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);

  // Determine player role
  const isPlayerA = gameSession.players[0] === currentUserId;
  const playerView = isPlayerA ? gameData.playerAView : gameData.playerBView;

  // Calculate completion percentage
  const completionPercentage = PuzzleValidator.calculateCompletionPercentage(
    gameData.playerAView,
    gameData.playerBView,
    gameData.solution
  );

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
    if (isGameActive && PuzzleValidator.isPuzzleComplete(
      gameData.playerAView, 
      gameData.playerBView, 
      gameData.solution
    )) {
      setIsGameActive(false);
      const score = PuzzleScorer.calculateScore(
        timeRemaining, 
        180, 
        hintsUsed, 
        completionPercentage
      );
      onGameComplete(true, score);
    }
  }, [gameData, timeRemaining, hintsUsed, completionPercentage, isGameActive, onGameComplete]);

  // Handle cell selection
  const handleCellPress = useCallback((row: number, col: number) => {
    if (!isGameActive) return;
    setSelectedCell({ row, col });
  }, [isGameActive]);

  // Handle number placement
  const handleNumberSelect = useCallback((number: number) => {
    if (!selectedCell || !isGameActive) return;

    const { row, col } = selectedCell;
    
    // Validate the move
    const validation = PuzzleValidator.validateMove(
      playerView,
      gameData.solution,
      row,
      col,
      number
    );

    if (!validation.isValid) {
      Alert.alert('Invalid Move', 'Please select a valid number (1-4).');
      return;
    }

    // Create updated game data
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

    // Update state
    setGameData(newGameData);
    setSelectedCell(null);
    onGameUpdate(newGameData);

    // Show feedback for correct/incorrect moves
    if (validation.isCorrect) {
      // Could add a subtle success animation or sound here
    } else {
      // Could add a subtle error indication
    }
  }, [selectedCell, isGameActive, gameData, isPlayerA, playerView, onGameUpdate]);

  // Handle clue sharing
  const handleClueShare = useCallback((clue: string) => {
    if (!isGameActive) return;

    const playerRole = isPlayerA ? 'A' : 'B';
    const clueWithRole = `Player ${playerRole}: ${clue}`;
    
    const newGameData = {
      ...gameData,
      cluesShared: [...gameData.cluesShared, clueWithRole],
    };

    setGameData(newGameData);
    onGameUpdate(newGameData);
  }, [gameData, isGameActive, isPlayerA, onGameUpdate]);

  // Handle hint request
  const handleGetHint = useCallback(() => {
    if (!isGameActive) return;

    const hint = PuzzleValidator.getHint(
      gameData.playerAView,
      gameData.playerBView,
      gameData.solution,
      isPlayerA ? 'A' : 'B'
    );

    if (hint) {
      setHintsUsed(prev => prev + 1);
      Alert.alert('💡 Hint', hint, [
        { text: 'Got it!', style: 'default' }
      ]);
    } else {
      Alert.alert('No Hints Available', 'Keep working with your partner to solve the puzzle!', [
        { text: 'OK', style: 'default' }
      ]);
    }
  }, [gameData, isPlayerA, isGameActive]);

  // Format time display
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Sync external game data updates
  useEffect(() => {
    if (gameSession.gameData && gameSession.gameData !== gameData) {
      setGameData(gameSession.gameData);
    }
  }, [gameSession.gameData, gameData]);

  return {
    gameData,
    timeRemaining,
    isGameActive,
    selectedCell,
    hintsUsed,
    completionPercentage,
    isPlayerA,
    playerView,
    
    // Actions
    handleCellPress,
    handleNumberSelect,
    handleClueShare,
    handleGetHint,
    formatTime,
  };
};

export default usePuzzleConnect;
