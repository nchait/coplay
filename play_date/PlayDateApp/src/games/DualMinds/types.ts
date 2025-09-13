// Dual Minds Mini-Games Types
// Common types and interfaces for all Dual Minds games

import { GameSession } from '../../types';

// Base interface for all Dual Minds games
export interface DualMindsGameProps {
  gameSession: GameSession;
  currentUserId: string;
  onGameUpdate: (gameData: any) => void;
  onGameComplete: (success: boolean, score: number) => void;
}

// Player roles in Dual Minds games
export type PlayerRole = 
  | 'schematic_viewer'    // Circuit Swap
  | 'wire_manipulator'    // Circuit Swap
  | 'map_viewer'          // Mirror Maze
  | 'maze_navigator'      // Mirror Maze
  | 'sequence_viewer'     // Color Code Lock
  | 'button_presser'      // Color Code Lock
  | 'piece_manipulator'   // Bridge Builders
  | 'bridge_tester'       // Bridge Builders
  | 'melody_listener'     // Echoes of Sound
  | 'note_player';        // Echoes of Sound

// Common game state interface
export interface DualMindsGameState {
  isGameActive: boolean;
  timeRemaining: number;
  isPlayerA: boolean;
  playerRole: PlayerRole;
  gameData: any;
  lastAction?: any;
  error?: string;
}

// Game action types
export interface GameAction {
  type: string;
  payload: any;
  timestamp: number;
  playerId: string;
}

// Communication message types
export interface CommunicationMessage {
  id: string;
  type: 'instruction' | 'hint' | 'question' | 'response';
  content: string;
  fromPlayer: string;
  toPlayer: string;
  timestamp: number;
  isRead: boolean;
}

// Game result interface
export interface DualMindsGameResult {
  success: boolean;
  score: number;
  duration: number;
  cooperationScore: number;
  communicationScore: number;
  playerStats: {
    [userId: string]: {
      performance: number;
      actions: number;
      communicationCount: number;
    };
  };
}

// Common game configuration
export interface GameConfig {
  maxTime: number; // in seconds
  maxHints: number;
  difficulty: 'easy' | 'medium' | 'hard';
  allowCommunication: boolean;
  showTimer: boolean;
  showProgress: boolean;
}

// Animation types
export interface GameAnimation {
  type: 'success' | 'failure' | 'hint' | 'progress' | 'communication';
  duration: number;
  data?: any;
}

// UI overlay types
export interface GameOverlay {
  type: 'timer' | 'progress' | 'hints' | 'communication' | 'instructions';
  visible: boolean;
  data?: any;
}
