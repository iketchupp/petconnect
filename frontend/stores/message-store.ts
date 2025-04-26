import { useAuthStore } from '@/stores/auth-store';
import { create } from 'zustand';

import { PetStatus } from '@/types/api';
import { ConversationDTO, MessageDTO, PetStatusUpdatePayload, WebSocketMessageType } from '@/types/api/message';
import websocketService from '@/lib/websocket';

interface MessageStore {
  // Connection state
  connected: boolean;
  connecting: boolean;
  connect: (token: string) => Promise<void>;
  disconnect: () => void;

  // Conversations
  conversations: ConversationDTO[];
  currentConversationUserId: string | null;
  currentConversationPetId: string | null;
  setConversations: (conversations: ConversationDTO[]) => void;
  selectConversation: (userId: string, petId: string) => void;
  clearCurrentConversation: () => void;
  refreshConversations: () => void;

  // Messages
  messages: MessageDTO[];
  isLoadingMessages: boolean;
  setMessages: (messages: MessageDTO[]) => void;
  addMessage: (message: MessageDTO) => void;
  markAsRead: (userId: string, petId: string) => void;

  // Messages page active state
  isMessagesPageActive: boolean;
  setMessagesPageActive: (active: boolean) => void;

  // Typing status
  typingUsers: Record<string, Record<string, boolean>>;
  setUserTyping: (userId: string, petId: string | null, isTyping: boolean) => void;
  sendTypingStatus: (receiverId: string, isTyping: boolean) => void;

  // Pet status
  updatePetStatus: (petId: string, status: PetStatus) => void;

  // Unread count
  unreadCount: number;
  setUnreadCount: (count: number) => void;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  // Connection state
  connected: false,
  connecting: false,
  connect: async (token: string) => {
    try {
      set({ connecting: true });

      // Get user ID from auth store
      const session = useAuthStore.getState().session;
      if (!session || !session.id) {
        throw new Error('User not authenticated');
      }

      await websocketService.connect(token, session.id);
      set({ connected: true, connecting: false });

      // Set up event listeners
      websocketService.onConnectionChange((connected) => {
        set({ connected });
      });

      // Handle new messages
      websocketService.onMessage(WebSocketMessageType.NEW_MESSAGE, (message: MessageDTO) => {
        const { currentConversationUserId, currentConversationPetId, messages, isMessagesPageActive } = get();

        console.log(message.sentAt);

        // Add message to current conversation if it matches
        if (
          (message.senderId === currentConversationUserId || message.receiverId === currentConversationUserId) &&
          (!currentConversationPetId || message.petId === currentConversationPetId)
        ) {
          set({ messages: [...messages, message] });

          // Only automatically mark as read if user is actively viewing the messages page
          // and this is a message TO the current user in the active conversation
          if (isMessagesPageActive && message.receiverId === session?.id) {
            if (message.petId) {
              get().markAsRead(message.senderId, message.petId);
            } else {
              console.warn('Received message without petId, cannot mark as read');
            }
          }
        }

        // Update conversations list
        get().refreshConversations();
      });

      // Handle read receipts
      websocketService.onMessage(
        WebSocketMessageType.READ_RECEIPT,
        ({ userId, petId }: { userId: string; petId?: string }) => {
          const { messages } = get();
          const updatedMessages = messages.map((msg) => {
            if ((msg.senderId === userId || msg.receiverId === userId) && (!petId || msg.petId === petId)) {
              return { ...msg, isRead: true };
            }
            return msg;
          });

          set({ messages: updatedMessages });
          get().refreshConversations();
        }
      );

      // Handle pet status updates
      websocketService.onMessage(WebSocketMessageType.PET_STATUS_UPDATE, (payload: PetStatusUpdatePayload) => {
        get().updatePetStatus(payload.petId, payload.status);
      });

      // Handle typing indicators
      websocketService.onMessage(WebSocketMessageType.USER_TYPING, (payload) => {
        let userId, petId;

        // Handle both string format and object format for backwards compatibility
        if (typeof payload === 'string') {
          userId = payload;
          petId = null;
        } else if (payload && typeof payload === 'object') {
          // Make sure we extract the correct properties
          if ('userId' in payload) {
            userId = payload.userId;
          } else if ('senderId' in payload) {
            userId = payload.senderId;
          } else {
            console.error('Invalid typing payload format:', payload);
            return;
          }

          petId = payload.petId || null;
        } else {
          console.error('Invalid typing payload format:', payload);
          return;
        }

        if (userId) {
          get().setUserTyping(userId, petId, true);
        }
      });

      websocketService.onMessage(WebSocketMessageType.USER_STOPPED_TYPING, (payload) => {
        let userId, petId;

        // Handle both string format and object format for backwards compatibility
        if (typeof payload === 'string') {
          userId = payload;
          petId = null;
        } else if (payload && typeof payload === 'object') {
          // Make sure we extract the correct properties
          if ('userId' in payload) {
            userId = payload.userId;
          } else if ('senderId' in payload) {
            userId = payload.senderId;
          } else {
            console.error('Invalid typing payload format:', payload);
            return;
          }

          petId = payload.petId || null;
        } else {
          console.error('Invalid typing payload format:', payload);
          return;
        }

        if (userId) {
          get().setUserTyping(userId, petId, false);
        }
      });
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      set({ connecting: false });
    }
  },
  disconnect: () => {
    websocketService.disconnect();
    set({ connected: false });
  },

