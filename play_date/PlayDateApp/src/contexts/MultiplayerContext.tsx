import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { webSocketService, WebSocketMessage, ConnectionState } from '../services/websocket';
import { GameSession, GameType } from '../types';

// Multiplayer State Types
export interface MultiplayerState {
  connectionState: ConnectionState;
  currentSession: GameSession | null;
  players: PlayerInfo[];
  isHost: boolean;
  isReady: boolean;
  gameData: any;
  messages: CommunicationMessage[];
  error: string | null;
}

export interface PlayerInfo {
  id: string;
  name: string;
  isReady: boolean;
  isConnected: boolean;
  lastSeen: number;
}

export interface CommunicationMessage {
  id: string;
  message: string;
  fromPlayer: string;
  toPlayer?: string;
  messageType: 'instruction' | 'hint' | 'question' | 'response';
  timestamp: number;
  isRead: boolean;
}

// Multiplayer Actions
type MultiplayerAction =
  | { type: 'CONNECTION_STATE_CHANGED'; payload: ConnectionState }
  | { type: 'SESSION_CREATED'; payload: GameSession }
  | { type: 'SESSION_JOINED'; payload: GameSession }
  | { type: 'SESSION_LEFT' }
  | { type: 'PLAYER_JOINED'; payload: PlayerInfo }
  | { type: 'PLAYER_LEFT'; payload: string }
  | { type: 'PLAYER_READY_CHANGED'; payload: { playerId: string; isReady: boolean } }
  | { type: 'GAME_DATA_UPDATED'; payload: any }
  | { type: 'MESSAGE_RECEIVED'; payload: CommunicationMessage }
  | { type: 'MESSAGE_SENT'; payload: CommunicationMessage }
  | { type: 'ERROR_OCCURRED'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_READY'; payload: boolean };

// Multiplayer Context Type
interface MultiplayerContextType {
  state: MultiplayerState;
  connect: (playerId: string, sessionId?: string) => Promise<void>;
  disconnect: () => void;
  createSession: (gameType: GameType, playerId: string) => Promise<GameSession>;
  joinSession: (sessionId: string, playerId: string) => Promise<void>;
  leaveSession: () => void;
  setReady: (isReady: boolean) => void;
  sendGameUpdate: (gameData: any, playerAction?: any) => void;
  sendMessage: (message: string, messageType: 'instruction' | 'hint' | 'question' | 'response', toPlayer?: string) => void;
  markMessageAsRead: (messageId: string) => void;
  clearError: () => void;
}

// Initial State
const initialState: MultiplayerState = {
  connectionState: 'disconnected',
  currentSession: null,
  players: [],
  isHost: false,
  isReady: false,
  gameData: null,
  messages: [],
  error: null,
};

// Multiplayer Reducer
const multiplayerReducer = (state: MultiplayerState, action: MultiplayerAction): MultiplayerState => {
  switch (action.type) {
    case 'CONNECTION_STATE_CHANGED':
      return {
        ...state,
        connectionState: action.payload,
        error: action.payload === 'error' ? 'Connection failed' : null,
      };

    case 'SESSION_CREATED':
      return {
        ...state,
        currentSession: action.payload,
        isHost: true,
        players: [{
          id: action.payload.players[0],
          name: 'You',
          isReady: false,
          isConnected: true,
          lastSeen: Date.now(),
        }],
      };

    case 'SESSION_JOINED':
      return {
        ...state,
        currentSession: action.payload,
        isHost: false,
        players: action.payload.players.map(playerId => ({
          id: playerId,
          name: playerId === action.payload.players[0] ? 'You' : 'Player',
          isReady: false,
          isConnected: true,
          lastSeen: Date.now(),
        })),
      };

    case 'SESSION_LEFT':
      return {
        ...state,
        currentSession: null,
        isHost: false,
        players: [],
        isReady: false,
        gameData: null,
        messages: [],
      };

    case 'PLAYER_JOINED':
      return {
        ...state,
        players: [...state.players, action.payload],
      };

    case 'PLAYER_LEFT':
      return {
        ...state,
        players: state.players.filter(player => player.id !== action.payload),
      };

    case 'PLAYER_READY_CHANGED':
      return {
        ...state,
        players: state.players.map(player =>
          player.id === action.payload.playerId
            ? { ...player, isReady: action.payload.isReady }
            : player
        ),
      };

    case 'GAME_DATA_UPDATED':
      return {
        ...state,
        gameData: action.payload,
      };

    case 'MESSAGE_RECEIVED':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };

    case 'MESSAGE_SENT':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };

    case 'ERROR_OCCURRED':
      return {
        ...state,
        error: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'SET_READY':
      return {
        ...state,
        isReady: action.payload,
      };

    default:
      return state;
  }
};

// Create Context
const MultiplayerContext = createContext<MultiplayerContextType | undefined>(undefined);

// Multiplayer Provider Props
interface MultiplayerProviderProps {
  children: ReactNode;
}

