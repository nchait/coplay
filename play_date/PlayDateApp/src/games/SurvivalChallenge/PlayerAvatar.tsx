import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { extendedTheme } from '../../utils/theme';

interface PlayerAvatarProps {
  position: { x: number; y: number };
  isCurrentPlayer: boolean;
  isAlive: boolean;
  isInvulnerable?: boolean;
  size?: number;
  playerId: string;
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  position,
  isCurrentPlayer,
  isAlive,
  isInvulnerable = false,
  size = 30,
  playerId,
}) => {
  // Animation values
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const invulnerabilityAnimation = useRef(new Animated.Value(1)).current;
  const deathAnimation = useRef(new Animated.Value(1)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;

  // Pulse animation for current player
  useEffect(() => {
    if (isCurrentPlayer && isAlive) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      
      return () => pulse.stop();
    }
  }, [isCurrentPlayer, isAlive, pulseAnimation]);

  // Invulnerability animation (flashing effect)
  useEffect(() => {
    if (isInvulnerable && isAlive) {
      const flash = Animated.loop(
        Animated.sequence([
          Animated.timing(invulnerabilityAnimation, {
            toValue: 0.3,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(invulnerabilityAnimation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ])
      );
      flash.start();
      
      return () => flash.stop();
    } else {
      invulnerabilityAnimation.setValue(1);
    }
  }, [isInvulnerable, isAlive, invulnerabilityAnimation]);

  // Death animation
  useEffect(() => {
    if (!isAlive) {
      Animated.sequence([
        Animated.timing(deathAnimation, {
          toValue: 1.5,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(deathAnimation, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      deathAnimation.setValue(1);
    }
  }, [isAlive, deathAnimation]);

  // Glow animation for special states
  useEffect(() => {
    if (isCurrentPlayer && isAlive) {
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnimation, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      glow.start();
      
      return () => glow.stop();
    }
  }, [isCurrentPlayer, isAlive, glowAnimation]);

  const getPlayerColor = () => {
    if (!isAlive) return extendedTheme.colors.textLight;
    return isCurrentPlayer ? extendedTheme.colors.primary : extendedTheme.colors.secondary;
  };

  const getBorderColor = () => {
    if (!isAlive) return extendedTheme.colors.error;
    if (isInvulnerable) return extendedTheme.colors.warning;
    return extendedTheme.colors.background;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: position.x - size / 2,
          top: position.y - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: getPlayerColor(),
          borderColor: getBorderColor(),
          transform: [
            { scale: pulseAnimation },
            { scale: deathAnimation },
          ],
          opacity: invulnerabilityAnimation,
        },
      ]}
    >
      {/* Glow effect for current player */}
      {isCurrentPlayer && isAlive && (
        <Animated.View
          style={[
            styles.glow,
            {
              width: size + 10,
              height: size + 10,
              borderRadius: (size + 10) / 2,
              opacity: glowAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.3],
              }),
            },
          ]}
        />
      )}
      
      {/* Inner core */}
      <View
        style={[
          styles.innerCore,
          {
            width: size * 0.6,
            height: size * 0.6,
            borderRadius: (size * 0.6) / 2,
            backgroundColor: isAlive 
              ? extendedTheme.colors.background 
              : extendedTheme.colors.error,
          },
        ]}
      />
      
      {/* Player indicator */}
      <View
        style={[
          styles.playerIndicator,
          {
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: (size * 0.3) / 2,
            backgroundColor: getPlayerColor(),
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    ...extendedTheme.shadows.sm,
  },
  glow: {
    position: 'absolute',
    backgroundColor: extendedTheme.colors.primary,
    zIndex: -1,
  },
  innerCore: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerIndicator: {
    position: 'absolute',
  },
});

export default PlayerAvatar;
