import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { extendedTheme } from '../../../utils/theme';

interface ButtonPresserProps {
  currentInput: string[];
  onButtonPress: (color: string) => void;
  onSequenceSubmit: () => void;
  attemptsRemaining: number;
}

const ButtonPresser: React.FC<ButtonPresserProps> = ({
  currentInput,
  onButtonPress,
  onSequenceSubmit,
  attemptsRemaining,
}) => {
  const { width } = Dimensions.get('window');
  const buttonSize = (width - (extendedTheme.spacing.lg * 2) - (extendedTheme.spacing.sm * 2)) / 3;

  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

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

  const renderColorButton = (color: string) => {
    return (
      <TouchableOpacity
        key={color}
        style={[
          styles.colorButton,
          getColorStyle(color),
          {
            width: buttonSize,
            height: buttonSize,
          }
        ]}
        onPress={() => onButtonPress(color)}
      >
        <Text style={styles.colorButtonText}>
          {color.charAt(0).toUpperCase()}
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
            width: 40,
            height: 40,
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
      <Text style={styles.title}>Color Buttons</Text>
      <Text style={styles.subtitle}>Press the colors your partner tells you</Text>
      
      {/* Current Input Display */}
      <View style={styles.inputDisplayContainer}>
        <Text style={styles.sectionTitle}>Current Sequence:</Text>
        <View style={styles.inputDisplay}>
          {currentInput.map((color, index) => renderCurrentInput(color, index))}
          {currentInput.length === 0 && (
            <Text style={styles.emptyText}>No colors pressed yet</Text>
          )}
        </View>
      </View>

      {/* Color Buttons */}
      <View style={styles.buttonsContainer}>
        <Text style={styles.sectionTitle}>Press Colors:</Text>
        <View style={styles.buttonsGrid}>
          {colors.map(color => renderColorButton(color))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.submitButton]}
          onPress={onSequenceSubmit}
          disabled={currentInput.length === 0}
        >
          <Text style={styles.actionButtonText}>Submit Sequence</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.clearButton]}
          onPress={() => {
            // Clear current input
            while (currentInput.length > 0) {
              onButtonPress('clear');
            }
          }}
          disabled={currentInput.length === 0}
        >
          <Text style={styles.actionButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Game Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Attempts Remaining: {attemptsRemaining}
        </Text>
        <Text style={styles.statusText}>
          Sequence Length: {currentInput.length}
        </Text>
      </View>

      {/* Instructions for Player B */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionTitle}>Your Role:</Text>
        <Text style={styles.instructionText}>
          • You can press the color buttons
        </Text>
        <Text style={styles.instructionText}>
          • Listen to your partner's instructions carefully
        </Text>
        <Text style={styles.instructionText}>
          • Press colors in the order they tell you
        </Text>
        <Text style={styles.instructionText}>
          • Submit when you think the sequence is complete
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
  inputDisplayContainer: {
    marginBottom: extendedTheme.spacing.lg,
  },
  sectionTitle: {
    ...extendedTheme.typography.h4,
    color: extendedTheme.colors.text,
    fontWeight: '600',
    marginBottom: extendedTheme.spacing.sm,
    textAlign: 'center',
  },
  inputDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: extendedTheme.spacing.sm,
    minHeight: 50,
  },
  inputButton: {
    borderRadius: extendedTheme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...extendedTheme.shadows.sm,
  },
  inputButtonText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.background,
    fontWeight: '600',
  },
  emptyText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
    fontStyle: 'italic',
  },
  buttonsContainer: {
    marginBottom: extendedTheme.spacing.lg,
  },
  buttonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: extendedTheme.spacing.sm,
  },
  colorButton: {
    borderRadius: extendedTheme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...extendedTheme.shadows.sm,
  },
  colorButtonText: {
    ...extendedTheme.typography.h3,
    color: extendedTheme.colors.background,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: extendedTheme.spacing.lg,
  },
  actionButton: {
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.md,
    borderRadius: extendedTheme.borderRadius.md,
    minWidth: 120,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: extendedTheme.colors.success,
  },
  clearButton: {
    backgroundColor: extendedTheme.colors.error,
  },
  actionButtonText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.background,
    fontWeight: '600',
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

export default ButtonPresser;
