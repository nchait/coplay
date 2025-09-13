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
import { GameSession, ColorCodeLockData } from '../../../types';
import { DualMindsGameProps, DualMindsGameState } from '../types';
import SequenceViewer from './SequenceViewer';
import ButtonPresser from './ButtonPresser';
import GameHUD from '../components/GameHUD';
import CommunicationPanel from '../components/CommunicationPanel';
import { useColorCodeLock } from './useColorCodeLock';

const ColorCodeLockGame: React.FC<DualMindsGameProps> = ({
  gameSession,
  currentUserId,
  onGameUpdate,
  onGameComplete,
}) => {
  const {
    gameData,
    gameState,
    handleButtonPress,
    handleSequenceSubmit,
    handleHintRequest,
    sendCommunication,
    formatTime,
  } = useColorCodeLock({
    gameSession,
    currentUserId,
    onGameUpdate,
    onGameComplete,
  });

  const [showCommunication, setShowCommunication] = useState(false);

  // Initialize game data if not present
  useEffect(() => {
    if (!gameData) {
      const initialGameData: ColorCodeLockData = {
        correctSequence: generateColorSequence(),
        currentInput: [],
        attemptsRemaining: 3,
        timeRemaining: 180, // 3 minutes
        hintLevel: 0,
        playerARole: 'sequence_viewer',
        playerBRole: 'button_presser',
      };
      onGameUpdate(initialGameData);
    }
  }, [gameData, onGameUpdate]);

  const isPlayerA = gameState.isPlayerA;
  const playerRole = isPlayerA ? 'sequence_viewer' : 'button_presser';

  const handleGameComplete = (success: boolean) => {
    const score = calculateScore(gameData);
    onGameComplete(success, score);
  };

  const calculateScore = (data: ColorCodeLockData): number => {
    if (!data) return 0;
    
    const timeBonus = Math.max(0, data.timeRemaining * 2);
    const attemptBonus = data.attemptsRemaining * 100;
    const accuracyBonus = data.currentInput.length === data.correctSequence.length ? 200 : 0;
    
    return timeBonus + attemptBonus + accuracyBonus;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Game Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Color Code Lock</Text>
        <View style={styles.timerContainer}>
          <Text style={[styles.timer, gameState.timeRemaining < 30 && styles.timerWarning]}>
            {formatTime(gameState.timeRemaining)}
          </Text>
        </View>
      </View>

      {/* Player Role Display */}
      <View style={styles.roleContainer}>
        <Text style={styles.roleText}>
          You are the {playerRole === 'sequence_viewer' ? 'Sequence Viewer' : 'Button Presser'}
        </Text>
        <Text style={styles.instructionText}>
          {playerRole === 'sequence_viewer' 
            ? 'Tell your partner the correct color sequence'
            : 'Press the buttons in the sequence your partner tells you'
          }
        </Text>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        {isPlayerA ? (
          <SequenceViewer
            correctSequence={gameData?.correctSequence || []}
            currentInput={gameData?.currentInput || []}
            attemptsRemaining={gameData?.attemptsRemaining || 3}
            onHintRequest={handleHintRequest}
          />
        ) : (
          <ButtonPresser
            currentInput={gameData?.currentInput || []}
            onButtonPress={handleButtonPress}
            onSequenceSubmit={handleSequenceSubmit}
            attemptsRemaining={gameData?.attemptsRemaining || 3}
          />
        )}
      </View>

      {/* Game HUD */}
      <GameHUD
        timeRemaining={gameState.timeRemaining}
        progress={gameData?.currentInput.length || 0}
        maxProgress={gameData?.correctSequence.length || 5}
        hintsUsed={gameData?.hintLevel || 0}
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
const generateColorSequence = () => {
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
  const sequence = [];
  
  for (let i = 0; i < 5; i++) {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    sequence.push(randomColor);
  }
  
  return sequence;
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

export default ColorCodeLockGame;
