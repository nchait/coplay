import { Platform } from 'react-native';

// Simple HTTP-based communication for now
// We'll implement WebSocket later when the server is stable

// HTTP Configuration
const getApiUrl = () => {
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
  timestamp?: string;
}

// WebSocket Connection States
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

// HTTP-based Service Class (temporary solution)
class WebSocketService {
  private url: string;
  private _isConnected = false;
  private messageQueue: WebSocketMessage[] = [];
  
  public connectionState: ConnectionState = 'disconnected';
  public onMessage: ((message: WebSocketMessage) => void) | null = null;
  public onConnectionChange: ((state: ConnectionState) => void) | null = null;
  public onError: ((error: Error) => void) | null = null;

  constructor() {
    this.url = getApiUrl();
  }

  // Connect using HTTP (temporary solution)
  connect(playerId: string, sessionId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.connectionState = 'connecting';
        this.onConnectionChange?.(this.connectionState);

        // For now, just simulate a successful connection
        // In a real implementation, you'd make an HTTP request to join a session
        console.log('HTTP-based connection established for player:', playerId);
        
        this.connectionState = 'connected';
        this._isConnected = true;
        this.onConnectionChange?.(this.connectionState);
        
        // Send queued messages
        this.flushMessageQueue();
        
        resolve();
      } catch (error) {
        console.error('Connection error:', error);
        this.connectionState = 'error';
        this.onConnectionChange?.(this.connectionState);
        this.onError?.(error as Error);
        reject(error);
      }
    });
  }

  // Disconnect
  disconnect(): void {
    this.connectionState = 'disconnected';
    this._isConnected = false;
    this.onConnectionChange?.(this.connectionState);
  }

  // Send message to server (HTTP-based)
  send(message: WebSocketMessage): void {
    if (this._isConnected) {
      try {
        // For now, just log the message
        // In a real implementation, you'd make an HTTP request
        console.log('Message sent via HTTP:', message.type, message.payload);
        
        // Simulate receiving a response
        if (this.onMessage) {
          setTimeout(() => {
            this.onMessage?.({
              type: 'message_received',
              payload: { originalMessage: message },
              timestamp: new Date().toISOString()
            });
          }, 100);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        this.onError?.(error as Error);
      }
    } else {
      // Queue message if not connected
      this.messageQueue.push(message);
      console.log('Message queued, connection not ready');
    }
  }

  // Flush queued messages
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  // Convenience methods for common message types
  sendGameUpdate(sessionId: string, playerId: string, gameData: any): void {
    this.send({
      type: 'game_update',
      payload: {
        sessionId,
        playerId,
        gameData,
        timestamp: new Date().toISOString()
      }
    });
  }

  sendPlayerAction(sessionId: string, playerId: string, action: string, data: any): void {
    this.send({
      type: 'player_action',
      payload: {
        sessionId,
        playerId,
        action,
        data,
        timestamp: new Date().toISOString()
      }
    });
  }

  sendChatMessage(sessionId: string, playerId: string, message: string): void {
    this.send({
      type: 'chat_message',
      payload: {
        sessionId,
        playerId,
        message,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Getters
  get isConnected(): boolean {
    return this._isConnected;
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();