import { PuzzleConnectData } from '../../types';

export interface PuzzleConfig {
  gridSize: number;
  difficulty: 'easy' | 'medium' | 'hard';
  patternType: 'sequence' | 'sudoku' | 'pattern' | 'math';
}

export interface CellInfo {
  value: number;
  isVisible: boolean;
  isCorrect: boolean;
  confidence: number; // 0-1, how sure we are about this cell
}

export class PuzzleGenerator {
  static generatePuzzle(config: PuzzleConfig): PuzzleConnectData {
    const { gridSize, difficulty, patternType } = config;
    
    let solution: number[][];
    
    switch (patternType) {
      case 'sequence':
        solution = this.generateSequencePuzzle(gridSize);
        break;
      case 'sudoku':
        solution = this.generateSudokuLikePuzzle(gridSize);
        break;
      case 'pattern':
        solution = this.generatePatternPuzzle(gridSize);
        break;
      case 'math':
        solution = this.generateMathPuzzle(gridSize);
        break;
      default:
        solution = this.generateSequencePuzzle(gridSize);
    }

    const { playerAView, playerBView } = this.createAsymmetricViews(
      solution, 
      difficulty
    );

    return {
      gridSize,
      playerAView,
      playerBView,
      solution,
      cluesShared: [],
    };
  }

  private static generateSequencePuzzle(size: number): number[][] {
    const grid: number[][] = [];
    
    for (let i = 0; i < size; i++) {
      grid[i] = [];
      for (let j = 0; j < size; j++) {
        // Create a sequence pattern: each row increases by 1, wrapping around
        grid[i][j] = ((i * size + j) % (size * size)) + 1;
      }
    }
    
    return grid;
  }

  private static generateSudokuLikePuzzle(size: number): number[][] {
    const grid: number[][] = [];
    
    // For 4x4 grid, use numbers 1-4 with no repeats in rows/columns
    for (let i = 0; i < size; i++) {
      grid[i] = [];
      for (let j = 0; j < size; j++) {
        // Latin square pattern
        grid[i][j] = ((i + j) % size) + 1;
      }
    }
    
    return grid;
  }

  private static generatePatternPuzzle(size: number): number[][] {
    const grid: number[][] = [];
    
    for (let i = 0; i < size; i++) {
      grid[i] = [];
      for (let j = 0; j < size; j++) {
        // Checkerboard-like pattern with mathematical relationship
        if ((i + j) % 2 === 0) {
          grid[i][j] = (i + 1);
        } else {
          grid[i][j] = (j + 1);
        }
      }
    }
    
    return grid;
  }

  private static generateMathPuzzle(size: number): number[][] {
    const grid: number[][] = [];
    
    for (let i = 0; i < size; i++) {
      grid[i] = [];
      for (let j = 0; j < size; j++) {
        // Mathematical relationship: sum of coordinates + 1
        grid[i][j] = ((i + j) % size) + 1;
      }
    }
    
    return grid;
  }

  private static createAsymmetricViews(
    solution: number[][], 
    difficulty: 'easy' | 'medium' | 'hard'
  ): { playerAView: number[][]; playerBView: number[][] } {
    const size = solution.length;
    const playerAView: number[][] = [];
    const playerBView: number[][] = [];

    // Determine visibility percentage based on difficulty
    const visibilityMap = {
      easy: 0.6,   // 60% of cells visible to each player
      medium: 0.4, // 40% of cells visible to each player
      hard: 0.3,   // 30% of cells visible to each player
    };

    const visibilityRate = visibilityMap[difficulty];

    for (let i = 0; i < size; i++) {
      playerAView[i] = [];
      playerBView[i] = [];
      
      for (let j = 0; j < size; j++) {
        // Create complementary visibility patterns
        const cellIndex = i * size + j;
        const isPlayerAVisible = this.shouldCellBeVisible(i, j, 'A', visibilityRate);
        const isPlayerBVisible = this.shouldCellBeVisible(i, j, 'B', visibilityRate);

        // Ensure some overlap but mostly complementary information
        playerAView[i][j] = isPlayerAVisible ? solution[i][j] : 0;
        playerBView[i][j] = isPlayerBVisible ? solution[i][j] : 0;
      }
    }

    return { playerAView, playerBView };
  }

