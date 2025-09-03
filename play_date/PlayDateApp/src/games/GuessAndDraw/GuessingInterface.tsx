import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { extendedTheme } from '../../utils/theme';

interface GuessingInterfaceProps {
  guesses: string[];
  onGuessSubmit: (guess: string) => void;
  isGuessingEnabled: boolean;
  currentPrompt?: string;
  isCorrectGuess?: boolean;
  timeRemaining?: number;
  showPromptToDrawer?: boolean;
}

const GuessingInterface: React.FC<GuessingInterfaceProps> = ({
  guesses,
  onGuessSubmit,
  isGuessingEnabled,
  currentPrompt,
  isCorrectGuess,
  timeRemaining,
  showPromptToDrawer = false,
}) => {
  const [currentGuess, setCurrentGuess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const successAnimation = useRef(new Animated.Value(0)).current;

  // Auto-scroll to bottom when new guesses are added
  useEffect(() => {
    if (guesses.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [guesses]);

  // Trigger success animation when correct guess is made
  useEffect(() => {
    if (isCorrectGuess) {
      Animated.sequence([
        Animated.spring(successAnimation, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.spring(successAnimation, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isCorrectGuess, successAnimation]);

  const handleSubmitGuess = async () => {
    const trimmedGuess = currentGuess.trim();
    if (!trimmedGuess || !isGuessingEnabled || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      await onGuessSubmit(trimmedGuess);
      setCurrentGuess('');
    } catch (error) {
      // Trigger shake animation on error
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds?: number): string => {
    if (seconds === undefined) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getGuessStyle = (guess: string, index: number) => {
    const isLastGuess = index === guesses.length - 1;
    const isCorrect = isCorrectGuess && isLastGuess;
    
    return [
      styles.guessItem,
      isCorrect && styles.correctGuessItem,
      isLastGuess && styles.latestGuessItem,
    ];
  };

  const getGuessTextStyle = (guess: string, index: number) => {
    const isLastGuess = index === guesses.length - 1;
    const isCorrect = isCorrectGuess && isLastGuess;
    
    return [
      styles.guessText,
      isCorrect && styles.correctGuessText,
    ];
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>
            {showPromptToDrawer ? 'Draw This!' : 'Guess the Drawing'}
          </Text>
          {showPromptToDrawer && currentPrompt && (
            <Text style={styles.promptText}>{currentPrompt}</Text>
          )}
        </View>
        {timeRemaining !== undefined && (
          <View style={styles.timerContainer}>
            <Text style={[
              styles.timerText,
              timeRemaining < 30 && styles.timerWarning
            ]}>
              {formatTime(timeRemaining)}
            </Text>
          </View>
        )}
      </View>

      {/* Guesses List */}
      <View style={styles.guessesContainer}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.guessesList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.guessesContent}
        >
          {guesses.length === 0 ? (
            <Text style={styles.noGuessesText}>
              {isGuessingEnabled 
                ? 'Start guessing what\'s being drawn!' 
                : 'Waiting for guesses...'}
            </Text>
          ) : (
            guesses.map((guess, index) => (
              <Animated.View
                key={`guess-${index}`}
                style={getGuessStyle(guess, index)}
              >
                <Text style={getGuessTextStyle(guess, index)}>
                  {guess}
                </Text>
                <Text style={styles.guessTime}>
                  {new Date().toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </Animated.View>
            ))
          )}
        </ScrollView>
      </View>

      {/* Input Area */}
      {isGuessingEnabled && !isCorrectGuess && (
        <Animated.View 
          style={[
            styles.inputContainer,
            { transform: [{ translateX: shakeAnimation }] }
          ]}
        >
          <TextInput
            style={styles.textInput}
            value={currentGuess}
            onChangeText={setCurrentGuess}
            placeholder="Type your guess..."
            placeholderTextColor={extendedTheme.colors.textLight}
            maxLength={50}
            returnKeyType="send"
            onSubmitEditing={handleSubmitGuess}
            editable={!isSubmitting}
          />
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!currentGuess.trim() || isSubmitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmitGuess}
            disabled={!currentGuess.trim() || isSubmitting}
          >
            <Text style={[
              styles.submitButtonText,
              (!currentGuess.trim() || isSubmitting) && styles.submitButtonTextDisabled
            ]}>
              {isSubmitting ? '...' : 'Guess'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Success Overlay */}
      {isCorrectGuess && (
        <Animated.View
          style={[
            styles.successOverlay,
            {
              opacity: successAnimation,
              transform: [{
                scale: successAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              }],
            },
          ]}
        >
          <Text style={styles.successTitle}>🎉 Correct! 🎉</Text>
          <Text style={styles.successSubtitle}>Great guess!</Text>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: extendedTheme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: extendedTheme.colors.borderLight,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    ...extendedTheme.typography.h4,
    color: extendedTheme.colors.gameAccent,
    fontWeight: '600',
  },
  promptText: {
    ...extendedTheme.typography.h3,
    color: extendedTheme.colors.primary,
    fontWeight: '700',
    marginTop: extendedTheme.spacing.xs,
  },
  timerContainer: {
    backgroundColor: extendedTheme.colors.primary,
    paddingHorizontal: extendedTheme.spacing.sm,
    paddingVertical: extendedTheme.spacing.xs,
    borderRadius: extendedTheme.borderRadius.sm,
  },
  timerText: {
    ...extendedTheme.typography.bodySmall,
    color: extendedTheme.colors.background,
    fontWeight: '600',
  },
  timerWarning: {
    color: extendedTheme.colors.warning,
  },
  guessesContainer: {
    flex: 1,
    paddingHorizontal: extendedTheme.spacing.lg,
  },
  guessesList: {
    flex: 1,
  },
  guessesContent: {
    paddingVertical: extendedTheme.spacing.sm,
  },
  noGuessesText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: extendedTheme.spacing.xl,
  },
  guessItem: {
    backgroundColor: extendedTheme.colors.background,
    borderRadius: extendedTheme.borderRadius.md,
    padding: extendedTheme.spacing.sm,
    marginBottom: extendedTheme.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: extendedTheme.colors.border,
  },
  correctGuessItem: {
    backgroundColor: extendedTheme.colors.success + '20',
    borderLeftColor: extendedTheme.colors.success,
  },
  latestGuessItem: {
    borderLeftColor: extendedTheme.colors.primary,
  },
  guessText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.text,
    marginBottom: extendedTheme.spacing.xs,
  },
  correctGuessText: {
    color: extendedTheme.colors.success,
    fontWeight: '600',
  },
  guessTime: {
    ...extendedTheme.typography.caption,
    color: extendedTheme.colors.textLight,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: extendedTheme.colors.borderLight,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: extendedTheme.colors.border,
    borderRadius: extendedTheme.borderRadius.md,
    paddingHorizontal: extendedTheme.spacing.sm,
    paddingVertical: extendedTheme.spacing.sm,
    marginRight: extendedTheme.spacing.sm,
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.text,
  },
  submitButton: {
    backgroundColor: extendedTheme.colors.primary,
    borderRadius: extendedTheme.borderRadius.md,
    paddingHorizontal: extendedTheme.spacing.md,
    paddingVertical: extendedTheme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  submitButtonDisabled: {
    backgroundColor: extendedTheme.colors.textLight,
  },
  submitButtonText: {
    ...extendedTheme.typography.button,
    color: extendedTheme.colors.background,
    fontSize: 14,
  },
  submitButtonTextDisabled: {
    opacity: 0.7,
  },
  successOverlay: {
    position: 'absolute',
    top: '40%',
    left: extendedTheme.spacing.lg,
    right: extendedTheme.spacing.lg,
    backgroundColor: extendedTheme.colors.background,
    borderRadius: extendedTheme.borderRadius.xl,
    padding: extendedTheme.spacing.xl,
    alignItems: 'center',
    ...extendedTheme.shadows.lg,
  },
  successTitle: {
    ...extendedTheme.typography.h2,
    color: extendedTheme.colors.success,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: extendedTheme.spacing.sm,
  },
  successSubtitle: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default GuessingInterface;