  // Conversations
  conversations: [],
  currentConversationUserId: null,
  currentConversationPetId: null,
  setConversations: (conversations) => set({ conversations }),
  selectConversation: (userId, petId) => {
    if (!petId) {
      console.error('Cannot select conversation: petId is required');
      return;
    }

    set({
      currentConversationUserId: userId,
      currentConversationPetId: petId,
    });

    // Mark conversation as read when selected
    get().markAsRead(userId, petId);
  },
  clearCurrentConversation: () => {
    set({
      currentConversationUserId: null,
      currentConversationPetId: null,
      messages: [],
    });
  },

  // Messages
  messages: [],
  isLoadingMessages: false,
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => {
    const { messages } = get();
    set({ messages: [...messages, message] });
  },
  markAsRead: (userId, petId) => {
    if (!petId) {
      console.error('Cannot mark as read: petId is required');
      return;
    }
    websocketService.markPetMessagesAsRead(userId, petId);
  },

  // Messages page active state
  isMessagesPageActive: false,
  setMessagesPageActive: (active) => set({ isMessagesPageActive: active }),

  // Typing status
  typingUsers: {},
  setUserTyping: (userId, petId, isTyping) => {
    // Ensure userId is valid
    if (!userId) {
      console.error('setUserTyping called with invalid userId:', userId);
      return;
    }

    set((state) => {
      // Ensure the user entry exists
      const userTyping = state.typingUsers[userId] || {};

      // If petId is provided, use it; otherwise, use 'default'
      const petKey = petId || 'default';

      const updatedTypingUsers = {
        ...state.typingUsers,
        [userId]: {
          ...userTyping,
          [petKey]: isTyping,
        },
      };

      return {
        typingUsers: updatedTypingUsers,
      };
    });
  },

  sendTypingStatus: (receiverId, isTyping) => {
    const { currentConversationPetId } = get();

    if (isTyping) {
      websocketService.sendTypingStatus(receiverId, currentConversationPetId || undefined);
    } else {
      websocketService.sendStoppedTyping(receiverId, currentConversationPetId || undefined);
    }
  },

  // Pet status
  updatePetStatus: (petId, status) => {
    // This will be handled by updating the conversations and messages
    // that contain this pet with the new status
    const { conversations, messages } = get();

    // Update conversations
    const updatedConversations = conversations.map((conv) => {
      if (conv.pet && conv.pet.id === petId) {
        return {
          ...conv,
          pet: {
            ...conv.pet,
            status,
          },
        };
      }
      return conv;
    });

    // Update messages
    const updatedMessages = messages.map((msg) => {
      if (msg.pet && msg.pet.id === petId) {
        return {
          ...msg,
          pet: {
            ...msg.pet,
            status,
          },
        };
      }
      return msg;
    });

    set({
      conversations: updatedConversations,
      messages: updatedMessages,
    });
  },

  // Unread count
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),

  // Helper methods
  refreshConversations: () => {
    // This method will be replaced at runtime by the messages page
    // Don't perform direct API calls here to avoid infinite loops
  },
}));
