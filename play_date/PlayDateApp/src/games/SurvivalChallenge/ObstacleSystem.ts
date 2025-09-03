import { Obstacle } from '../../types';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GAME_AREA_HEIGHT = SCREEN_HEIGHT * 0.6;

export type ObstacleType = 'static' | 'moving' | 'rotating' | 'pulsing';
export type MovementPattern = 'linear' | 'zigzag' | 'circular' | 'random';

export interface ObstacleConfig {
  type: ObstacleType;
  width: number;
  height: number;
  speed: number;
  movementPattern?: MovementPattern;
  color?: string;
  rotationSpeed?: number;
  pulseRate?: number;
}

export class ObstacleSystem {
  private obstacleId = 0;
  private difficultyLevel = 1;
  private gameSpeed = 1;

  /**
   * Generate a random obstacle based on current difficulty
   */
  generateObstacle(): Obstacle {
    const configs = this.getObstacleConfigs();
    const config = configs[Math.floor(Math.random() * configs.length)];
    
    return this.createObstacle(config);
  }

  /**
   * Generate multiple obstacles for a wave
   */
  generateWave(count: number = 3): Obstacle[] {
    const obstacles: Obstacle[] = [];
    
    for (let i = 0; i < count; i++) {
      const obstacle = this.generateObstacle();
      // Spread obstacles across the screen width
      obstacle.x = (SCREEN_WIDTH / (count + 1)) * (i + 1) - obstacle.width / 2;
      // Stagger their vertical positions
      obstacle.y = -obstacle.height - (i * 100);
      obstacles.push(obstacle);
    }
    
    return obstacles;
  }

  /**
   * Create an obstacle from configuration
   */
  private createObstacle(config: ObstacleConfig): Obstacle {
    const obstacle: Obstacle = {
      id: `obstacle_${this.obstacleId++}`,
      type: config.type,
      x: Math.random() * (SCREEN_WIDTH - config.width),
      y: -config.height,
      width: config.width,
      height: config.height,
      speed: config.speed * this.gameSpeed,
      movementPattern: config.movementPattern,
      rotationSpeed: config.rotationSpeed,
      pulseRate: config.pulseRate,
      color: config.color,
    };

    return obstacle;
  }

  /**
   * Get obstacle configurations based on difficulty
   */
  private getObstacleConfigs(): ObstacleConfig[] {
    const baseConfigs: ObstacleConfig[] = [
      // Static obstacles
      {
        type: 'static',
        width: 60,
        height: 20,
        speed: 2,
        color: '#FF6B6B',
      },
      {
        type: 'static',
        width: 40,
        height: 40,
        speed: 3,
        color: '#FF6B6B',
      },
      
      // Moving obstacles
      {
        type: 'moving',
        width: 80,
        height: 15,
        speed: 4,
        movementPattern: 'linear',
        color: '#FFA07A',
      },
      {
        type: 'moving',
        width: 30,
        height: 30,
        speed: 5,
        movementPattern: 'zigzag',
        color: '#FFA07A',
      },
    ];

    // Add more complex obstacles based on difficulty
    if (this.difficultyLevel >= 2) {
      baseConfigs.push(
        {
          type: 'rotating',
          width: 50,
          height: 10,
          speed: 3,
          rotationSpeed: 2,
          color: '#FFD93D',
        },
        {
          type: 'moving',
          width: 100,
          height: 20,
          speed: 2,
          movementPattern: 'circular',
          color: '#FFA07A',
        }
      );
    }

    if (this.difficultyLevel >= 3) {
      baseConfigs.push(
        {
          type: 'pulsing',
          width: 40,
          height: 40,
          speed: 4,
          pulseRate: 1.5,
          color: '#A8E6CF',
        },
        {
          type: 'moving',
          width: 60,
          height: 60,
          speed: 1.5,
          movementPattern: 'random',
          color: '#DDA0DD',
        }
      );
    }

    return baseConfigs;
  }

