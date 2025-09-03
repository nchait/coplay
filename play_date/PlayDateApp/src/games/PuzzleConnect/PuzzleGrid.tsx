import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { extendedTheme } from '../../utils/theme';

interface PuzzleGridProps {
  grid: number[][];
  solution: number[][];
  selectedCell: { row: number; col: number } | null;
  onCellPress: (row: number, col: number) => void;
  isPlayerA: boolean;
}

const PuzzleGrid: React.FC<PuzzleGridProps> = ({
  grid,
  solution,
  selectedCell,
  onCellPress,
  isPlayerA,
}) => {
  const gridSize = grid.length;
  const { width } = Dimensions.get('window');
  const gridWidth = width - (extendedTheme.spacing.lg * 2);
  const cellSize = (gridWidth - (extendedTheme.spacing.sm * (gridSize - 1))) / gridSize;

  const getCellStyle = (row: number, col: number) => {
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const cellValue = grid[row][col];
    const solutionValue = solution[row][col];
    const isEmpty = cellValue === 0;
    const isCorrect = cellValue === solutionValue && cellValue !== 0;
    const isIncorrect = cellValue !== 0 && cellValue !== solutionValue;

    return [
      styles.cell,
      {
        width: cellSize,
        height: cellSize,
      },
      isEmpty && styles.emptyCell,
      isSelected && styles.selectedCell,
      isCorrect && styles.correctCell,
      isIncorrect && styles.incorrectCell,
      isPlayerA ? styles.playerACell : styles.playerBCell,
    ];
  };

  const getCellTextStyle = (row: number, col: number) => {
    const cellValue = grid[row][col];
    const solutionValue = solution[row][col];
    const isEmpty = cellValue === 0;
    const isCorrect = cellValue === solutionValue && cellValue !== 0;
    const isIncorrect = cellValue !== 0 && cellValue !== solutionValue;

    return [
      styles.cellText,
      isEmpty && styles.emptyCellText,
      isCorrect && styles.correctCellText,
      isIncorrect && styles.incorrectCellText,
    ];
  };

  const renderCell = (row: number, col: number) => {
    const cellValue = grid[row][col];
    const isEmpty = cellValue === 0;

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={getCellStyle(row, col)}
        onPress={() => onCellPress(row, col)}
        activeOpacity={0.7}
      >
        <Text style={getCellTextStyle(row, col)}>
          {isEmpty ? '' : cellValue.toString()}
        </Text>
        
        {/* Show hint dot for cells that should be visible to this player */}
        {isEmpty && shouldShowHint(row, col, isPlayerA) && (
          <View style={styles.hintDot} />
        )}
      </TouchableOpacity>
    );
  };

  const renderRow = (rowIndex: number) => {
    return (
      <View key={rowIndex} style={styles.row}>
        {grid[rowIndex].map((_, colIndex) => renderCell(rowIndex, colIndex))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {grid.map((_, rowIndex) => renderRow(rowIndex))}
      </View>
      
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.correctCell]} />
          <Text style={styles.legendText}>Correct</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.incorrectCell]} />
          <Text style={styles.legendText}>Incorrect</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.emptyCell]} />
          <Text style={styles.legendText}>Empty</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.selectedCell]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
      </View>
    </View>
  );
};

// Helper function to determine if a hint should be shown
function shouldShowHint(row: number, col: number, isPlayerA: boolean): boolean {
  // Show hints for cells that the other player can see
  // This helps players understand what information their partner has
  return isPlayerA 
    ? (row + col) % 3 === 1  // Show where Player B has information
    : (row + col) % 3 === 0; // Show where Player A has information
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  grid: {
    backgroundColor: extendedTheme.colors.surface,
    borderRadius: extendedTheme.borderRadius.lg,
    padding: extendedTheme.spacing.md,
    ...extendedTheme.shadows.md,
  },
  row: {
    flexDirection: 'row',
    marginBottom: extendedTheme.spacing.sm,
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: extendedTheme.borderRadius.sm,
    marginRight: extendedTheme.spacing.sm,
    borderWidth: 2,
    borderColor: extendedTheme.colors.border,
    position: 'relative',
  },
  emptyCell: {
    backgroundColor: extendedTheme.colors.background,
    borderColor: extendedTheme.colors.borderLight,
    borderStyle: 'dashed',
  },
  selectedCell: {
    borderColor: extendedTheme.colors.gameAccent,
    backgroundColor: extendedTheme.colors.gameAccent + '20',
    ...extendedTheme.shadows.sm,
  },
  correctCell: {
    backgroundColor: extendedTheme.colors.success + '20',
    borderColor: extendedTheme.colors.success,
  },
  incorrectCell: {
    backgroundColor: extendedTheme.colors.error + '20',
    borderColor: extendedTheme.colors.error,
  },
  playerACell: {
    // Subtle styling difference for Player A
  },
  playerBCell: {
    // Subtle styling difference for Player B
  },
  cellText: {
    ...extendedTheme.typography.h3,
    fontWeight: '700',
    color: extendedTheme.colors.text,
  },
  emptyCellText: {
    color: 'transparent',
  },
  correctCellText: {
    color: extendedTheme.colors.success,
  },
  incorrectCellText: {
    color: extendedTheme.colors.error,
  },
  hintDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: extendedTheme.colors.secondary,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: extendedTheme.spacing.lg,
    paddingHorizontal: extendedTheme.spacing.md,
    width: '100%',
  },
  legendItem: {
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: extendedTheme.borderRadius.sm,
    marginBottom: extendedTheme.spacing.xs,
    borderWidth: 1,
    borderColor: extendedTheme.colors.border,
  },
  legendText: {
    ...extendedTheme.typography.caption,
    color: extendedTheme.colors.textSecondary,
    fontSize: 10,
  },
});

export default PuzzleGrid;
