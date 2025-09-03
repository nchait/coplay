import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { extendedTheme } from '../utils/theme';

const { width, height } = Dimensions.get('window');

const LoadingScreen: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation animation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();

    return () => {
      rotateAnimation.stop();
    };
  }, [fadeAnim, scaleAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* App Logo/Icon */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <Text style={styles.logoText}>🎮</Text>
        </Animated.View>

        {/* App Name */}
        <Text style={styles.appName}>PlayDate</Text>
        
        {/* Loading Text */}
        <Text style={styles.loadingText}>Loading...</Text>
        
        {/* Loading Indicator */}
        <View style={styles.loadingIndicator}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotDelay1]} />
          <View style={[styles.dot, styles.dotDelay2]} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: extendedTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: extendedTheme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: extendedTheme.spacing.xl,
    ...extendedTheme.shadows.lg,
  },
  logoText: {
    fontSize: 60,
  },
  appName: {
    ...extendedTheme.typography.h1,
    color: extendedTheme.colors.background,
    fontWeight: '700',
    marginBottom: extendedTheme.spacing.lg,
    textAlign: 'center',
  },
  loadingText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.background,
    opacity: 0.8,
    marginBottom: extendedTheme.spacing.lg,
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: extendedTheme.colors.background,
    marginHorizontal: 4,
    opacity: 0.4,
  },
  dotDelay1: {
    // Animation delay will be handled via Animated API if needed
  },
  dotDelay2: {
    // Animation delay will be handled via Animated API if needed
  },
});

export default LoadingScreen;
