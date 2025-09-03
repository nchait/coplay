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
export type GameType = 'PuzzleConnect' | 'GuessAndDraw' | 'SurvivalChallenge';

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
