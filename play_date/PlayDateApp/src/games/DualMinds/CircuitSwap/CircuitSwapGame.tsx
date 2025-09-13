import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { extendedTheme } from '../../../utils/theme';
import { GameSession, CircuitSwapData } from '../../../types';
import { DualMindsGameProps, DualMindsGameState } from '../types';
import CircuitSchematic from './CircuitSchematic';
import WireManipulator from './WireManipulator';
import GameHUD from '../components/GameHUD';
import CommunicationPanel from '../components/CommunicationPanel';
import { useCircuitSwap } from './useCircuitSwap';

const CircuitSwapGame: React.FC<DualMindsGameProps> = ({
  gameSession,
  currentUserId,
  onGameUpdate,
  onGameComplete,
}) => {
  const {
    gameData,
    gameState,
    handleWireConnection,
    handleSwitchToggle,
    handleSectionComplete,
    handleHintRequest,
    sendCommunication,
    formatTime,
  } = useCircuitSwap({
    gameSession,
    currentUserId,
    onGameUpdate,
    onGameComplete,
  });

  const [showCommunication, setShowCommunication] = useState(false);

  // Initialize game data if not present
  useEffect(() => {
    if (!gameData) {
      const initialGameData: CircuitSwapData = {
        circuitSchematic: generateCircuitSchematic(),
        wireConnections: generateWireConnections(),
        switchStates: generateSwitchStates(),
        completedSections: [],
        timeRemaining: 300, // 5 minutes
        playerARole: 'schematic_viewer',
        playerBRole: 'wire_manipulator',
      };
      onGameUpdate(initialGameData);
    }
  }, [gameData, onGameUpdate]);

  const isPlayerA = gameState.isPlayerA;
  const playerRole = isPlayerA ? 'schematic_viewer' : 'wire_manipulator';

  const handleGameComplete = (success: boolean) => {
    const score = calculateScore(gameData);
    onGameComplete(success, score);
  };

  const calculateScore = (data: CircuitSwapData): number => {
    if (!data) return 0;
    
    const completionBonus = data.completedSections.length * 100;
    const timeBonus = Math.max(0, data.timeRemaining * 2);
    const efficiencyBonus = data.completedSections.length === 4 ? 200 : 0;
    
    return completionBonus + timeBonus + efficiencyBonus;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Game Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Circuit Swap</Text>
        <View style={styles.timerContainer}>
          <Text style={[styles.timer, gameState.timeRemaining < 30 && styles.timerWarning]}>
            {formatTime(gameState.timeRemaining)}
          </Text>
        </View>
      </View>

      {/* Player Role Display */}
      <View style={styles.roleContainer}>
        <Text style={styles.roleText}>
          You are the {playerRole === 'schematic_viewer' ? 'Schematic Viewer' : 'Wire Manipulator'}
        </Text>
        <Text style={styles.instructionText}>
          {playerRole === 'schematic_viewer' 
            ? 'Guide your partner to connect the wires correctly'
            : 'Follow your partner\'s instructions to connect the wires'
          }
        </Text>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        {isPlayerA ? (
          <CircuitSchematic
            schematic={gameData?.circuitSchematic || []}
            connections={gameData?.wireConnections || []}
            switches={gameData?.switchStates || []}
            completedSections={gameData?.completedSections || []}
            onSectionComplete={handleSectionComplete}
          />
        ) : (
          <WireManipulator
            connections={gameData?.wireConnections || []}
            switches={gameData?.switchStates || []}
            onWireConnection={handleWireConnection}
            onSwitchToggle={handleSwitchToggle}
          />
        )}
      </View>

      {/* Game HUD */}
      <GameHUD
        timeRemaining={gameState.timeRemaining}
        progress={gameData?.completedSections.length || 0}
        maxProgress={4}
        hintsUsed={0} // TODO: Implement hint system
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
const generateCircuitSchematic = () => {
  return [
    {
      id: 'power',
      x: 20,
      y: 30,
      type: 'power_source' as const,
      connections: ['switch1'],
      isVisibleToPlayerA: true,
      isVisibleToPlayerB: false,
    },
    {
      id: 'switch1',
      x: 40,
      y: 30,
      type: 'switch' as const,
      connections: ['junction1'],
      isVisibleToPlayerA: true,
      isVisibleToPlayerB: true,
    },
    {
      id: 'junction1',
      x: 60,
      y: 30,
      type: 'junction' as const,
      connections: ['output1', 'output2'],
      isVisibleToPlayerA: true,
      isVisibleToPlayerB: false,
    },
    {
      id: 'output1',
      x: 80,
      y: 20,
      type: 'output' as const,
      connections: [],
      isVisibleToPlayerA: true,
      isVisibleToPlayerB: true,
    },
    {
      id: 'output2',
      x: 80,
      y: 40,
      type: 'output' as const,
      connections: [],
      isVisibleToPlayerA: true,
      isVisibleToPlayerB: true,
    },
  ];
};

const generateWireConnections = () => {
  return [
    {
      id: 'wire1',
      fromNodeId: 'power',
      toNodeId: 'switch1',
      isConnected: false,
      color: '#FF6B6B',
      position: { x: 30, y: 30 },
    },
    {
      id: 'wire2',
      fromNodeId: 'switch1',
      toNodeId: 'junction1',
      isConnected: false,
      color: '#4ECDC4',
      position: { x: 50, y: 30 },
    },
    {
      id: 'wire3',
      fromNodeId: 'junction1',
      toNodeId: 'output1',
      isConnected: false,
      color: '#45B7D1',
      position: { x: 70, y: 25 },
    },
    {
      id: 'wire4',
      fromNodeId: 'junction1',
      toNodeId: 'output2',
      isConnected: false,
      color: '#96CEB4',
      position: { x: 70, y: 35 },
    },
  ];
};

const generateSwitchStates = () => {
  return [
    {
      id: 'switch1',
      isOn: false,
      position: { x: 40, y: 30 },
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

export default CircuitSwapGame;
