import { Obstacle } from '../../types';

export interface CollisionResult {
  hasCollision: boolean;
  obstacleId?: string;
  collisionPoint?: { x: number; y: number };
  collisionType?: 'obstacle' | 'powerup';
  powerUpType?: string;
}

export interface PlayerBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number; // For circular collision detection
}

export class CollisionDetection {
  private static readonly COLLISION_MARGIN = 2; // Pixels of margin for more forgiving collision

  /**
   * Check collision between a player and an obstacle
   */
  static checkPlayerObstacleCollision(
    playerPosition: { x: number; y: number },
    playerSize: number,
    obstacle: Obstacle
  ): CollisionResult {
    const playerBounds: PlayerBounds = {
      x: playerPosition.x - playerSize / 2,
      y: playerPosition.y - playerSize / 2,
      width: playerSize,
      height: playerSize,
      radius: playerSize / 2,
    };

    const obstacleBounds = {
      x: obstacle.x,
      y: obstacle.y,
      width: obstacle.width,
      height: obstacle.height,
    };

    // Use circular collision for players (more natural for round avatars)
    const hasCollision = this.checkCircleRectangleCollision(
      playerBounds,
      obstacleBounds
    );

    if (hasCollision) {
      const collisionPoint = this.getCollisionPoint(playerBounds, obstacleBounds);
      
      return {
        hasCollision: true,
        obstacleId: obstacle.id,
        collisionPoint,
        collisionType: obstacle.isPowerUp ? 'powerup' : 'obstacle',
        powerUpType: obstacle.powerUpType,
      };
    }

    return { hasCollision: false };
  }

  /**
   * Check collision between a circle (player) and rectangle (obstacle)
   */
  private static checkCircleRectangleCollision(
    circle: PlayerBounds,
    rectangle: { x: number; y: number; width: number; height: number }
  ): boolean {
    const circleX = circle.x + circle.width / 2;
    const circleY = circle.y + circle.height / 2;
    const radius = circle.radius! - this.COLLISION_MARGIN;

    // Find the closest point on the rectangle to the circle center
    const closestX = Math.max(rectangle.x, Math.min(circleX, rectangle.x + rectangle.width));
    const closestY = Math.max(rectangle.y, Math.min(circleY, rectangle.y + rectangle.height));

    // Calculate distance between circle center and closest point
    const distanceX = circleX - closestX;
    const distanceY = circleY - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;

    return distanceSquared < radius * radius;
  }

  /**
   * Check collision between two rectangles
   */
  private static checkRectangleCollision(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  /**
   * Check collision between two circles
   */
  private static checkCircleCollision(
    circle1: { x: number; y: number; radius: number },
    circle2: { x: number; y: number; radius: number }
  ): boolean {
    const distanceX = circle1.x - circle2.x;
    const distanceY = circle1.y - circle2.y;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
    return distance < circle1.radius + circle2.radius - this.COLLISION_MARGIN;
  }

  /**
   * Get the point of collision between player and obstacle
   */
  private static getCollisionPoint(
    player: PlayerBounds,
    obstacle: { x: number; y: number; width: number; height: number }
  ): { x: number; y: number } {
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    
    const obstacleCenterX = obstacle.x + obstacle.width / 2;
    const obstacleCenterY = obstacle.y + obstacle.height / 2;
    
    // Return the midpoint between centers
    return {
      x: (playerCenterX + obstacleCenterX) / 2,
      y: (playerCenterY + obstacleCenterY) / 2,
    };
  }

  /**
   * Check multiple collisions for a player against all obstacles
   */
  static checkPlayerCollisions(
    playerPosition: { x: number; y: number },
    playerSize: number,
    obstacles: Obstacle[]
  ): CollisionResult[] {
    const collisions: CollisionResult[] = [];

    for (const obstacle of obstacles) {
      const result = this.checkPlayerObstacleCollision(
        playerPosition,
        playerSize,
        obstacle
      );
      
      if (result.hasCollision) {
        collisions.push(result);
      }
    }

    return collisions;
  }

  /**
   * Check if a position is safe (no collisions with obstacles)
   */
  static isPositionSafe(
    position: { x: number; y: number },
    playerSize: number,
    obstacles: Obstacle[]
  ): boolean {
    const collisions = this.checkPlayerCollisions(position, playerSize, obstacles);
    return collisions.length === 0;
  }

  /**
   * Find the nearest safe position to a given position
   */
  static findNearestSafePosition(
    currentPosition: { x: number; y: number },
    playerSize: number,
    obstacles: Obstacle[],
    searchRadius: number = 50
  ): { x: number; y: number } | null {
    const step = 5; // Check positions every 5 pixels
    
    for (let radius = step; radius <= searchRadius; radius += step) {
      // Check positions in a circle around the current position
      const angleStep = Math.PI / 8; // 8 directions
      
      for (let angle = 0; angle < Math.PI * 2; angle += angleStep) {
        const testPosition = {
          x: currentPosition.x + Math.cos(angle) * radius,
          y: currentPosition.y + Math.sin(angle) * radius,
        };
        
        if (this.isPositionSafe(testPosition, playerSize, obstacles)) {
          return testPosition;
        }
      }
    }
    
    return null; // No safe position found
  }

  /**
   * Calculate collision damage based on obstacle type and collision angle
   */
  static calculateCollisionDamage(
    obstacle: Obstacle,
    collisionPoint: { x: number; y: number },
    playerPosition: { x: number; y: number }
  ): number {
    let baseDamage = 1;
    
    // Different obstacle types cause different damage
    switch (obstacle.type) {
      case 'static':
        baseDamage = 1;
        break;
      case 'moving':
        baseDamage = 2;
        break;
      case 'rotating':
        baseDamage = 3;
        break;
      case 'pulsing':
        baseDamage = 2;
        break;
    }
    
    // Speed affects damage
    const speedMultiplier = Math.min(2, obstacle.speed / 3);
    
    return Math.round(baseDamage * speedMultiplier);
  }

  /**
   * Check if two players are close enough to share power-ups or effects
   */
  static arePlayersClose(
    player1Position: { x: number; y: number },
    player2Position: { x: number; y: number },
    threshold: number = 60
  ): boolean {
    const distanceX = player1Position.x - player2Position.x;
    const distanceY = player1Position.y - player2Position.y;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
    return distance <= threshold;
  }

  /**
   * Get collision direction (useful for knockback effects)
   */
  static getCollisionDirection(
    playerPosition: { x: number; y: number },
    obstaclePosition: { x: number; y: number; width: number; height: number }
  ): { x: number; y: number } {
    const playerCenterX = playerPosition.x;
    const playerCenterY = playerPosition.y;
    
    const obstacleCenterX = obstaclePosition.x + obstaclePosition.width / 2;
    const obstacleCenterY = obstaclePosition.y + obstaclePosition.height / 2;
    
    const directionX = playerCenterX - obstacleCenterX;
    const directionY = playerCenterY - obstacleCenterY;
    
    // Normalize the direction vector
    const magnitude = Math.sqrt(directionX * directionX + directionY * directionY);
    
    if (magnitude === 0) {
      return { x: 0, y: -1 }; // Default to upward direction
    }
    
    return {
      x: directionX / magnitude,
      y: directionY / magnitude,
    };
  }
}

export default CollisionDetection;
