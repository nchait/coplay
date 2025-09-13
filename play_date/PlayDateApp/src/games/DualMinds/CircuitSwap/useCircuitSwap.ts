import { useState, useEffect, useCallback } from 'react';
import { GameSession, CircuitSwapData } from '../../../types';
import { DualMindsGameState, PlayerRole } from '../types';
import { useMultiplayer } from '../../../contexts/MultiplayerContext';

interface UseCircuitSwapProps {
  gameSession: GameSession;
  currentUserId: string;
  onGameUpdate: (gameData: CircuitSwapData) => void;
  onGameComplete: (success: boolean, score: number) => void;
}

interface UseCircuitSwapReturn {
  gameData: CircuitSwapData | null;
  gameState: DualMindsGameState;
  handleWireConnection: (connectionId: string, isConnected: boolean) => void;
  handleSwitchToggle: (switchId: string) => void;
  handleSectionComplete: (sectionId: string) => void;
  handleHintRequest: () => void;
  sendCommunication: (message: string) => void;
  formatTime: (seconds: number) => string;
}

export const useCircuitSwap = ({
  gameSession,
  currentUserId,
  onGameUpdate,
  onGameComplete,
}: UseCircuitSwapProps): UseCircuitSwapReturn => {
  const { state: multiplayerState, sendGameUpdate, sendMessage } = useMultiplayer();
  
  const [gameData, setGameData] = useState<CircuitSwapData | null>(
    gameSession.gameData as CircuitSwapData || multiplayerState.gameData || null
  );
  
  const [gameState, setGameState] = useState<DualMindsGameState>({
    isGameActive: gameSession.status === 'active',
    timeRemaining: gameData?.timeRemaining || 300,
    isPlayerA: gameSession.players[0] === currentUserId,
    playerRole: gameSession.players[0] === currentUserId ? 'schematic_viewer' : 'wire_manipulator',
    gameData: gameData,
  });

  // Timer effect
  useEffect(() => {
    if (!gameState.isGameActive || gameState.timeRemaining <= 0) {
      if (gameState.timeRemaining <= 0) {
        // Time's up - check if game was completed
        const isCompleted = gameData?.completedSections.length === 4;
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

  // Listen for multiplayer state changes
  useEffect(() => {
    if (multiplayerState.gameData && multiplayerState.gameData !== gameData) {
      setGameData(multiplayerState.gameData);
    }
  }, [multiplayerState.gameData]);

  // Check for game completion
  useEffect(() => {
    if (gameData && gameData.completedSections.length === 4) {
      setGameState(prev => ({ ...prev, isGameActive: false }));
      onGameComplete(true, calculateScore(gameData));
    }
  }, [gameData?.completedSections.length, onGameComplete]);

  const handleWireConnection = useCallback((connectionId: string, isConnected: boolean) => {
    if (!gameData) return;

    const updatedConnections = gameData.wireConnections.map(connection =>
      connection.id === connectionId
        ? { ...connection, isConnected }
        : connection
    );

    const updatedGameData = {
      ...gameData,
      wireConnections: updatedConnections,
    };

    setGameData(updatedGameData);
    onGameUpdate(updatedGameData);
    
    // Send real-time update to other players
    sendGameUpdate(updatedGameData, { type: 'wire_connection', connectionId, isConnected });

    // Check if this connection completes a section
    checkSectionCompletion(updatedGameData);
  }, [gameData, onGameUpdate, sendGameUpdate]);

  const handleSwitchToggle = useCallback((switchId: string) => {
    if (!gameData) return;

    const updatedSwitches = gameData.switchStates.map(switchState =>
      switchState.id === switchId
        ? { ...switchState, isOn: !switchState.isOn }
        : switchState
    );

    const updatedGameData = {
      ...gameData,
      switchStates: updatedSwitches,
    };

    setGameData(updatedGameData);
    onGameUpdate(updatedGameData);
    
    // Send real-time update to other players
    sendGameUpdate(updatedGameData, { type: 'switch_toggle', switchId });

    // Check if this switch change completes a section
    checkSectionCompletion(updatedGameData);
  }, [gameData, onGameUpdate, sendGameUpdate]);

  const handleSectionComplete = useCallback((sectionId: string) => {
    if (!gameData) return;

    const updatedSections = [...gameData.completedSections, sectionId];
    const updatedGameData = {
      ...gameData,
      completedSections: updatedSections,
    };

    setGameData(updatedGameData);
    onGameUpdate(updatedGameData);
  }, [gameData, onGameUpdate]);

  const handleHintRequest = useCallback(() => {
    // TODO: Implement hint system
    console.log('Hint requested');
  }, []);

  const sendCommunication = useCallback((message: string) => {
    // Send communication through multiplayer context
    const messageType = gameState.playerRole === 'schematic_viewer' ? 'instruction' : 'response';
    sendMessage(message, messageType);
  }, [sendMessage, gameState.playerRole]);

  const checkSectionCompletion = useCallback((data: CircuitSwapData) => {
    // Check if all required connections are made for each section
    const sections = [
      { id: 'power_to_switch', requiredConnections: ['wire1'] },
      { id: 'switch_to_junction', requiredConnections: ['wire2'] },
      { id: 'junction_to_output1', requiredConnections: ['wire3'] },
      { id: 'junction_to_output2', requiredConnections: ['wire4'] },
    ];

    sections.forEach(section => {
      if (data.completedSections.includes(section.id)) return;

      const isCompleted = section.requiredConnections.every(connectionId => {
        const connection = data.wireConnections.find(c => c.id === connectionId);
        return connection?.isConnected || false;
      });

      if (isCompleted) {
        handleSectionComplete(section.id);
      }
    });
  }, [handleSectionComplete]);

  const calculateScore = (data: CircuitSwapData | null): number => {
    if (!data) return 0;
    
    const completionBonus = data.completedSections.length * 100;
    const timeBonus = Math.max(0, data.timeRemaining * 2);
    const efficiencyBonus = data.completedSections.length === 4 ? 200 : 0;
    
    return completionBonus + timeBonus + efficiencyBonus;
  };

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    gameData,
    gameState,
    handleWireConnection,
    handleSwitchToggle,
    handleSectionComplete,
    handleHintRequest,
    sendCommunication,
    formatTime,
  };
};