  private static shouldCellBeVisible(
    row: number, 
    col: number, 
    player: 'A' | 'B', 
    visibilityRate: number
  ): boolean {
    // Create deterministic but seemingly random visibility pattern
    const seed = row * 7 + col * 11 + (player === 'A' ? 0 : 13);
    const pseudoRandom = (seed * 9301 + 49297) % 233280;
    const normalizedRandom = pseudoRandom / 233280;
    
    return normalizedRandom < visibilityRate;
  }
}

export class PuzzleValidator {
  static validateMove(
    currentGrid: number[][],
    solution: number[][],
    row: number,
    col: number,
    value: number
  ): { isValid: boolean; isCorrect: boolean } {
    const isCorrect = solution[row][col] === value;
    const maxValue = solution.length * solution.length; // For 4x4 grid: 16
    const isValid = value >= 1 && value <= maxValue;

    return { isValid, isCorrect };
  }

  static isPuzzleComplete(
    playerAView: number[][],
    playerBView: number[][],
    solution: number[][]
  ): boolean {
    const size = solution.length;
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const correctValue = solution[i][j];
        const playerAValue = playerAView[i][j];
        const playerBValue = playerBView[i][j];
        
        // At least one player must have the correct value
        if (playerAValue !== correctValue && playerBValue !== correctValue) {
          return false;
        }
      }
    }
    
    return true;
  }

  static calculateCompletionPercentage(
    playerAView: number[][],
    playerBView: number[][],
    solution: number[][]
  ): number {
    const size = solution.length;
    let correctCells = 0;
    let totalCells = size * size;
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const correctValue = solution[i][j];
        const playerAValue = playerAView[i][j];
        const playerBValue = playerBView[i][j];
        
        if (playerAValue === correctValue || playerBValue === correctValue) {
          correctCells++;
        }
      }
    }
    
    return (correctCells / totalCells) * 100;
  }

  static getHint(
    playerAView: number[][],
    playerBView: number[][],
    solution: number[][],
    playerRole: 'A' | 'B'
  ): string | null {
    const size = solution.length;
    const currentView = playerRole === 'A' ? playerAView : playerBView;
    const otherView = playerRole === 'A' ? playerBView : playerAView;
    
    // Find a cell where the other player has information but current player doesn't
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (currentView[i][j] === 0 && otherView[i][j] !== 0) {
          return `Your partner can see the value at row ${i + 1}, column ${j + 1}`;
        }
      }
    }
    
    // Find a pattern hint
    const patterns = this.detectPatterns(solution);
    if (patterns.length > 0) {
      return patterns[Math.floor(Math.random() * patterns.length)];
    }
    
    return null;
  }

  private static detectPatterns(solution: number[][]): string[] {
    const patterns: string[] = [];
    const size = solution.length;
    
    // Check for row patterns
    for (let i = 0; i < size; i++) {
      if (this.isSequence(solution[i])) {
        patterns.push(`Row ${i + 1} follows a sequence pattern`);
      }
    }
    
    // Check for column patterns
    for (let j = 0; j < size; j++) {
      const column = solution.map(row => row[j]);
      if (this.isSequence(column)) {
        patterns.push(`Column ${j + 1} follows a sequence pattern`);
      }
    }
    
    return patterns;
  }

  private static isSequence(arr: number[]): boolean {
    if (arr.length < 2) return false;
    
    const diff = arr[1] - arr[0];
    for (let i = 2; i < arr.length; i++) {
      if (arr[i] - arr[i - 1] !== diff) {
        return false;
      }
    }
    
    return true;
  }
}

export class PuzzleScorer {
  static calculateScore(
    timeRemaining: number,
    totalTime: number,
    hintsUsed: number,
    completionPercentage: number
  ): number {
    const timeBonus = (timeRemaining / totalTime) * 500;
    const completionBonus = (completionPercentage / 100) * 300;
    const hintPenalty = hintsUsed * 50;
    
    return Math.max(0, Math.round(timeBonus + completionBonus - hintPenalty));
  }

  static getPerformanceRating(score: number): string {
    if (score >= 700) return 'Excellent';
    if (score >= 500) return 'Great';
    if (score >= 300) return 'Good';
    if (score >= 100) return 'Fair';
    return 'Keep Trying';
  }
}
