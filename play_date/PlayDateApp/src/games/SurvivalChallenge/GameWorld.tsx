import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  PanResponderGestureState,
  GestureResponderEvent,
} from 'react-native';
import { extendedTheme } from '../../utils/theme';
import { Obstacle, SurvivalChallengeData } from '../../types';

interface GameWorldProps {
  gameData: SurvivalChallengeData;
  currentUserId: string;
  onPlayerMove: (userId: string, position: { x: number; y: number }) => void;
  onCollision: (userId: string, obstacleId: string) => void;
  isGameActive: boolean;
  gameSpeed: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GAME_AREA_HEIGHT = SCREEN_HEIGHT * 0.6; // 60% of screen height
const PLAYER_SIZE = 30;
const COLLISION_THRESHOLD = 25;

const GameWorld: React.FC<GameWorldProps> = ({
  gameData,
  currentUserId,
  onPlayerMove,
  onCollision,
  isGameActive,
  gameSpeed,
}) => {
  const gameLoopRef = useRef<NodeJS.Timeout>();
  const obstacleAnimations = useRef<Map<string, Animated.Value>>(new Map());
  const lastCollisionCheck = useRef<number>(0);

  // Get current player position
  const currentPlayerPosition = gameData.playerPositions[currentUserId] || { x: SCREEN_WIDTH / 2, y: GAME_AREA_HEIGHT - 50 };
  const otherPlayerId = Object.keys(gameData.playerPositions).find(id => id !== currentUserId);
  const otherPlayerPosition = otherPlayerId ? gameData.playerPositions[otherPlayerId] : null;

  // Pan responder for player movement
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isGameActive,
      onMoveShouldSetPanResponder: () => isGameActive,
      
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        // Player touched the screen
      },
      
      onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (!isGameActive) return;
        
        const { moveX, moveY } = gestureState;
        
        // Constrain movement within game area
        const constrainedX = Math.max(PLAYER_SIZE / 2, Math.min(SCREEN_WIDTH - PLAYER_SIZE / 2, moveX));
        const constrainedY = Math.max(PLAYER_SIZE / 2, Math.min(GAME_AREA_HEIGHT - PLAYER_SIZE / 2, moveY));
        
