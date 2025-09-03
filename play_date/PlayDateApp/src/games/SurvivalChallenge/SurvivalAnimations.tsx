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

interface SurvivalAnimationsProps {
  showCollision: boolean;
  showPowerUp: boolean;
  showMilestone: boolean;
  showGameOver: boolean;
  collisionPosition?: { x: number; y: number };
  powerUpPosition?: { x: number; y: number };
  milestoneText?: string;
  survivalTime?: number;
  onAnimationComplete?: () => void;
}

const { width, height } = Dimensions.get('window');

const SurvivalAnimations: React.FC<SurvivalAnimationsProps> = ({
  showCollision,
  showPowerUp,
  showMilestone,
  showGameOver,
  collisionPosition,
  powerUpPosition,
  milestoneText,
  survivalTime,
  onAnimationComplete,
}) => {
  // Animation values
  const collisionScale = useRef(new Animated.Value(0)).current;
  const collisionOpacity = useRef(new Animated.Value(1)).current;
  const powerUpScale = useRef(new Animated.Value(0)).current;
  const powerUpGlow = useRef(new Animated.Value(0)).current;
  const milestoneY = useRef(new Animated.Value(-100)).current;
  const milestoneOpacity = useRef(new Animated.Value(0)).current;
  const gameOverScale = useRef(new Animated.Value(0)).current;
  const gameOverOpacity = useRef(new Animated.Value(0)).current;
  const sparkles = useRef(Array.from({ length: 6 }, () => new Animated.Value(0))).current;

  // Collision animation
  useEffect(() => {
    if (showCollision) {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(collisionScale, {
            toValue: 1.5,
            duration: 200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(collisionScale, {
            toValue: 0,
            duration: 300,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(collisionOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        collisionScale.setValue(0);
        collisionOpacity.setValue(1);
      });
    }
  }, [showCollision, collisionScale, collisionOpacity]);

  // Power-up animation
  useEffect(() => {
    if (showPowerUp) {
      Animated.parallel([
        Animated.spring(powerUpScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(powerUpGlow, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(powerUpGlow, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();

      // Auto-hide after 2 seconds
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(powerUpScale, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(powerUpGlow, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, 2000);
    }
  }, [showPowerUp, powerUpScale, powerUpGlow]);

  // Milestone animation
  useEffect(() => {
    if (showMilestone) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(milestoneY, {
            toValue: height * 0.3,
            duration: 500,
            easing: Easing.out(Easing.back(1.2)),
            useNativeDriver: true,
          }),
          Animated.timing(milestoneOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(1500),
        Animated.parallel([
          Animated.timing(milestoneY, {
            toValue: -100,
            duration: 400,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(milestoneOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        milestoneY.setValue(-100);
        milestoneOpacity.setValue(0);
      });

      // Sparkle animation
      sparkles.forEach((sparkle, index) => {
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.timing(sparkle, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(sparkle, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [showMilestone, milestoneY, milestoneOpacity, sparkles]);

  // Game over animation
  useEffect(() => {
    if (showGameOver) {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(gameOverScale, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(gameOverOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(3000),
        Animated.parallel([
          Animated.timing(gameOverScale, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(gameOverOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        onAnimationComplete?.();
      });
    }
  }, [showGameOver, gameOverScale, gameOverOpacity, onAnimationComplete]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Collision Effect */}
      {showCollision && collisionPosition && (
        <Animated.View
          style={[
            styles.collisionEffect,
            {
              left: collisionPosition.x - 25,
              top: collisionPosition.y - 25,
              transform: [{ scale: collisionScale }],
              opacity: collisionOpacity,
            },
          ]}
        >
          <Text style={styles.collisionText}>💥</Text>
        </Animated.View>
      )}

      {/* Power-up Effect */}
      {showPowerUp && powerUpPosition && (
        <Animated.View
          style={[
            styles.powerUpEffect,
            {
              left: powerUpPosition.x - 30,
              top: powerUpPosition.y - 30,
              transform: [{ scale: powerUpScale }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.powerUpGlow,
              {
                opacity: powerUpGlow,
              },
            ]}
          />
          <Text style={styles.powerUpText}>⭐</Text>
        </Animated.View>
      )}

      {/* Milestone Celebration */}
      {showMilestone && (
        <>
          <Animated.View
            style={[
              styles.milestoneContainer,
              {
                transform: [{ translateY: milestoneY }],
                opacity: milestoneOpacity,
              },
            ]}
          >
            <Text style={styles.milestoneTitle}>🎉 Milestone! 🎉</Text>
            <Text style={styles.milestoneText}>{milestoneText}</Text>
          </Animated.View>

          {/* Sparkles */}
          {sparkles.map((sparkle, index) => (
            <Animated.View
              key={index}
              style={[
                styles.sparkle,
                {
                  left: (width / 7) * (index + 1),
                  top: height * 0.2 + index * 20,
                  opacity: sparkle,
                  transform: [
                    {
                      scale: sparkle.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1.5],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.sparkleText}>✨</Text>
            </Animated.View>
          ))}
        </>
      )}

      {/* Game Over Screen */}
      {showGameOver && (
        <Animated.View
          style={[
            styles.gameOverContainer,
            {
              opacity: gameOverOpacity,
              transform: [{ scale: gameOverScale }],
            },
          ]}
        >
          <Text style={styles.gameOverTitle}>Game Over</Text>
          <Text style={styles.gameOverSubtitle}>
            You survived for {survivalTime ? formatTime(survivalTime) : '0:00'}
          </Text>
          <Text style={styles.gameOverMessage}>
            Both players must survive together!
          </Text>
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
  collisionEffect: {
    position: 'absolute',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collisionText: {
    fontSize: 30,
  },
  powerUpEffect: {
    position: 'absolute',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  powerUpGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: extendedTheme.colors.success,
    top: -10,
    left: -10,
  },
  powerUpText: {
    fontSize: 36,
    zIndex: 1,
  },
  milestoneContainer: {
    position: 'absolute',
    left: extendedTheme.spacing.lg,
    right: extendedTheme.spacing.lg,
    backgroundColor: extendedTheme.colors.background,
    borderRadius: extendedTheme.borderRadius.xl,
    padding: extendedTheme.spacing.lg,
    alignItems: 'center',
    ...extendedTheme.shadows.lg,
  },
  milestoneTitle: {
    ...extendedTheme.typography.h2,
    color: extendedTheme.colors.success,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: extendedTheme.spacing.sm,
  },
  milestoneText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
    textAlign: 'center',
  },
  sparkle: {
    position: 'absolute',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleText: {
    fontSize: 16,
  },
  gameOverContainer: {
    position: 'absolute',
    top: '35%',
    left: extendedTheme.spacing.lg,
    right: extendedTheme.spacing.lg,
    backgroundColor: extendedTheme.colors.background,
    borderRadius: extendedTheme.borderRadius.xl,
    padding: extendedTheme.spacing.xl,
    alignItems: 'center',
    ...extendedTheme.shadows.lg,
  },
  gameOverTitle: {
    ...extendedTheme.typography.h1,
    color: extendedTheme.colors.error,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: extendedTheme.spacing.md,
  },
  gameOverSubtitle: {
    ...extendedTheme.typography.h3,
    color: extendedTheme.colors.text,
    textAlign: 'center',
    marginBottom: extendedTheme.spacing.sm,
  },
  gameOverMessage: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default SurvivalAnimations;
