import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { extendedTheme } from '../../../utils/theme';

interface GameHUDProps {
  timeRemaining: number;
  progress: number;
  maxProgress: number;
  hintsUsed: number;
  onHintPress: () => void;
  onCommunicationPress: () => void;
}

const GameHUD: React.FC<GameHUDProps> = ({
  timeRemaining,
  progress,
  maxProgress,
  hintsUsed,
  onHintPress,
  onCommunicationPress,
}) => {
  const progressPercentage = (progress / maxProgress) * 100;

  return (
    <View style={styles.container}>
      {/* Timer */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>Time</Text>
        <Text style={[
          styles.timer,
          timeRemaining < 30 && styles.timerWarning
        ]}>
          {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>Progress</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${progressPercentage}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {progress}/{maxProgress}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onHintPress}
        >
          <Text style={styles.actionButtonText}>
            💡 Hint ({hintsUsed})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.communicationButton]}
          onPress={onCommunicationPress}
        >
          <Text style={styles.actionButtonText}>
            💬 Talk
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.md,
    backgroundColor: extendedTheme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: extendedTheme.colors.borderLight,
    ...extendedTheme.shadows.sm,
  },
  timerContainer: {
    alignItems: 'center',
    marginRight: extendedTheme.spacing.lg,
  },
  timerLabel: {
    ...extendedTheme.typography.caption,
    color: extendedTheme.colors.textSecondary,
    marginBottom: extendedTheme.spacing.xs,
  },
  timer: {
    ...extendedTheme.typography.h4,
    color: extendedTheme.colors.text,
    fontWeight: '600',
  },
  timerWarning: {
    color: extendedTheme.colors.error,
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: extendedTheme.spacing.lg,
  },
  progressLabel: {
    ...extendedTheme.typography.caption,
    color: extendedTheme.colors.textSecondary,
    marginBottom: extendedTheme.spacing.xs,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: extendedTheme.colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: extendedTheme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: extendedTheme.colors.primary,
    borderRadius: 4,
  },
  progressText: {
    ...extendedTheme.typography.caption,
    color: extendedTheme.colors.textSecondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: extendedTheme.spacing.sm,
  },
  actionButton: {
    backgroundColor: extendedTheme.colors.primary,
    paddingHorizontal: extendedTheme.spacing.md,
    paddingVertical: extendedTheme.spacing.sm,
    borderRadius: extendedTheme.borderRadius.md,
    ...extendedTheme.shadows.sm,
  },
  communicationButton: {
    backgroundColor: extendedTheme.colors.secondary,
  },
  actionButtonText: {
    ...extendedTheme.typography.bodySmall,
    color: extendedTheme.colors.background,
    fontWeight: '600',
  },
});

export default GameHUD;
