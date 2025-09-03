import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { extendedTheme } from '../../utils/theme';

interface GuessAndDrawAnimationsProps {
  showSuccess: boolean;
  showCorrectGuess: boolean;
  showTimeWarning: boolean;
  showNewStroke: boolean;
  onAnimationComplete?: () => void;
}

const { width, height } = Dimensions.get('window');

const GuessAndDrawAnimations: React.FC<GuessAndDrawAnimationsProps> = ({
  showSuccess,
  showCorrectGuess,
  showTimeWarning,
  showNewStroke,
  onAnimationComplete,
}) => {
  // Animation values
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const correctGuessScale = useRef(new Animated.Value(0)).current;
  const timeWarningPulse = useRef(new Animated.Value(1)).current;
  const strokeFeedback = useRef(new Animated.Value(0)).current;
  const confettiY = useRef(new Animated.Value(-100)).current;

  // Success animation (game completed successfully)
  useEffect(() => {
    if (showSuccess) {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(successScale, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(successOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(3000),
        Animated.parallel([
          Animated.spring(successScale, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(successOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        onAnimationComplete?.();
      });
    }
  }, [showSuccess, successScale, successOpacity, onAnimationComplete]);

  // Correct guess animation
  useEffect(() => {
    if (showCorrectGuess) {
      Animated.sequence([
        Animated.spring(correctGuessScale, {
          toValue: 1.2,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(correctGuessScale, {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showCorrectGuess, correctGuessScale]);

  // Time warning animation
  useEffect(() => {
    if (showTimeWarning) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(timeWarningPulse, {
            toValue: 1.1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(timeWarningPulse, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      
      return () => pulseAnimation.stop();
    }
  }, [showTimeWarning, timeWarningPulse]);

  // New stroke feedback animation
  useEffect(() => {
    if (showNewStroke) {
      Animated.sequence([
        Animated.timing(strokeFeedback, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(strokeFeedback, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showNewStroke, strokeFeedback]);

  // Confetti animation for success
  useEffect(() => {
    if (showSuccess) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(confettiY, {
            toValue: height + 100,
            duration: 3000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(confettiY, {
            toValue: -100,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [showSuccess, confettiY]);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Success Celebration */}
      {showSuccess && (
        <>
          {/* Main success message */}
          <Animated.View
            style={[
              styles.successContainer,
              {
                opacity: successOpacity,
                transform: [{ scale: successScale }],
              },
            ]}
          >
            <Text style={styles.successTitle}>🎉 Correct Guess! 🎉</Text>
            <Text style={styles.successSubtitle}>Amazing teamwork!</Text>
          </Animated.View>

          {/* Confetti particles */}
          {[...Array(8)].map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.confetti,
                {
                  left: (width / 9) * (index + 1),
                  transform: [
                    {
                      translateY: confettiY.interpolate({
                        inputRange: [-100, height + 100],
                        outputRange: [-100 - index * 150, height + 100],
                      }),
                    },
                    {
                      rotate: confettiY.interpolate({
                        inputRange: [-100, height + 100],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.confettiText}>
                {['🎊', '✨', '🌟', '💫', '🎈', '🎁', '🎉', '⭐'][index]}
              </Text>
            </Animated.View>
          ))}
        </>
      )}

      {/* Correct Guess Feedback */}
      {showCorrectGuess && (
        <Animated.View
          style={[
            styles.correctGuessContainer,
            {
              transform: [{ scale: correctGuessScale }],
            },
          ]}
        >
          <Text style={styles.correctGuessText}>✓ Correct!</Text>
        </Animated.View>
      )}

      {/* Time Warning Pulse */}
      {showTimeWarning && (
        <Animated.View
          style={[
            styles.timeWarningContainer,
            {
              transform: [{ scale: timeWarningPulse }],
            },
          ]}
        >
          <Text style={styles.timeWarningText}>⏰ Hurry Up!</Text>
        </Animated.View>
      )}

      {/* New Stroke Feedback */}
      {showNewStroke && (
        <Animated.View
          style={[
            styles.strokeFeedbackContainer,
            {
              opacity: strokeFeedback,
              transform: [
                {
                  scale: strokeFeedback.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.strokeFeedbackText}>🎨</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  successContainer: {
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
  confetti: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiText: {
    fontSize: 24,
  },
  correctGuessContainer: {
    position: 'absolute',
    top: '30%',
    alignSelf: 'center',
    backgroundColor: extendedTheme.colors.success + '20',
    borderRadius: extendedTheme.borderRadius.lg,
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.md,
    borderWidth: 2,
    borderColor: extendedTheme.colors.success,
  },
  correctGuessText: {
    ...extendedTheme.typography.h3,
    color: extendedTheme.colors.success,
    fontWeight: '700',
  },
  timeWarningContainer: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: extendedTheme.colors.warning + '20',
    borderRadius: extendedTheme.borderRadius.lg,
    paddingHorizontal: extendedTheme.spacing.md,
    paddingVertical: extendedTheme.spacing.sm,
    borderWidth: 2,
    borderColor: extendedTheme.colors.warning,
  },
  timeWarningText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.warning,
    fontWeight: '600',
  },
  strokeFeedbackContainer: {
    position: 'absolute',
    top: '20%',
    right: extendedTheme.spacing.lg,
    backgroundColor: extendedTheme.colors.secondary + '20',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: extendedTheme.colors.secondary,
  },
  strokeFeedbackText: {
    fontSize: 24,
  },
});

export default GuessAndDrawAnimations;
