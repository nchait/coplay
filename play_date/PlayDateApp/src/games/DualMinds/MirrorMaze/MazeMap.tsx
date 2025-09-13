import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { extendedTheme } from '../../../utils/theme';
import { MazeCell, WallPosition } from '../../../types';

interface MazeMapProps {
  mazeLayout: MazeCell[][];
  playerPosition: { x: number; y: number };
  exitPosition: { x: number; y: number };
  wallPositions: WallPosition[];
  onHintRequest: () => void;
}

const MazeMap: React.FC<MazeMapProps> = ({
  mazeLayout,
  playerPosition,
  exitPosition,
  wallPositions,
  onHintRequest,
}) => {
  const { width } = Dimensions.get('window');
  const cellSize = (width - (extendedTheme.spacing.lg * 2)) / 10;

  const renderCell = (cell: MazeCell, row: number, col: number) => {
    const isPlayer = cell.x === playerPosition.x && cell.y === playerPosition.y;
    const isExit = cell.x === exitPosition.x && cell.y === exitPosition.y;
    const isStart = cell.isStart;

    let cellStyle = [styles.cell];
    
    if (isPlayer) {
      cellStyle.push(styles.playerCell);
    } else if (isExit) {
      cellStyle.push(styles.exitCell);
    } else if (isStart) {
      cellStyle.push(styles.startCell);
    } else if (cell.hasWall) {
      cellStyle.push(styles.wallCell);
    } else {
      cellStyle.push(styles.emptyCell);
    }

    return (
      <View
        key={`${cell.x}-${cell.y}`}
        style={[
          cellStyle,
          {
            width: cellSize,
            height: cellSize,
          }
        ]}
      >
        {isPlayer && <Text style={styles.playerIcon}>👤</Text>}
        {isExit && <Text style={styles.exitIcon}>🚪</Text>}
        {isStart && <Text style={styles.startIcon}>🏁</Text>}
      </View>
    );
  };

  const renderWall = (wall: WallPosition) => {
    return (
      <View
        key={wall.id}
        style={[
          styles.wall,
          {
            left: wall.x * cellSize,
            top: wall.y * cellSize,
            width: wall.width * cellSize,
            height: wall.height * cellSize,
            backgroundColor: wall.isMoving ? extendedTheme.colors.warning : extendedTheme.colors.error,
          }
        ]}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Maze Map</Text>
      <Text style={styles.subtitle}>Guide your partner to the exit</Text>
      
      <View style={styles.mapContainer}>
        <View style={[styles.maze, { width: cellSize * 10, height: cellSize * 10 }]}>
          {/* Render maze cells */}
          {mazeLayout.map((row, rowIndex) =>
            row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))
          )}
          
          {/* Render moving walls */}
          {wallPositions.map(renderWall)}
        </View>
      </View>

      {/* Map Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: extendedTheme.colors.primary }]} />
          <Text style={styles.legendText}>Player</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: extendedTheme.colors.success }]} />
          <Text style={styles.legendText}>Exit</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: extendedTheme.colors.error }]} />
          <Text style={styles.legendText}>Wall</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: extendedTheme.colors.warning }]} />
          <Text style={styles.legendText}>Moving Wall</Text>
        </View>
      </View>

      {/* Instructions for Player A */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionTitle}>Your Role:</Text>
        <Text style={styles.instructionText}>
          • You can see the complete maze map
        </Text>
        <Text style={styles.instructionText}>
          • Guide your partner to avoid walls and reach the exit
        </Text>
        <Text style={styles.instructionText}>
          • Watch out for moving walls that change the maze
        </Text>
        <Text style={styles.instructionText}>
          • Use clear directional instructions (left, right, up, down)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    ...extendedTheme.typography.h3,
    color: extendedTheme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: extendedTheme.spacing.xs,
  },
  subtitle: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: extendedTheme.spacing.lg,
  },
  mapContainer: {
    alignItems: 'center',
    marginBottom: extendedTheme.spacing.lg,
  },
  maze: {
    backgroundColor: extendedTheme.colors.background,
    borderRadius: extendedTheme.borderRadius.lg,
    borderWidth: 2,
    borderColor: extendedTheme.colors.borderLight,
    position: 'relative',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    borderWidth: 0.5,
    borderColor: extendedTheme.colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerCell: {
    backgroundColor: extendedTheme.colors.primary,
  },
  exitCell: {
    backgroundColor: extendedTheme.colors.success,
  },
  startCell: {
    backgroundColor: extendedTheme.colors.secondary,
  },
  wallCell: {
    backgroundColor: extendedTheme.colors.error,
  },
  emptyCell: {
    backgroundColor: extendedTheme.colors.background,
  },
  playerIcon: {
    fontSize: 16,
  },
  exitIcon: {
    fontSize: 16,
  },
  startIcon: {
    fontSize: 16,
  },
  wall: {
    position: 'absolute',
    borderRadius: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: extendedTheme.spacing.lg,
    paddingHorizontal: extendedTheme.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: extendedTheme.spacing.xs,
  },
  legendText: {
    ...extendedTheme.typography.caption,
    color: extendedTheme.colors.textSecondary,
  },
  instructionsContainer: {
    backgroundColor: extendedTheme.colors.surface,
    padding: extendedTheme.spacing.md,
    borderRadius: extendedTheme.borderRadius.md,
    ...extendedTheme.shadows.sm,
  },
  instructionTitle: {
    ...extendedTheme.typography.h4,
    color: extendedTheme.colors.text,
    fontWeight: '600',
    marginBottom: extendedTheme.spacing.sm,
  },
  instructionText: {
    ...extendedTheme.typography.bodySmall,
    color: extendedTheme.colors.textSecondary,
    marginBottom: extendedTheme.spacing.xs,
  },
});

export default MazeMap;
