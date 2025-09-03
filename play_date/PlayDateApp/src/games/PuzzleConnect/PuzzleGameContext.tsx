import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { PuzzleConnectData, GameSession } from '../../types';
import { PuzzleGenerator, PuzzleValidator, PuzzleScorer } from './PuzzleLogic';

// Game State Types
interface PuzzleGameState {
  gameData: PuzzleConnectData;
  timeRemaining: number;
  isGameActive: boolean;
  selectedCell: { row: number; col: number } | null;
  hintsUsed: number;
  score: number;
  completionPercentage: number;
  isLoading: boolean;
  error: string | null;
}

// Game Actions
type PuzzleGameAction =
  | { type: 'INITIALIZE_GAME'; payload: { gameData: PuzzleConnectData; duration: number } }
  | { type: 'UPDATE_GAME_DATA'; payload: PuzzleConnectData }
  | { type: 'SELECT_CELL'; payload: { row: number; col: number } | null }
  | { type: 'PLACE_NUMBER'; payload: { row: number; col: number; number: number; isPlayerA: boolean } }
  | { type: 'ADD_CLUE'; payload: string }
  | { type: 'USE_HINT' }
  | { type: 'TICK_TIMER' }
  | { type: 'END_GAME'; payload: { success: boolean; finalScore: number } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Context Type
interface PuzzleGameContextType {
  state: PuzzleGameState;
  actions: {
    initializeGame: (gameSession: GameSession, duration: number) => void;
    selectCell: (row: number, col: number) => void;
    placeNumber: (number: number, isPlayerA: boolean) => void;
    shareClue: (clue: string) => void;
    useHint: () => string | null;
    endGame: (success: boolean) => void;
    clearError: () => void;
  };
}

// Initial State
const initialState: PuzzleGameState = {
  gameData: {
    gridSize: 4,
    playerAView: [],
    playerBView: [],
    solution: [],
    cluesShared: [],
  },
  timeRemaining: 180,
  isGameActive: false,
  selectedCell: null,
  hintsUsed: 0,
  score: 0,
  completionPercentage: 0,
  isLoading: false,
  error: null,
};

// Reducer
const puzzleGameReducer = (state: PuzzleGameState, action: PuzzleGameAction): PuzzleGameState => {
  switch (action.type) {
    case 'INITIALIZE_GAME':
      return {
        ...state,
        gameData: action.payload.gameData,
        timeRemaining: action.payload.duration,
        isGameActive: true,
        selectedCell: null,
        hintsUsed: 0,
        score: 0,
        completionPercentage: 0,
        isLoading: false,
        error: null,
      };

    case 'UPDATE_GAME_DATA':
      const newCompletionPercentage = PuzzleValidator.calculateCompletionPercentage(
        action.payload.playerAView,
        action.payload.playerBView,
        action.payload.solution
      );
      
      return {
        ...state,
        gameData: action.payload,
        completionPercentage: newCompletionPercentage,
      };

    case 'SELECT_CELL':
      return {
        ...state,
        selectedCell: action.payload,
      };

    case 'PLACE_NUMBER':
      const { row, col, number, isPlayerA } = action.payload;
      const newGameData = { ...state.gameData };
      
      if (isPlayerA) {
        newGameData.playerAView = [...state.gameData.playerAView];
        newGameData.playerAView[row] = [...newGameData.playerAView[row]];
        newGameData.playerAView[row][col] = number;
      } else {
        newGameData.playerBView = [...state.gameData.playerBView];
        newGameData.playerBView[row] = [...newGameData.playerBView[row]];
        newGameData.playerBView[row][col] = number;
      }

      const updatedCompletionPercentage = PuzzleValidator.calculateCompletionPercentage(
        newGameData.playerAView,
        newGameData.playerBView,
        newGameData.solution
      );

      return {
        ...state,
        gameData: newGameData,
        selectedCell: null,
        completionPercentage: updatedCompletionPercentage,
      };

    case 'ADD_CLUE':
      return {
        ...state,
        gameData: {
          ...state.gameData,
          cluesShared: [...state.gameData.cluesShared, action.payload],
        },
      };

    case 'USE_HINT':
      return {
        ...state,
        hintsUsed: state.hintsUsed + 1,
      };

    case 'TICK_TIMER':
      const newTimeRemaining = Math.max(0, state.timeRemaining - 1);
      return {
        ...state,
        timeRemaining: newTimeRemaining,
        isGameActive: newTimeRemaining > 0 && state.isGameActive,
      };

    case 'END_GAME':
      return {
        ...state,
        isGameActive: false,
        score: action.payload.finalScore,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Context
const PuzzleGameContext = createContext<PuzzleGameContextType | undefined>(undefined);

// Provider Component
interface PuzzleGameProviderProps {
  children: ReactNode;
  onGameUpdate?: (gameData: PuzzleConnectData) => void;
  onGameComplete?: (success: boolean, score: number) => void;
}

export const PuzzleGameProvider: React.FC<PuzzleGameProviderProps> = ({
  children,
  onGameUpdate,
  onGameComplete,
}) => {
  const [state, dispatch] = useReducer(puzzleGameReducer, initialState);

  // Timer effect
  useEffect(() => {
    if (!state.isGameActive || state.timeRemaining <= 0) return;

    const timer = setInterval(() => {
      dispatch({ type: 'TICK_TIMER' });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isGameActive, state.timeRemaining]);

  // Check for game completion
  useEffect(() => {
    if (state.isGameActive && state.gameData.solution.length > 0) {
      const isComplete = PuzzleValidator.isPuzzleComplete(
        state.gameData.playerAView,
        state.gameData.playerBView,
        state.gameData.solution
      );

      if (isComplete) {
        const finalScore = PuzzleScorer.calculateScore(
          state.timeRemaining,
          180, // total time
          state.hintsUsed,
          state.completionPercentage
        );
        
        dispatch({ type: 'END_GAME', payload: { success: true, finalScore } });
        onGameComplete?.(true, finalScore);
      }
    }
  }, [state.gameData, state.isGameActive, state.timeRemaining, state.hintsUsed, state.completionPercentage, onGameComplete]);

  // Time up effect
  useEffect(() => {
    if (state.timeRemaining === 0 && state.isGameActive) {
      dispatch({ type: 'END_GAME', payload: { success: false, finalScore: 0 } });
      onGameComplete?.(false, 0);
    }
  }, [state.timeRemaining, state.isGameActive, onGameComplete]);

  // Game data update effect
  useEffect(() => {
    if (onGameUpdate) {
      onGameUpdate(state.gameData);
    }
  }, [state.gameData, onGameUpdate]);

  const actions = {
    initializeGame: (gameSession: GameSession, duration: number) => {
      const gameData = gameSession.gameData || PuzzleGenerator.generatePuzzle({
        gridSize: 4,
        difficulty: 'medium',
        patternType: 'sequence',
      });
      
      dispatch({ 
        type: 'INITIALIZE_GAME', 
        payload: { gameData, duration } 
      });
    },

    selectCell: (row: number, col: number) => {
      dispatch({ 
        type: 'SELECT_CELL', 
        payload: { row, col } 
      });
    },

    placeNumber: (number: number, isPlayerA: boolean) => {
      if (!state.selectedCell) return;
      
      const { row, col } = state.selectedCell;
      const validation = PuzzleValidator.validateMove(
        isPlayerA ? state.gameData.playerAView : state.gameData.playerBView,
        state.gameData.solution,
        row,
        col,
        number
      );

      if (validation.isValid) {
        dispatch({
          type: 'PLACE_NUMBER',
          payload: { row, col, number, isPlayerA }
        });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Invalid move. Please try again.' });
      }
    },

    shareClue: (clue: string) => {
      dispatch({ type: 'ADD_CLUE', payload: clue });
    },

    useHint: (): string | null => {
      const hint = PuzzleValidator.getHint(
        state.gameData.playerAView,
        state.gameData.playerBView,
        state.gameData.solution,
        'A' // This should be determined by the current player
      );

      if (hint) {
        dispatch({ type: 'USE_HINT' });
      }

      return hint;
    },

    endGame: (success: boolean) => {
      const finalScore = success ? PuzzleScorer.calculateScore(
        state.timeRemaining,
        180,
        state.hintsUsed,
        state.completionPercentage
      ) : 0;

      dispatch({ type: 'END_GAME', payload: { success, finalScore } });
    },

    clearError: () => {
      dispatch({ type: 'CLEAR_ERROR' });
    },
  };

  const value: PuzzleGameContextType = {
    state,
    actions,
  };

  return (
    <PuzzleGameContext.Provider value={value}>
      {children}
    </PuzzleGameContext.Provider>
  );
};

// Custom Hook
export const usePuzzleGame = (): PuzzleGameContextType => {
  const context = useContext(PuzzleGameContext);
  if (context === undefined) {
    throw new Error('usePuzzleGame must be used within a PuzzleGameProvider');
  }
  return context;
};

export default PuzzleGameContext;