        onPlayerMove(currentUserId, { x: constrainedX, y: constrainedY });
      },
      
      onPanResponderRelease: () => {
        // Player released touch
      },
    })
  ).current;

  // Initialize obstacle animations
  useEffect(() => {
    gameData.obstacles.forEach(obstacle => {
      if (!obstacleAnimations.current.has(obstacle.id)) {
        const animatedValue = new Animated.Value(obstacle.y);
        obstacleAnimations.current.set(obstacle.id, animatedValue);
        
        // Start animation for moving obstacles
        if (obstacle.type === 'moving') {
          const animateObstacle = () => {
            Animated.timing(animatedValue, {
              toValue: GAME_AREA_HEIGHT + obstacle.height,
              duration: (GAME_AREA_HEIGHT + obstacle.height - obstacle.y) / obstacle.speed * 1000,
              useNativeDriver: false,
            }).start(() => {
              // Reset position when obstacle goes off screen
              animatedValue.setValue(-obstacle.height);
              if (isGameActive) {
                animateObstacle();
              }
            });
          };
          animateObstacle();
        }
      }
    });
  }, [gameData.obstacles, isGameActive]);

  // Collision detection
  const checkCollisions = useCallback(() => {
    const now = Date.now();
    if (now - lastCollisionCheck.current < 50) return; // Throttle collision checks
    lastCollisionCheck.current = now;

    Object.entries(gameData.playerPositions).forEach(([playerId, playerPos]) => {
      gameData.obstacles.forEach(obstacle => {
        const obstacleY = obstacle.type === 'moving' 
          ? (obstacleAnimations.current.get(obstacle.id)?._value || obstacle.y)
          : obstacle.y;

        // Simple rectangular collision detection
        const playerLeft = playerPos.x - PLAYER_SIZE / 2;
        const playerRight = playerPos.x + PLAYER_SIZE / 2;
        const playerTop = playerPos.y - PLAYER_SIZE / 2;
        const playerBottom = playerPos.y + PLAYER_SIZE / 2;

        const obstacleLeft = obstacle.x;
        const obstacleRight = obstacle.x + obstacle.width;
        const obstacleTop = obstacleY;
        const obstacleBottom = obstacleY + obstacle.height;

        // Check for collision
        if (
          playerRight > obstacleLeft &&
          playerLeft < obstacleRight &&
          playerBottom > obstacleTop &&
          playerTop < obstacleBottom
        ) {
          onCollision(playerId, obstacle.id);
        }
      });
    });
  }, [gameData.playerPositions, gameData.obstacles, onCollision]);

  // Game loop for collision detection
  useEffect(() => {
    if (isGameActive) {
      gameLoopRef.current = setInterval(checkCollisions, 16); // ~60 FPS
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isGameActive, checkCollisions]);

  // Clean up animations when component unmounts
  useEffect(() => {
    return () => {
      obstacleAnimations.current.forEach(animation => {
        animation.stopAnimation();
      });
      obstacleAnimations.current.clear();
    };
  }, []);

  const renderObstacle = (obstacle: Obstacle) => {
    const animatedValue = obstacleAnimations.current.get(obstacle.id);
    
    const obstacleStyle = [
      styles.obstacle,
      {
        left: obstacle.x,
        width: obstacle.width,
        height: obstacle.height,
        backgroundColor: getObstacleColor(obstacle),
      },
      obstacle.type === 'moving' && animatedValue
        ? { top: animatedValue }
        : { top: obstacle.y },
    ];

    return (
      <Animated.View
        key={obstacle.id}
        style={obstacleStyle}
      />
    );
  };

  const renderPlayer = (playerId: string, position: { x: number; y: number }, isCurrentPlayer: boolean) => {
    return (
      <View
        key={playerId}
        style={[
          styles.player,
          {
            left: position.x - PLAYER_SIZE / 2,
            top: position.y - PLAYER_SIZE / 2,
            backgroundColor: isCurrentPlayer ? extendedTheme.colors.primary : extendedTheme.colors.secondary,
          },
        ]}
      />
    );
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Game Area Background */}
      <View style={styles.gameArea}>
        {/* Grid Pattern */}
        <View style={styles.gridPattern} />
        
        {/* Obstacles */}
        {gameData.obstacles.map(renderObstacle)}
        
        {/* Current Player */}
        {renderPlayer(currentUserId, currentPlayerPosition, true)}
        
        {/* Other Player */}
        {otherPlayerPosition && otherPlayerId && 
          renderPlayer(otherPlayerId, otherPlayerPosition, false)
        }
        
        {/* Game Area Border */}
        <View style={styles.gameAreaBorder} />
      </View>
    </View>
  );
};

// Helper function to get obstacle color based on type
const getObstacleColor = (obstacle: Obstacle): string => {
  switch (obstacle.type) {
    case 'static':
      return extendedTheme.colors.error;
    case 'moving':
      return extendedTheme.colors.warning;
    default:
      return extendedTheme.colors.textSecondary;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: extendedTheme.colors.gameBackground,
  },
  gameArea: {
    width: SCREEN_WIDTH,
    height: GAME_AREA_HEIGHT,
    backgroundColor: extendedTheme.colors.background,
    position: 'relative',
    overflow: 'hidden',
  },
  gridPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundColor: 'transparent',
    // Add a subtle grid pattern
    borderWidth: 1,
    borderColor: extendedTheme.colors.border,
  },
  gameAreaBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: extendedTheme.colors.gameAccent,
    borderRadius: extendedTheme.borderRadius.md,
  },
  player: {
    position: 'absolute',
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    borderRadius: PLAYER_SIZE / 2,
    borderWidth: 2,
    borderColor: extendedTheme.colors.background,
    ...extendedTheme.shadows.sm,
  },
  obstacle: {
    position: 'absolute',
    borderRadius: extendedTheme.borderRadius.sm,
    ...extendedTheme.shadows.sm,
  },
});

export default GameWorld;
