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

interface PuzzleAnimationsProps {
  showSuccess: boolean;
  showCorrectPlacement: boolean;
  showIncorrectPlacement: boolean;
  completionPercentage: number;
  onAnimationComplete?: () => void;
}

const { width, height } = Dimensions.get('window');

const PuzzleAnimations: React.FC<PuzzleAnimationsProps> = ({
  showSuccess,
  showCorrectPlacement,
  showIncorrectPlacement,
  completionPercentage,
  onAnimationComplete,
}) => {
  // Animation values
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const correctScale = useRef(new Animated.Value(1)).current;
  const incorrectShake = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const celebrationY = useRef(new Animated.Value(-50)).current;

  // Success animation
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
        Animated.delay(2000),
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

  // Correct placement animation
  useEffect(() => {
    if (showCorrectPlacement) {
      Animated.sequence([
        Animated.spring(correctScale, {
          toValue: 1.2,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(correctScale, {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showCorrectPlacement, correctScale]);

  // Incorrect placement animation
  useEffect(() => {
    if (showIncorrectPlacement) {
      Animated.sequence([
        Animated.timing(incorrectShake, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(incorrectShake, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(incorrectShake, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(incorrectShake, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showIncorrectPlacement, incorrectShake]);

  // Progress animation
  useEffect(() => {
    Animated.timing(progressWidth, {
      toValue: completionPercentage,
      duration: 500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [completionPercentage, progressWidth]);

  // Celebration particles animation
  useEffect(() => {
    if (showSuccess) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(celebrationY, {
            toValue: height + 50,
            duration: 3000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(celebrationY, {
            toValue: -50,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [showSuccess, celebrationY]);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Progress Bar Animation */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>

      {/* Correct Placement Feedback */}
      {showCorrectPlacement && (
        <Animated.View
          style={[
            styles.feedbackContainer,
            {
              transform: [{ scale: correctScale }],
            },
          ]}
        >
          <Text style={styles.correctText}>✓</Text>
        </Animated.View>
      )}

      {/* Incorrect Placement Feedback */}
      {showIncorrectPlacement && (
        <Animated.View
          style={[
            styles.feedbackContainer,
            {
              transform: [{ translateX: incorrectShake }],
            },
          ]}
        >
          <Text style={styles.incorrectText}>✗</Text>
        </Animated.View>
      )}

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
            <Text style={styles.successTitle}>🎉 Puzzle Solved! 🎉</Text>
            <Text style={styles.successSubtitle}>Great teamwork!</Text>
          </Animated.View>

          {/* Celebration particles */}
          {[...Array(6)].map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                {
                  left: (width / 7) * (index + 1),
                  transform: [
                    {
                      translateY: celebrationY.interpolate({
                        inputRange: [-50, height + 50],
                        outputRange: [-50 - index * 200, height + 50],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.particleText}>
                {['🎊', '✨', '🌟', '💫', '🎈', '🎁'][index]}
              </Text>
            </Animated.View>
          ))}
        </>
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
  progressContainer: {
    position: 'absolute',
    top: 100,
    left: extendedTheme.spacing.lg,
    right: extendedTheme.spacing.lg,
  },
  progressBackground: {
    height: 4,
    backgroundColor: extendedTheme.colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: extendedTheme.colors.success,
    borderRadius: 2,
  },
  feedbackContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -25,
    marginLeft: -25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: extendedTheme.colors.background,
    borderRadius: 25,
    ...extendedTheme.shadows.lg,
  },
  correctText: {
    fontSize: 24,
    color: extendedTheme.colors.success,
    fontWeight: 'bold',
  },
  incorrectText: {
    fontSize: 24,
    color: extendedTheme.colors.error,
    fontWeight: 'bold',
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
  particle: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particleText: {
    fontSize: 20,
  },
});

export default PuzzleAnimations;
