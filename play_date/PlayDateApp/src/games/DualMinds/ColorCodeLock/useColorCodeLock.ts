import { useState, useEffect, useCallback } from 'react';
import { GameSession, ColorCodeLockData } from '../../../types';
import { DualMindsGameState, PlayerRole } from '../types';

interface UseColorCodeLockProps {
  gameSession: GameSession;
  currentUserId: string;
  onGameUpdate: (gameData: ColorCodeLockData) => void;
  onGameComplete: (success: boolean, score: number) => void;
}

interface UseColorCodeLockReturn {
  gameData: ColorCodeLockData | null;
  gameState: DualMindsGameState;
  handleButtonPress: (color: string) => void;
  handleSequenceSubmit: () => void;
  handleHintRequest: () => void;
  sendCommunication: (message: string) => void;
  formatTime: (seconds: number) => string;
}

export const useColorCodeLock = ({
  gameSession,
  currentUserId,
  onGameUpdate,
  onGameComplete,
}: UseColorCodeLockProps): UseColorCodeLockReturn => {
  const [gameData, setGameData] = useState<ColorCodeLockData | null>(
    gameSession.gameData as ColorCodeLockData || null
  );
  
  const [gameState, setGameState] = useState<DualMindsGameState>({
    isGameActive: gameSession.status === 'active',
    timeRemaining: gameData?.timeRemaining || 180,
    isPlayerA: gameSession.players[0] === currentUserId,
    playerRole: gameSession.players[0] === currentUserId ? 'sequence_viewer' : 'button_presser',
    gameData: gameData,
  });

  // Timer effect
  useEffect(() => {
    if (!gameState.isGameActive || gameState.timeRemaining <= 0) {
      if (gameState.timeRemaining <= 0) {
        // Time's up - check if game was completed
        const isCompleted = gameData?.currentInput.length === gameData?.correctSequence.length &&
                           gameData?.currentInput.every((color, index) => 
                             color === gameData?.correctSequence[index]
                           );
        onGameComplete(isCompleted, calculateScore(gameData));
      }
      return;
    }

    const timer = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        timeRemaining: Math.max(0, prev.timeRemaining - 1),
      }));

      // Update game data with new time
      if (gameData) {
        const updatedGameData = { ...gameData, timeRemaining: gameState.timeRemaining - 1 };
        setGameData(updatedGameData);
        onGameUpdate(updatedGameData);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isGameActive, gameState.timeRemaining, gameData, onGameUpdate, onGameComplete]);

  // Check for game completion
  useEffect(() => {
    if (gameData && 
        gameData.currentInput.length === gameData.correctSequence.length &&
        gameData.currentInput.every((color, index) => color === gameData.correctSequence[index])) {
      setGameState(prev => ({ ...prev, isGameActive: false }));
      onGameComplete(true, calculateScore(gameData));
    }
  }, [gameData?.currentInput, gameData?.correctSequence, onGameComplete]);

  const handleButtonPress = useCallback((color: string) => {
    if (!gameData) return;

    if (color === 'clear') {
      // Clear current input
      const updatedGameData = {
        ...gameData,
        currentInput: [],
      };
      setGameData(updatedGameData);
      onGameUpdate(updatedGameData);
      return;
    }

    // Add color to current input
    const updatedGameData = {
      ...gameData,
      currentInput: [...gameData.currentInput, color],
    };

    setGameData(updatedGameData);
    onGameUpdate(updatedGameData);
  }, [gameData, onGameUpdate]);

  const handleSequenceSubmit = useCallback(() => {
    if (!gameData) return;

    const isCorrect = gameData.currentInput.length === gameData.correctSequence.length &&
                     gameData.currentInput.every((color, index) => 
                       color === gameData.correctSequence[index]
                     );

    if (isCorrect) {
      // Sequence is correct - game completed
      setGameState(prev => ({ ...prev, isGameActive: false }));
      onGameComplete(true, calculateScore(gameData));
    } else {
      // Sequence is incorrect - reduce attempts
      const updatedGameData = {
        ...gameData,
        attemptsRemaining: gameData.attemptsRemaining - 1,
        currentInput: [], // Clear input for next attempt
      };

      setGameData(updatedGameData);
      onGameUpdate(updatedGameData);

      // Check if no attempts remaining
      if (updatedGameData.attemptsRemaining <= 0) {
        setGameState(prev => ({ ...prev, isGameActive: false }));
        onGameComplete(false, calculateScore(updatedGameData));
      }
    }
  }, [gameData, onGameUpdate, onGameComplete]);

  const handleHintRequest = useCallback(() => {
    if (!gameData || gameData.hintLevel >= 3) return;

    const updatedGameData = {
      ...gameData,
      hintLevel: gameData.hintLevel + 1,
    };

    setGameData(updatedGameData);
    onGameUpdate(updatedGameData);
    
    // TODO: Implement hint system
    console.log('Hint requested, level:', updatedGameData.hintLevel);
  }, [gameData, onGameUpdate]);

  const sendCommunication = useCallback((message: string) => {
    // TODO: Implement communication system
    console.log('Communication sent:', message);
  }, []);

  const calculateScore = (data: ColorCodeLockData | null): number => {
    if (!data) return 0;
    
    const timeBonus = Math.max(0, data.timeRemaining * 2);
    const attemptBonus = data.attemptsRemaining * 100;
    const accuracyBonus = data.currentInput.length === data.correctSequence.length ? 200 : 0;
    
    return timeBonus + attemptBonus + accuracyBonus;
  };

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    gameData,
    gameState,
    handleButtonPress,
    handleSequenceSubmit,
    handleHintRequest,
    sendCommunication,
    formatTime,
  };
};
