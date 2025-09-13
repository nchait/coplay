import { Platform } from 'react-native';

// Dynamic import to avoid Turbo Module Registry issues
let io: any;
let Socket: any;
let useSocketIO = false;

try {
  const socketIOClient = require('socket.io-client');
  io = socketIOClient.io;
  Socket = socketIOClient.Socket;
  useSocketIO = true;
  console.log('Socket.IO client loaded successfully');
} catch (error) {
  console.error('Failed to load socket.io-client, falling back to WebSocket:', error);
  useSocketIO = false;
}

// Socket.IO Configuration
const getSocketUrl = () => {
  if (!__DEV__) {
    return 'http://localhost:5001'; // Production URL would go here
  }

  // Development environment with Docker
  if (Platform.OS === 'android') {
    // Android emulator: 10.0.2.2 maps to host machine's localhost
    return 'http://10.0.2.2:5001';
  } else if (Platform.OS === 'ios') {
    // iOS simulator: localhost works directly
    return 'http://localhost:5001';
  } else {
    // Web or other platforms
    return 'http://localhost:5001';
  }
};

// WebSocket Message Types
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
  sessionId?: string;
  playerId?: string;
}

export interface GameUpdateMessage extends WebSocketMessage {
  type: 'game_update';
  payload: {
    gameData: any;
    playerAction?: any;
    gameState?: any;
  };
}

export interface PlayerJoinMessage extends WebSocketMessage {
  type: 'player_join';
  payload: {
    playerId: string;
    playerName: string;
    isReady: boolean;
  };
}

export interface PlayerLeaveMessage extends WebSocketMessage {
  type: 'player_leave';
  payload: {
    playerId: string;
    reason: 'disconnect' | 'leave' | 'timeout';
  };
}

export interface GameStartMessage extends WebSocketMessage {
  type: 'game_start';
  payload: {
    gameType: string;
    gameData: any;
    players: string[];
  };
}

export interface GameEndMessage extends WebSocketMessage {
  type: 'game_end';
  payload: {
    success: boolean;
    score: number;
    duration: number;
    playerStats: any;
  };
}

export interface CommunicationMessage extends WebSocketMessage {
  type: 'communication';
  payload: {
    message: string;
    fromPlayer: string;
    toPlayer?: string;
    messageType: 'instruction' | 'hint' | 'question' | 'response';
  };
}

export interface HeartbeatMessage extends WebSocketMessage {
  type: 'heartbeat';
  payload: {
    playerId: string;
    timestamp: number;
  };
}

// WebSocket Connection States
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

// Socket.IO Service Class
class WebSocketService {
  private socket: Socket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageQueue: WebSocketMessage[] = [];
  
  public connectionState: ConnectionState = 'disconnected';
  public onMessage: ((message: WebSocketMessage) => void) | null = null;
  public onConnectionChange: ((state: ConnectionState) => void) | null = null;
  public onError: ((error: Error) => void) | null = null;

  constructor() {
    this.url = getSocketUrl();
  }

  // Connect to Socket.IO server or fallback to WebSocket
  connect(playerId: string, sessionId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.connectionState = 'connecting';
        this.onConnectionChange?.(this.connectionState);

        if (useSocketIO && io) {
          // Use Socket.IO
          const query: any = { playerId };
          if (sessionId) {
            query.sessionId = sessionId;
          }

          this.socket = io(this.url, {
            query,
            transports: ['websocket', 'polling'],
            timeout: 10000,
            reconnection: false, // We'll handle reconnection manually
          });
        } else {
          // Fallback to WebSocket
          const wsUrl = sessionId ? `${this.url.replace('http', 'ws')}?playerId=${playerId}&sessionId=${sessionId}` : `${this.url.replace('http', 'ws')}?playerId=${playerId}`;
          this.socket = new WebSocket(wsUrl);
        }

        if (useSocketIO && io) {
          // Socket.IO event handlers
          this.socket.on('connect', () => {
            console.log('Socket.IO connected');
            this.connectionState = 'connected';
            this.reconnectAttempts = 0;
            this.onConnectionChange?.(this.connectionState);
            
            // Start heartbeat
            this.startHeartbeat(playerId);
            
            // Send queued messages
            this.flushMessageQueue();
            
            resolve();
          });

          this.socket.on('disconnect', (reason) => {
            console.log('Socket.IO disconnected:', reason);
            this.connectionState = 'disconnected';
            this.onConnectionChange?.(this.connectionState);
            
            // Stop heartbeat
            this.stopHeartbeat();
            
            // Attempt to reconnect if not a clean disconnect
            if (reason !== 'io client disconnect' && this.reconnectAttempts < this.maxReconnectAttempts) {
              this.attemptReconnect(playerId, sessionId);
            }
          });

          this.socket.on('connect_error', (error) => {
            console.error('Socket.IO connection error:', error);
            this.connectionState = 'error';
            this.onConnectionChange?.(this.connectionState);
            this.onError?.(error as Error);
            reject(error);
          });

          // Listen for all message types
          this.socket.onAny((eventName, ...args) => {
            try {
              const message: WebSocketMessage = {
                type: eventName,
                payload: args[0] || {},
                timestamp: Date.now(),
              };
              console.log('Socket.IO message received:', message.type);
              this.onMessage?.(message);
            } catch (error) {
              console.error('Error processing Socket.IO message:', error);
              this.onError?.(error as Error);
            }
          });
        } else {
          // WebSocket event handlers
          this.socket.onopen = () => {
            console.log('WebSocket connected');
            this.connectionState = 'connected';
            this.reconnectAttempts = 0;
            this.onConnectionChange?.(this.connectionState);
            
            // Start heartbeat
            this.startHeartbeat(playerId);
            
            // Send queued messages
            this.flushMessageQueue();
            
            resolve();
          };

          this.socket.onclose = (event) => {
            console.log('WebSocket disconnected:', event.code, event.reason);
            this.connectionState = 'disconnected';
            this.onConnectionChange?.(this.connectionState);
            
            // Stop heartbeat
            this.stopHeartbeat();
            
            // Attempt to reconnect if not a clean close
            if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
              this.attemptReconnect(playerId, sessionId);
            }
          };

          this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.connectionState = 'error';
            this.onConnectionChange?.(this.connectionState);
            this.onError?.(error as Error);
            reject(error);
          };