  /**
   * Update obstacle position based on its movement pattern
   */
  updateObstaclePosition(obstacle: Obstacle, deltaTime: number): Obstacle {
    const updatedObstacle = { ...obstacle };
    
    switch (obstacle.movementPattern) {
      case 'linear':
        updatedObstacle.y += obstacle.speed * deltaTime;
        break;
        
      case 'zigzag':
        updatedObstacle.y += obstacle.speed * deltaTime;
        updatedObstacle.x += Math.sin(updatedObstacle.y * 0.01) * 2;
        // Keep within screen bounds
        updatedObstacle.x = Math.max(0, Math.min(SCREEN_WIDTH - obstacle.width, updatedObstacle.x));
        break;
        
      case 'circular':
        const centerX = SCREEN_WIDTH / 2;
        const radius = 80;
        const angle = (updatedObstacle.y * 0.02) % (Math.PI * 2);
        updatedObstacle.y += obstacle.speed * deltaTime;
        updatedObstacle.x = centerX + Math.cos(angle) * radius - obstacle.width / 2;
        break;
        
      case 'random':
        updatedObstacle.y += obstacle.speed * deltaTime;
        // Add random horizontal movement
        updatedObstacle.x += (Math.random() - 0.5) * 4;
        updatedObstacle.x = Math.max(0, Math.min(SCREEN_WIDTH - obstacle.width, updatedObstacle.x));
        break;
        
      default:
        updatedObstacle.y += obstacle.speed * deltaTime;
    }
    
    return updatedObstacle;
  }

  /**
   * Check if obstacle is off screen and should be removed
   */
  isObstacleOffScreen(obstacle: Obstacle): boolean {
    return obstacle.y > GAME_AREA_HEIGHT + obstacle.height;
  }

  /**
   * Set difficulty level (affects obstacle complexity and speed)
   */
  setDifficulty(level: number): void {
    this.difficultyLevel = Math.max(1, Math.min(5, level));
  }

  /**
   * Set game speed multiplier
   */
  setGameSpeed(speed: number): void {
    this.gameSpeed = Math.max(0.5, Math.min(3, speed));
  }

  /**
   * Get spawn rate based on difficulty (obstacles per second)
   */
  getSpawnRate(): number {
    const baseRate = 0.5; // 0.5 obstacles per second
    return baseRate + (this.difficultyLevel - 1) * 0.2;
  }

  /**
   * Generate power-up obstacles (rare, beneficial)
   */
  generatePowerUp(): Obstacle | null {
    // 5% chance to generate a power-up
    if (Math.random() > 0.05) return null;
    
    const powerUpTypes = ['shield', 'slow_time', 'shrink'];
    const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    
    return {
      id: `powerup_${this.obstacleId++}`,
      type: 'static',
      x: Math.random() * (SCREEN_WIDTH - 40),
      y: -40,
      width: 40,
      height: 40,
      speed: 2 * this.gameSpeed,
      color: '#00FF00',
      isPowerUp: true,
      powerUpType: type,
    };
  }

  /**
   * Create a safe path through obstacles
   */
  createSafePath(obstacles: Obstacle[]): { x: number; width: number } | null {
    const pathWidth = 60; // Minimum safe path width
    const segments = 10;
    const segmentWidth = SCREEN_WIDTH / segments;
    
    // Check each segment for obstacles
    for (let i = 0; i < segments - 1; i++) {
      const segmentStart = i * segmentWidth;
      const segmentEnd = segmentStart + pathWidth;
      
      // Check if this segment is clear of obstacles
      const hasObstacle = obstacles.some(obstacle => 
        obstacle.x < segmentEnd && 
        obstacle.x + obstacle.width > segmentStart &&
        obstacle.y < GAME_AREA_HEIGHT * 0.8 && 
        obstacle.y + obstacle.height > GAME_AREA_HEIGHT * 0.2
      );
      
      if (!hasObstacle) {
        return {
          x: segmentStart,
          width: pathWidth,
        };
      }
    }
    
    return null; // No safe path found
  }

  /**
   * Reset the obstacle system
   */
  reset(): void {
    this.obstacleId = 0;
    this.difficultyLevel = 1;
    this.gameSpeed = 1;
  }
}

// Export singleton instance
export const obstacleSystem = new ObstacleSystem();

export default ObstacleSystem;
