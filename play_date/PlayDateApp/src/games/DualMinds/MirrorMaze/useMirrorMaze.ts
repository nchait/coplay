import { useState, useEffect, useCallback } from 'react';
import { GameSession, MirrorMazeData } from '../../../types';
import { DualMindsGameState, PlayerRole } from '../types';

interface UseMirrorMazeProps {
  gameSession: GameSession;
  currentUserId: string;
  onGameUpdate: (gameData: MirrorMazeData) => void;
  onGameComplete: (success: boolean, score: number) => void;
}

interface UseMirrorMazeReturn {
  gameData: MirrorMazeData | null;
  gameState: DualMindsGameState;
  handlePlayerMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  handleHintRequest: () => void;
  sendCommunication: (message: string) => void;
  formatTime: (seconds: number) => string;
}

export const useMirrorMaze = ({
  gameSession,
  currentUserId,
  onGameUpdate,
  onGameComplete,
}: UseMirrorMazeProps): UseMirrorMazeReturn => {
  const [gameData, setGameData] = useState<MirrorMazeData | null>(
    gameSession.gameData as MirrorMazeData || null
  );
  
  const [gameState, setGameState] = useState<DualMindsGameState>({
    isGameActive: gameSession.status === 'active',
    timeRemaining: gameData?.timeRemaining || 240,
    isPlayerA: gameSession.players[0] === currentUserId,
    playerRole: gameSession.players[0] === currentUserId ? 'map_viewer' : 'maze_navigator',
    gameData: gameData,
  });

  // Timer effect
  useEffect(() => {
    if (!gameState.isGameActive || gameState.timeRemaining <= 0) {
      if (gameState.timeRemaining <= 0) {
        // Time's up - check if game was completed
        const isCompleted = gameData?.playerPosition.x === gameData?.exitPosition.x && 
                           gameData?.playerPosition.y === gameData?.exitPosition.y;
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
        gameData.playerPosition.x === gameData.exitPosition.x && 
        gameData.playerPosition.y === gameData.exitPosition.y) {
      setGameState(prev => ({ ...prev, isGameActive: false }));
      onGameComplete(true, calculateScore(gameData));
    }
  }, [gameData?.playerPosition, gameData?.exitPosition, onGameComplete]);

  const handlePlayerMove = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!gameData) return;

    const newPosition = { ...gameData.playerPosition };
    
    switch (direction) {
      case 'up':
        newPosition.y = Math.max(0, newPosition.y - 1);
        break;
      case 'down':
        newPosition.y = Math.min(9, newPosition.y + 1);
        break;
      case 'left':
        newPosition.x = Math.max(0, newPosition.x - 1);
        break;
      case 'right':
        newPosition.x = Math.min(9, newPosition.x + 1);
        break;
    }

    // Check if the new position is valid (not a wall)
    const isValidMove = isValidPosition(newPosition, gameData.mazeLayout);
    
    if (isValidMove) {
      const updatedGameData = {
        ...gameData,
        playerPosition: newPosition,
      };

      setGameData(updatedGameData);
      onGameUpdate(updatedGameData);
    } else {
      // Player hit a wall - could show feedback
      console.log('Invalid move - hit a wall!');
    }
  }, [gameData, onGameUpdate]);

  const handleHintRequest = useCallback(() => {
    if (!gameData || gameData.hintsRemaining <= 0) return;

    const updatedGameData = {
      ...gameData,
      hintsRemaining: gameData.hintsRemaining - 1,
    };

    setGameData(updatedGameData);
    onGameUpdate(updatedGameData);
    
    // TODO: Implement hint system
    console.log('Hint requested');
  }, [gameData, onGameUpdate]);

  const sendCommunication = useCallback((message: string) => {
    // TODO: Implement communication system
    console.log('Communication sent:', message);
  }, []);

  const isValidPosition = (position: { x: number; y: number }, mazeLayout: any[][]): boolean => {
    if (position.x < 0 || position.x >= 10 || position.y < 0 || position.y >= 10) {
      return false;
    }

    const cell = mazeLayout[position.y]?.[position.x];
    return cell && !cell.hasWall;
  };

  const calculateScore = (data: MirrorMazeData | null): number => {
    if (!data) return 0;
    
    const timeBonus = Math.max(0, data.timeRemaining * 3);
    const hintBonus = data.hintsRemaining * 50;
    const efficiencyBonus = data.timeRemaining > 120 ? 100 : 0;
    
    return timeBonus + hintBonus + efficiencyBonus;
  };

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    gameData,
    gameState,
    handlePlayerMove,
    handleHintRequest,
    sendCommunication,
    formatTime,
  };
};
