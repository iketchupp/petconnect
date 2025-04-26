import { Client, Frame, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import { WebSocketMessageType } from '@/types/api/message';
import { getCurrentUTCDate } from '@/lib/date';

class WebSocketService {
  private client: Client | null = null;
  private connected = false;
  private messageHandlers: Map<WebSocketMessageType, Set<(payload: any) => void>> = new Map();
  private connectionHandlers: Set<(connected: boolean) => void> = new Set();
  private token: string | null = null;
  private userId: string | null = null;

  constructor() {
    Object.values(WebSocketMessageType).forEach((type) => {
      this.messageHandlers.set(type, new Set());
    });
  }

  connect(token: string, userId: string): Promise<void> {
    this.token = token;
    this.userId = userId;

    return new Promise((resolve, reject) => {
      if (this.connected) {
        resolve();
        return;
      }

      try {
        const wsUrl = `${process.env.NEXT_PUBLIC_API_URL}/ws`;

        const socket = new SockJS(wsUrl);

        this.client = new Client({
          webSocketFactory: () => socket,
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },
          debug: (str) => {
            console.log(`STOMP: ${str}`);
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        this.client.onConnect = (frame: Frame) => {
          this.connected = true;
          this.notifyConnectionHandlers(true);

          // Subscribe to personal message queue
          this.client?.subscribe(`/user/${this.userId}/queue/messages`, (message: Message) => {
            try {
              const data = JSON.parse(message.body);
              const type = data.type as WebSocketMessageType;
              const payload = data.payload;

              const handlers = this.messageHandlers.get(type);
              if (handlers) {
                handlers.forEach((handler) => handler(payload));
              }
            } catch (error) {
              console.error('Error processing WebSocket message:', error);
            }
          });

          resolve();
        };

        this.client.onStompError = (frame: Frame) => {
          const errorMsg = frame.headers.message;
          console.error('STOMP error:', errorMsg);
          this.notifyConnectionHandlers(false);
          reject(new Error(errorMsg));
        };

        this.client.onWebSocketClose = () => {
          this.connected = false;
          this.notifyConnectionHandlers(false);
        };

        // Add error handler for the SockJS connection
        socket.onerror = (error) => {
          console.error('SockJS error:', error);
        };

        this.client.activate();
      } catch (error) {
        console.error('Error setting up WebSocket connection:', error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.client && this.connected) {
      this.client.deactivate();
      this.connected = false;
      this.notifyConnectionHandlers(false);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Message sending methods
  sendMessage(receiverId: string, content: string, sentAt: string, petId: string, shelterId?: string): void {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return;
    }

    const message = {
      receiverId,
      content,
      sentAt: sentAt || getCurrentUTCDate(),
      petId,
      shelterId,
    };

    try {
      this.client.publish({
        destination: '/app/message',
        body: JSON.stringify(message),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  markAsRead(userId: string): void {
    if (!this.client || !this.connected) return;

    try {
      this.client.publish({
        destination: '/app/message/read',
        body: JSON.stringify({ userId }),
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  markPetMessagesAsRead(userId: string, petId: string): void {
    if (!this.client || !this.connected) return;

    try {
      this.client.publish({
        destination: '/app/message/read/pet',
        body: JSON.stringify({ userId, petId }),
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
    } catch (error) {
      console.error('Error marking pet messages as read:', error);
    }
  }

  sendTypingStatus(receiverId: string, petId?: string): void {
    if (!this.client || !this.connected) return;

    try {
      // Ensure we're sending the expected format with both receiverId and senderId (from userId)
      const payload = {
        receiverId,
        senderId: this.userId, // Add the senderId explicitly
        petId,
      };

      this.client.publish({
        destination: '/app/message/typing',
        body: JSON.stringify(payload),
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
    } catch (error) {
      console.error('Error sending typing status:', error);
    }
  }

  sendStoppedTyping(receiverId: string, petId?: string): void {
    if (!this.client || !this.connected) return;

    try {
      // Ensure we're sending the expected format with both receiverId and senderId (from userId)
      const payload = {
        receiverId,
        senderId: this.userId, // Add the senderId explicitly
        petId,
      };

      this.client.publish({
        destination: '/app/message/stop-typing',
        body: JSON.stringify(payload),
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
    } catch (error) {
      console.error('Error sending stopped typing:', error);
    }
  }

  // Event handlers
  onMessage(type: WebSocketMessageType, handler: (payload: any) => void): () => void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.add(handler);
    }

    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  onConnectionChange(handler: (connected: boolean) => void): () => void {
    this.connectionHandlers.add(handler);
    return () => {
      this.connectionHandlers.delete(handler);
    };
  }

  private notifyConnectionHandlers(connected: boolean): void {
    this.connectionHandlers.forEach((handler) => handler(connected));
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();
export default websocketService;