// Multiplayer Provider Component
export const MultiplayerProvider: React.FC<MultiplayerProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(multiplayerReducer, initialState);

  // Set up WebSocket event handlers
  useEffect(() => {
    webSocketService.onConnectionChange = (connectionState) => {
      dispatch({ type: 'CONNECTION_STATE_CHANGED', payload: connectionState });
    };

    webSocketService.onMessage = (message: WebSocketMessage) => {
      handleWebSocketMessage(message);
    };

    webSocketService.onError = (error: Error) => {
      dispatch({ type: 'ERROR_OCCURRED', payload: error.message });
    };

    return () => {
      webSocketService.disconnect();
    };
  }, []);

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'player_join':
        dispatch({
          type: 'PLAYER_JOINED',
          payload: {
            id: message.payload.playerId,
            name: message.payload.playerName,
            isReady: message.payload.isReady,
            isConnected: true,
            lastSeen: Date.now(),
          },
        });
        break;

      case 'player_leave':
        dispatch({ type: 'PLAYER_LEFT', payload: message.payload.playerId });
        break;

      case 'player_ready':
        dispatch({
          type: 'PLAYER_READY_CHANGED',
          payload: {
            playerId: message.payload.playerId,
            isReady: message.payload.isReady,
          },
        });
        break;

      case 'game_start':
        dispatch({ type: 'GAME_DATA_UPDATED', payload: message.payload.gameData });
        break;

      case 'game_update':
        dispatch({ type: 'GAME_DATA_UPDATED', payload: message.payload.gameData });
        break;

      case 'game_end':
        // Handle game end
        break;

      case 'communication':
        dispatch({
          type: 'MESSAGE_RECEIVED',
          payload: {
            id: `${message.timestamp}-${message.payload.fromPlayer}`,
            message: message.payload.message,
            fromPlayer: message.payload.fromPlayer,
            toPlayer: message.payload.toPlayer,
            messageType: message.payload.messageType,
            timestamp: message.timestamp,
            isRead: false,
          },
        });
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }, []);

  const connect = useCallback(async (playerId: string, sessionId?: string) => {
    try {
      await webSocketService.connect(playerId, sessionId);
    } catch (error) {
      dispatch({ type: 'ERROR_OCCURRED', payload: 'Failed to connect to server' });
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    webSocketService.disconnect();
    dispatch({ type: 'SESSION_LEFT' });
  }, []);

  const createSession = useCallback(async (gameType: GameType, playerId: string): Promise<GameSession> => {
    try {
      // In a real app, this would call the backend API
      const session: GameSession = {
        id: `session-${Date.now()}`,
        matchId: `match-${Date.now()}`,
        gameType,
        players: [playerId],
        status: 'waiting',
        startedAt: new Date(),
        gameData: null,
      };

      dispatch({ type: 'SESSION_CREATED', payload: session });
      return session;
    } catch (error) {
      dispatch({ type: 'ERROR_OCCURRED', payload: 'Failed to create session' });
      throw error;
    }
  }, []);

  const joinSession = useCallback(async (sessionId: string, playerId: string) => {
    try {
      await connect(playerId, sessionId);
      
      // In a real app, this would call the backend API to join the session
      const session: GameSession = {
        id: sessionId,
        matchId: `match-${sessionId}`,
        gameType: 'CircuitSwap', // This would come from the backend
        players: [playerId, 'other-player'],
        status: 'waiting',
        startedAt: new Date(),
        gameData: null,
      };

      dispatch({ type: 'SESSION_JOINED', payload: session });
    } catch (error) {
      dispatch({ type: 'ERROR_OCCURRED', payload: 'Failed to join session' });
      throw error;
    }
  }, [connect]);

  const leaveSession = useCallback(() => {
    if (state.currentSession) {
      webSocketService.send({
        type: 'player_leave',
        payload: { playerId: 'current-player', reason: 'leave' },
        timestamp: Date.now(),
        sessionId: state.currentSession.id,
      });
    }
    dispatch({ type: 'SESSION_LEFT' });
  }, [state.currentSession]);

  const setReady = useCallback((isReady: boolean) => {
    dispatch({ type: 'SET_READY', payload: isReady });
    
    if (state.currentSession) {
      webSocketService.sendPlayerReady(state.currentSession.id, 'current-player', isReady);
    }
  }, [state.currentSession]);

  const sendGameUpdate = useCallback((gameData: any, playerAction?: any) => {
    if (state.currentSession) {
      webSocketService.sendGameUpdate(state.currentSession.id, 'current-player', gameData, playerAction);
    }
  }, [state.currentSession]);

  const sendMessage = useCallback((message: string, messageType: 'instruction' | 'hint' | 'question' | 'response', toPlayer?: string) => {
    if (state.currentSession) {
      webSocketService.sendCommunication(state.currentSession.id, 'current-player', message, messageType, toPlayer);
      
      // Add to local messages
      const communicationMessage: CommunicationMessage = {
        id: `${Date.now()}-current-player`,
        message,
        fromPlayer: 'current-player',
        toPlayer,
        messageType,
        timestamp: Date.now(),
        isRead: true,
      };
      
      dispatch({ type: 'MESSAGE_SENT', payload: communicationMessage });
    }
  }, [state.currentSession]);

  const markMessageAsRead = useCallback((messageId: string) => {
    // In a real app, this would update the message status on the server
    console.log('Message marked as read:', messageId);
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: MultiplayerContextType = {
    state,
    connect,
    disconnect,
    createSession,
    joinSession,
    leaveSession,
    setReady,
    sendGameUpdate,
    sendMessage,
    markMessageAsRead,
    clearError,
  };

  return (
    <MultiplayerContext.Provider value={value}>
      {children}
    </MultiplayerContext.Provider>
  );
};

// Custom hook to use Multiplayer Context
export const useMultiplayer = (): MultiplayerContextType => {
  const context = useContext(MultiplayerContext);
  if (context === undefined) {
    throw new Error('useMultiplayer must be used within a MultiplayerProvider');
  }
  return context;
};

export default MultiplayerContext;
