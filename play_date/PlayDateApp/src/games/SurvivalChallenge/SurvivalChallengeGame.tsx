import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { extendedTheme } from '../../utils/theme';
import { GameSession, SurvivalChallengeData } from '../../types';
import GameWorld from './GameWorld';
import SurvivalAnimations from './SurvivalAnimations';
import { obstacleSystem } from './ObstacleSystem';

interface SurvivalChallengeGameProps {
  gameSession: GameSession;
  currentUserId: string;
  onGameUpdate: (gameData: SurvivalChallengeData) => void;
  onGameComplete: (success: boolean, score: number) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GAME_AREA_HEIGHT = SCREEN_HEIGHT * 0.6;

const SurvivalChallengeGame: React.FC<SurvivalChallengeGameProps> = ({
  gameSession,
  currentUserId,
  onGameUpdate,
  onGameComplete,
}) => {
  const [gameData, setGameData] = useState<SurvivalChallengeData>(
    gameSession.gameData || generateInitialGameData(gameSession.players)
  );
  const [isGameActive, setIsGameActive] = useState(true);
  const [survivalTime, setSurvivalTime] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  
  // Animation states
  const [showCollision, setShowCollision] = useState(false);
  const [showPowerUp, setShowPowerUp] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [collisionPosition, setCollisionPosition] = useState<{ x: number; y: number } | undefined>();
  const [powerUpPosition, setPowerUpPosition] = useState<{ x: number; y: number } | undefined>();
  const [milestoneText, setMilestoneText] = useState<string>('');

  const obstacleSpawnRef = useRef<NodeJS.Timeout>();
  const lastObstacleSpawn = useRef<number>(0);

  // Game timer
  useEffect(() => {
    if (!isGameActive) return;

    const timer = setInterval(() => {
      setSurvivalTime(prev => {
        const newTime = prev + 1;
        
        // Check for milestones
        if (newTime % 30 === 0) { // Every 30 seconds
          setMilestoneText(`${newTime} seconds survived!`);
          setShowMilestone(true);
          setTimeout(() => setShowMilestone(false), 2500);
        }
        
        // Increase difficulty over time
        const newDifficulty = Math.floor(newTime / 60) + 1; // Every minute
        if (newDifficulty !== difficultyLevel) {
          setDifficultyLevel(newDifficulty);
          obstacleSystem.setDifficulty(newDifficulty);
          setGameSpeed(1 + (newDifficulty - 1) * 0.2);
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive, difficultyLevel]);

  // Obstacle spawning
  useEffect(() => {
    if (!isGameActive) return;

    const spawnObstacles = () => {
      const now = Date.now();
      const spawnRate = obstacleSystem.getSpawnRate();
      const spawnInterval = 1000 / spawnRate;
      
      if (now - lastObstacleSpawn.current >= spawnInterval) {
        const newObstacle = obstacleSystem.generateObstacle();
        const powerUp = obstacleSystem.generatePowerUp();
        
        const newObstacles = [...gameData.obstacles, newObstacle];
        if (powerUp) {
          newObstacles.push(powerUp);
        }
        
        // Remove off-screen obstacles
        const activeObstacles = newObstacles.filter(
          obstacle => !obstacleSystem.isObstacleOffScreen(obstacle)
        );
        
        const newGameData = {
          ...gameData,
          obstacles: activeObstacles,
        };
        
        setGameData(newGameData);
        onGameUpdate(newGameData);
        lastObstacleSpawn.current = now;
      }
    };

    obstacleSpawnRef.current = setInterval(spawnObstacles, 100);

    return () => {
      if (obstacleSpawnRef.current) {
        clearInterval(obstacleSpawnRef.current);
      }
    };
  }, [isGameActive, gameData, onGameUpdate]);

  const handlePlayerMove = useCallback((userId: string, position: { x: number; y: number }) => {
    const newGameData = {
      ...gameData,
      playerPositions: {
        ...gameData.playerPositions,
        [userId]: position,
      },
    };
    
    setGameData(newGameData);
    onGameUpdate(newGameData);
  }, [gameData, onGameUpdate]);

  const handleCollision = useCallback((userId: string, obstacleId: string) => {
    const obstacle = gameData.obstacles.find(obs => obs.id === obstacleId);
    if (!obstacle) return;

    const playerPosition = gameData.playerPositions[userId];
    if (!playerPosition) return;

    if (obstacle.isPowerUp) {
      setPowerUpPosition(playerPosition);
      setShowPowerUp(true);
      setTimeout(() => setShowPowerUp(false), 2000);
      
      const newGameData = {
        ...gameData,
        obstacles: gameData.obstacles.filter(obs => obs.id !== obstacleId),
      };
      setGameData(newGameData);
      onGameUpdate(newGameData);
    } else {
      setCollisionPosition(playerPosition);
      setShowCollision(true);
      setTimeout(() => setShowCollision(false), 500);
      
      setIsGameActive(false);
      setShowGameOver(true);
      
      const score = calculateScore(survivalTime, difficultyLevel);
      onGameComplete(false, score);
    }
  }, [gameData, survivalTime, difficultyLevel, onGameUpdate, onGameComplete]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = () => {
    switch (difficultyLevel) {
      case 1: return extendedTheme.colors.success;
      case 2: return extendedTheme.colors.warning;
      case 3: return extendedTheme.colors.error;
      default: return extendedTheme.colors.gameAccent;
    }
  };

  const getDifficultyText = () => {
    switch (difficultyLevel) {
      case 1: return 'Easy';
      case 2: return 'Medium';
      case 3: return 'Hard';
      case 4: return 'Expert';
      default: return 'Insane';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Survival Challenge</Text>
          <Text style={styles.subtitle}>Both players must survive!</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.timeContainer}>
            <Text style={styles.timeLabel}>Time</Text>
            <Text style={styles.timeValue}>{formatTime(survivalTime)}</Text>
          </View>
          <View style={[styles.difficultyContainer, { backgroundColor: getDifficultyColor() + '20' }]}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor() }]}>
              {getDifficultyText()}
            </Text>
          </View>
        </View>
      </View>

      {/* Game World */}
      <View style={styles.gameContainer}>
        <GameWorld
          gameData={gameData}
          currentUserId={currentUserId}
          onPlayerMove={handlePlayerMove}
          onCollision={handleCollision}
          isGameActive={isGameActive}
          gameSpeed={gameSpeed}
        />
      </View>

      {/* Game Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Obstacles</Text>
          <Text style={styles.statValue}>{gameData.obstacles.length}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Speed</Text>
          <Text style={styles.statValue}>{gameSpeed.toFixed(1)}x</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Players</Text>
          <Text style={styles.statValue}>{Object.keys(gameData.playerPositions).length}</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Touch and drag to move your avatar. Avoid obstacles and collect power-ups!
        </Text>
      </View>

      {/* Animations */}
      <SurvivalAnimations
        showCollision={showCollision}
        showPowerUp={showPowerUp}
        showMilestone={showMilestone}
        showGameOver={showGameOver}
        collisionPosition={collisionPosition}
        powerUpPosition={powerUpPosition}
        milestoneText={milestoneText}
        survivalTime={survivalTime}
        onAnimationComplete={() => setShowGameOver(false)}
      />
    </SafeAreaView>
  );
};

// Helper functions
function generateInitialGameData(players: string[]): SurvivalChallengeData {
  const playerPositions: Record<string, { x: number; y: number }> = {};
  
  players.forEach((playerId, index) => {
    playerPositions[playerId] = {
      x: SCREEN_WIDTH / (players.length + 1) * (index + 1),
      y: GAME_AREA_HEIGHT - 50,
    };
  });

  return {
    playerPositions,
    obstacles: [],
    powerUps: [],
    gameSpeed: 1,
    difficultyLevel: 1,
  };
}

function calculateScore(survivalTime: number, difficultyLevel: number): number {
  const baseScore = survivalTime * 10;
  const difficultyBonus = difficultyLevel * 50;
  return baseScore + difficultyBonus;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: extendedTheme.colors.gameBackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.md,
    backgroundColor: extendedTheme.colors.surface,
    ...extendedTheme.shadows.sm,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    ...extendedTheme.typography.h2,
    color: extendedTheme.colors.gameAccent,
    fontWeight: '700',
  },
  subtitle: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
    marginTop: extendedTheme.spacing.xs,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: extendedTheme.spacing.xs,
  },
  timeLabel: {
    ...extendedTheme.typography.caption,
    color: extendedTheme.colors.textSecondary,
  },
  timeValue: {
    ...extendedTheme.typography.h3,
    color: extendedTheme.colors.primary,
    fontWeight: '600',
  },
  difficultyContainer: {
    paddingHorizontal: extendedTheme.spacing.sm,
    paddingVertical: extendedTheme.spacing.xs,
    borderRadius: extendedTheme.borderRadius.sm,
  },
  difficultyText: {
    ...extendedTheme.typography.bodySmall,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  gameContainer: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.md,
    backgroundColor: extendedTheme.colors.surface,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    ...extendedTheme.typography.caption,
    color: extendedTheme.colors.textSecondary,
    marginBottom: extendedTheme.spacing.xs,
  },
  statValue: {
    ...extendedTheme.typography.h4,
    color: extendedTheme.colors.text,
    fontWeight: '600',
  },
  instructionsContainer: {
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.sm,
    backgroundColor: extendedTheme.colors.background,
  },
  instructionsText: {
    ...extendedTheme.typography.bodySmall,
    color: extendedTheme.colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default SurvivalChallengeGame;
