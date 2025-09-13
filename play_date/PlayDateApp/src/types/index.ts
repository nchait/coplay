// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  bio?: string;
  photos: string[];
  interests: string[];
  location: {
    latitude: number;
    longitude: number;
    city: string;
  };
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  ageRange: {
    min: number;
    max: number;
  };
  maxDistance: number; // in kilometers
  interests: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Matching Types
export interface Match {
  id: string;
  users: [string, string]; // User IDs
  createdAt: Date;
  status: 'active' | 'expired' | 'blocked';
  lastActivity: Date;
}

export interface MatchCandidate {
  user: User;
  compatibility: number; // 0-100 score
  commonInterests: string[];
  distance: number;
}

// Game Types
export type GameType = 
  | 'PuzzleConnect' 
  | 'GuessAndDraw' 
  | 'SurvivalChallenge'
  | 'CircuitSwap'      // Dual Minds: Circuit Swap
  | 'MirrorMaze'       // Dual Minds: Mirror Maze
  | 'ColorCodeLock'    // Dual Minds: Color Code Lock
  | 'BridgeBuilders'   // Dual Minds: Bridge Builders
  | 'EchoesOfSound';   // Dual Minds: Echoes of Sound

export interface GameSession {
  id: string;
  matchId: string;
  gameType: GameType;
  players: [string, string]; // User IDs
  status: 'waiting' | 'active' | 'completed' | 'abandoned';
  startedAt?: Date;
  completedAt?: Date;
  result?: GameResult;
  gameData: any; // Game-specific data
}

export interface GameResult {
  success: boolean;
  score: number;
  duration: number; // in seconds
  playerStats: {
    [userId: string]: {
      performance: number;
      actions: number;
    };
  };
}

// Game-specific Types
export interface PuzzleConnectData {
  gridSize: number;
  playerAView: number[][];
  playerBView: number[][];
  solution: number[][];
  cluesShared: string[];
}

export interface GuessAndDrawData {
  currentDrawer: string;
  prompt: string;
  drawing: DrawingStroke[];
  guesses: string[];
  correctGuess?: string;
}

export interface DrawingStroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  timestamp: number;
}

export interface SurvivalChallengeData {
  obstacles: Obstacle[];
  playerPositions: {
    [userId: string]: { x: number; y: number };
  };
  gameSpeed: number;
  survivedTime: number;
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: 'static' | 'moving';
}

// Dual Minds Mini-Game Data Types

// Circuit Swap Game Data
export interface CircuitSwapData {
  circuitSchematic: CircuitNode[];
  wireConnections: WireConnection[];
  switchStates: SwitchState[];
  completedSections: string[];
  timeRemaining: number;
  playerARole: 'schematic_viewer';
  playerBRole: 'wire_manipulator';
}

export interface CircuitNode {
  id: string;
  x: number;
  y: number;
  type: 'power_source' | 'switch' | 'output' | 'junction';
  connections: string[];
  isVisibleToPlayerA: boolean;
  isVisibleToPlayerB: boolean;
}

export interface WireConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  isConnected: boolean;
  color: string;
  position: { x: number; y: number };
}

export interface SwitchState {
  id: string;
  isOn: boolean;
  position: { x: number; y: number };
}

// Mirror Maze Game Data
export interface MirrorMazeData {
  mazeLayout: MazeCell[][];
  playerPosition: { x: number; y: number };
  wallPositions: WallPosition[];
  exitPosition: { x: number; y: number };
  hintsRemaining: number;
  timeRemaining: number;
  playerARole: 'map_viewer';
  playerBRole: 'maze_navigator';
}

export interface MazeCell {
  x: number;
  y: number;
  hasWall: boolean;
  isExit: boolean;
  isStart: boolean;
  isVisibleToPlayerA: boolean;
  isVisibleToPlayerB: boolean;
}

export interface WallPosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMoving: boolean;
  moveDirection?: 'horizontal' | 'vertical';
  moveSpeed?: number;
}

// Color Code Lock Game Data
export interface ColorCodeLockData {
  correctSequence: string[];
  currentInput: string[];
  attemptsRemaining: number;
  timeRemaining: number;
  hintLevel: number;
  playerARole: 'sequence_viewer';
  playerBRole: 'button_presser';
}

// Bridge Builders Game Data
export interface BridgeBuildersData {
  bridgePieces: BridgePiece[];
  bridgeState: BridgeState;
  playerPositions: { [userId: string]: { x: number; y: number } };
  stabilityScore: number;
  attemptsLeft: number;
  timeRemaining: number;
  playerARole: 'piece_manipulator';
  playerBRole: 'bridge_tester';
}

export interface BridgePiece {
  id: string;
  type: 'beam' | 'support' | 'platform';
  position: { x: number; y: number };
  rotation: number;
  isPlaced: boolean;
  isStable: boolean;
  canBeMovedByPlayerA: boolean;
  canBeTestedByPlayerB: boolean;
}

export interface BridgeState {
  isComplete: boolean;
  isStable: boolean;
  completionPercentage: number;
  weakPoints: string[];
}

// Echoes of Sound Game Data
export interface EchoesOfSoundData {
  melodySequence: Note[];
  currentInput: Note[];
  timeRemaining: number;
  accuracyScore: number;
  hintLevel: number;
  playerARole: 'melody_listener';
  playerBRole: 'note_player';
}

export interface Note {
  id: string;
  pitch: string; // C, D, E, F, G, A, B
  octave: number;
  duration: number; // in milliseconds
  isPlayed: boolean;
  isCorrect: boolean;
}

// Chat Types
export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  type: 'text' | 'game_invite' | 'game_result' | 'system';
  timestamp: Date;
  read: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Profile: { userId?: string };
  Matching: undefined;
  GameLobby: { matchId: string; gameType: GameType };
  GamePlay: { sessionId: string };
  Chat: { matchId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Discover: undefined;
  Matches: undefined;
  Games: undefined;
  Profile: undefined;
};

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// WebSocket Types
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: Date;
}

export interface GameUpdateMessage extends WebSocketMessage {
  type: 'game_update';
  payload: {
    sessionId: string;
    gameData: any;
    playerAction?: any;
  };
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Theme Types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: TextStyle;
    h2: TextStyle;
    h3: TextStyle;
    body: TextStyle;
    caption: TextStyle;
  };
}

// Re-export React Native types we commonly use
export type { TextStyle, ViewStyle, ImageStyle } from 'react-native';
