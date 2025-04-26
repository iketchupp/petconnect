import { Address } from './address';
import { Pet, PetStatus } from './pet';
import { Shelter } from './shelter';
import { User } from './user';

export enum WebSocketMessageType {
  NEW_MESSAGE = 'NEW_MESSAGE',
  READ_RECEIPT = 'READ_RECEIPT',
  PET_STATUS_UPDATE = 'PET_STATUS_UPDATE',
  USER_TYPING = 'USER_TYPING',
  USER_STOPPED_TYPING = 'USER_STOPPED_TYPING',
}

export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: any;
}

export interface MessageDTO {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  shelterId: string | null;
  petId: string | null;
  sentAt: string;
  sender: User | null;
  receiver: User | null;
  shelter: Shelter | null;
  pet: Pet | null;
}

export interface ConversationDTO {
  otherUserId: string;
  otherUser: User;
  lastMessage: string;
  hasUnread: boolean;
  shelterId: string | null;
  shelter: Shelter | null;
  petId: string | null;
  pet: Pet | null;
  lastMessageAt: string;
  unreadCount?: number;
}

export interface SendMessageRequest {
  receiverId: string;
  content: string;
  petId: string;
  shelterId?: string;
  sentAt: string;
}

export interface ReadMessagePayload {
  userId: string;
  petId?: string;
}

export interface PetStatusUpdatePayload {
  petId: string;
  status: PetStatus;
}

export interface TypingStatusPayload {
  userId: string;
  petId?: string;
  isTyping: boolean;
}

export interface ConversationFilter {
  userId?: string;
  petId?: string;
}
