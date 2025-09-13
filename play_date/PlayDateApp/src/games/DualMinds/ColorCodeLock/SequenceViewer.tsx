import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { extendedTheme } from '../../../utils/theme';

interface SequenceViewerProps {
  correctSequence: string[];
  currentInput: string[];
  attemptsRemaining: number;
  onHintRequest: () => void;
}

const SequenceViewer: React.FC<SequenceViewerProps> = ({
  correctSequence,
  currentInput,
  attemptsRemaining,
  onHintRequest,
}) => {
  const { width } = Dimensions.get('window');
  const buttonSize = (width - (extendedTheme.spacing.lg * 2) - (extendedTheme.spacing.sm * 4)) / 5;

  const getColorStyle = (color: string) => {
    const colorMap: { [key: string]: any } = {
      red: { backgroundColor: '#FF6B6B' },
      blue: { backgroundColor: '#4ECDC4' },
      green: { backgroundColor: '#45B7D1' },
      yellow: { backgroundColor: '#FFE66D' },
      purple: { backgroundColor: '#A8E6CF' },
      orange: { backgroundColor: '#FFB347' },
    };
    return colorMap[color] || { backgroundColor: extendedTheme.colors.borderLight };
  };

  const renderSequenceButton = (color: string, index: number) => {
    const isCurrentInput = currentInput.length > index;
    const isCorrect = isCurrentInput && currentInput[index] === color;
    const isIncorrect = isCurrentInput && currentInput[index] !== color;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.sequenceButton,
          getColorStyle(color),
          {
            width: buttonSize,
            height: buttonSize,
            borderColor: isCorrect ? extendedTheme.colors.success : 
                        isIncorrect ? extendedTheme.colors.error : 
                        extendedTheme.colors.borderLight,
            borderWidth: isCurrentInput ? 3 : 1,
          }
        ]}
        onPress={() => onHintRequest()}
      >
        <Text style={styles.sequenceButtonText}>
          {isCurrentInput ? (isCorrect ? '✓' : '✗') : '?'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCurrentInput = (color: string, index: number) => {
    return (
      <View
        key={index}
        style={[
          styles.inputButton,
          getColorStyle(color),
          {
            width: buttonSize,
            height: buttonSize,
          }
        ]}
      >
        <Text style={styles.inputButtonText}>
          {color.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Color Sequence</Text>
      <Text style={styles.subtitle}>Guide your partner to press the correct sequence</Text>
      
      {/* Correct Sequence */}
      <View style={styles.sequenceContainer}>
        <Text style={styles.sectionTitle}>Correct Sequence:</Text>
        <View style={styles.sequenceRow}>
          {correctSequence.map((color, index) => renderSequenceButton(color, index))}
        </View>
      </View>

      {/* Current Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.sectionTitle}>Current Input:</Text>
        <View style={styles.inputRow}>
          {currentInput.map((color, index) => renderCurrentInput(color, index))}
          {Array.from({ length: correctSequence.length - currentInput.length }).map((_, index) => (
            <View
              key={`empty-${index}`}
              style={[
                styles.emptyButton,
                {
                  width: buttonSize,
                  height: buttonSize,
                }
              ]}
            />
          ))}
        </View>
      </View>

      {/* Game Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Attempts Remaining: {attemptsRemaining}
        </Text>
        <Text style={styles.statusText}>
          Progress: {currentInput.length}/{correctSequence.length}
        </Text>
      </View>

      {/* Instructions for Player A */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionTitle}>Your Role:</Text>
        <Text style={styles.instructionText}>
          • You can see the correct color sequence
        </Text>
        <Text style={styles.instructionText}>
          • Guide your partner to press the colors in order
        </Text>
        <Text style={styles.instructionText}>
          • Watch their progress and provide feedback
        </Text>
        <Text style={styles.instructionText}>
          • Use the communication panel to send instructions
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
  sequenceContainer: {
    marginBottom: extendedTheme.spacing.lg,
  },
  sectionTitle: {
    ...extendedTheme.typography.h4,
    color: extendedTheme.colors.text,
    fontWeight: '600',
    marginBottom: extendedTheme.spacing.sm,
    textAlign: 'center',
  },
  sequenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: extendedTheme.spacing.sm,
  },
  sequenceButton: {
    borderRadius: extendedTheme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...extendedTheme.shadows.sm,
  },
  sequenceButtonText: {
    ...extendedTheme.typography.h3,
    color: extendedTheme.colors.background,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: extendedTheme.spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: extendedTheme.spacing.sm,
  },
  inputButton: {
    borderRadius: extendedTheme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...extendedTheme.shadows.sm,
  },
  inputButtonText: {
    ...extendedTheme.typography.h3,
    color: extendedTheme.colors.background,
    fontWeight: '600',
  },
  emptyButton: {
    backgroundColor: extendedTheme.colors.borderLight,
    borderRadius: extendedTheme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    backgroundColor: extendedTheme.colors.surface,
    padding: extendedTheme.spacing.md,
    borderRadius: extendedTheme.borderRadius.md,
    marginBottom: extendedTheme.spacing.lg,
    ...extendedTheme.shadows.sm,
  },
  statusText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.text,
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

export default SequenceViewer;
