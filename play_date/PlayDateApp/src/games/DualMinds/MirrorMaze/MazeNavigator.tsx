import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { extendedTheme } from '../../../utils/theme';

interface MazeNavigatorProps {
  playerPosition: { x: number; y: number };
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onHintRequest: () => void;
}

const MazeNavigator: React.FC<MazeNavigatorProps> = ({
  playerPosition,
  onMove,
  onHintRequest,
}) => {
  const { width } = Dimensions.get('window');
  const cellSize = (width - (extendedTheme.spacing.lg * 2)) / 10;

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    onMove(direction);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Maze Navigator</Text>
      <Text style={styles.subtitle}>Follow your partner's directions</Text>
      
      {/* Player Position Display */}
      <View style={styles.positionContainer}>
        <Text style={styles.positionText}>
          Current Position: ({playerPosition.x}, {playerPosition.y})
        </Text>
      </View>

      {/* Movement Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleMove('up')}
          >
            <Text style={styles.controlButtonText}>↑</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleMove('left')}
          >
            <Text style={styles.controlButtonText}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.centerButton}>
            <Text style={styles.centerButtonText}>👤</Text>
          </View>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleMove('right')}
          >
            <Text style={styles.controlButtonText}>→</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleMove('down')}
          >
            <Text style={styles.controlButtonText}>↓</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Messages */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Listen to your partner's instructions carefully
        </Text>
        <Text style={styles.statusText}>
          Use the arrow buttons to move in the maze
        </Text>
        <Text style={styles.statusText}>
          Avoid walls and reach the exit!
        </Text>
      </View>

      {/* Instructions for Player B */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionTitle}>Your Role:</Text>
        <Text style={styles.instructionText}>
          • You can move through the maze using the controls
        </Text>
        <Text style={styles.instructionText}>
          • Listen carefully to your partner's directions
        </Text>
        <Text style={styles.instructionText}>
          • You cannot see the maze layout or walls
        </Text>
        <Text style={styles.instructionText}>
          • Trust your partner's guidance to reach the exit
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    ...extendedTheme.typography.h3,
    color: extendedTheme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: extendedTheme.spacing.xs,
  },
  subtitle: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: extendedTheme.spacing.lg,
  },
  positionContainer: {
    backgroundColor: extendedTheme.colors.surface,
    padding: extendedTheme.spacing.md,
    borderRadius: extendedTheme.borderRadius.md,
    alignItems: 'center',
    marginBottom: extendedTheme.spacing.lg,
    ...extendedTheme.shadows.sm,
  },
  positionText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.text,
    fontWeight: '600',
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: extendedTheme.spacing.lg,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: extendedTheme.spacing.sm,
  },
  controlButton: {
    width: 60,
    height: 60,
    backgroundColor: extendedTheme.colors.primary,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: extendedTheme.spacing.sm,
    ...extendedTheme.shadows.sm,
  },
  controlButtonText: {
    ...extendedTheme.typography.h2,
    color: extendedTheme.colors.background,
    fontWeight: '600',
  },
  centerButton: {
    width: 60,
    height: 60,
    backgroundColor: extendedTheme.colors.secondary,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: extendedTheme.spacing.sm,
    ...extendedTheme.shadows.sm,
  },
  centerButtonText: {
    fontSize: 24,
  },
  statusContainer: {
    backgroundColor: extendedTheme.colors.background,
    padding: extendedTheme.spacing.md,
    borderRadius: extendedTheme.borderRadius.md,
    marginBottom: extendedTheme.spacing.lg,
    ...extendedTheme.shadows.sm,
  },
  statusText: {
    ...extendedTheme.typography.bodySmall,
    color: extendedTheme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: extendedTheme.spacing.xs,
  },
  instructionsContainer: {
    backgroundColor: extendedTheme.colors.surface,
    padding: extendedTheme.spacing.md,
    borderRadius: extendedTheme.borderRadius.md,
    ...extendedTheme.shadows.sm,
  },
  instructionTitle: {
    ...extendedTheme.typography.h4,
    color: extendedTheme.colors.text,
    fontWeight: '600',
    marginBottom: extendedTheme.spacing.sm,
  },
  instructionText: {
    ...extendedTheme.typography.bodySmall,
    color: extendedTheme.colors.textSecondary,
    marginBottom: extendedTheme.spacing.xs,
  },
});

export default MazeNavigator;