          this.socket.onmessage = (event) => {
            try {
              const message: WebSocketMessage = JSON.parse(event.data);
              console.log('WebSocket message received:', message.type);
              this.onMessage?.(message);
            } catch (error) {
              console.error('Error parsing WebSocket message:', error);
              this.onError?.(error as Error);
            }
          };
        }

      } catch (error) {
        console.error('Error creating Socket.IO connection:', error);
        this.connectionState = 'error';
        this.onConnectionChange?.(this.connectionState);
        reject(error);
      }
    });
  }

  // Disconnect from Socket.IO server
  disconnect(): void {
    this.stopHeartbeat();
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.connectionState = 'disconnected';
    this.onConnectionChange?.(this.connectionState);
  }

  // Send message to server
  send(message: WebSocketMessage): void {
    if (this.socket) {
      try {
        if (useSocketIO && this.socket.connected) {
          this.socket.emit(message.type, message.payload);
          console.log('Socket.IO message sent:', message.type);
        } else if (!useSocketIO && this.socket.readyState === WebSocket.OPEN) {
          const messageStr = JSON.stringify(message);
          this.socket.send(messageStr);
          console.log('WebSocket message sent:', message.type);
        } else {
          // Queue message if not connected
          this.messageQueue.push(message);
          console.log('Message queued, connection not ready');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        this.onError?.(error as Error);
      }
    } else {
      // Queue message if no socket
      this.messageQueue.push(message);
      console.log('Message queued, no socket available');
    }
  }

  // Send game update
  sendGameUpdate(sessionId: string, playerId: string, gameData: any, playerAction?: any): void {
    this.send({
      type: 'game_update',
      payload: {
        gameData,
        playerAction,
      },
      timestamp: Date.now(),
      sessionId,
      playerId,
    });
  }

  // Send communication message
  sendCommunication(sessionId: string, playerId: string, message: string, messageType: 'instruction' | 'hint' | 'question' | 'response', toPlayer?: string): void {
    this.send({
      type: 'communication',
      payload: {
        message,
        fromPlayer: playerId,
        toPlayer,
        messageType,
      },
      timestamp: Date.now(),
      sessionId,
      playerId,
    });
  }

  // Send player ready status
  sendPlayerReady(sessionId: string, playerId: string, isReady: boolean): void {
    this.send({
      type: 'player_ready',
      payload: {
        playerId,
        isReady,
      },
      timestamp: Date.now(),
      sessionId,
      playerId,
    });
  }

  // Send game action
  sendGameAction(sessionId: string, playerId: string, action: any): void {
    this.send({
      type: 'game_action',
      payload: {
        action,
      },
      timestamp: Date.now(),
      sessionId,
      playerId,
    });
  }

  // Private methods
  private attemptReconnect(playerId: string, sessionId?: string): void {
    this.connectionState = 'reconnecting';
    this.onConnectionChange?.(this.connectionState);
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect(playerId, sessionId).catch((error) => {
        console.error('Reconnection failed:', error);
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.connectionState = 'error';
          this.onConnectionChange?.(this.connectionState);
          this.onError?.(new Error('Max reconnection attempts reached'));
        }
      });
    }, delay);
  }

  private startHeartbeat(playerId: string): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({
          type: 'heartbeat',
          payload: {
            playerId,
            timestamp: Date.now(),
          },
          timestamp: Date.now(),
        });
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  // Getters
  get isConnected(): boolean {
    if (!this.socket) return false;
    if (useSocketIO) {
      return this.socket.connected || false;
    } else {
      return this.socket.readyState === WebSocket.OPEN;
    }
  }

  get currentState(): ConnectionState {
    return this.connectionState;
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
export default webSocketService;
