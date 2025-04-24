import {
  ConversationsResponse,
  MarkMessageReadRequest,
  MessagesResponse,
  PetStatus,
  SendMessageRequest,
  UnreadCountResponse,
  UpdatePetStatusRequest,
  User,
} from '@/types/api';
import { http } from '@/lib/http';

export async function getPetOwner(petId: string): Promise<User> {
  const response = await http.get(`/pets/${petId}/owner`);
  return response.data;
}

export async function updatePetStatus(petId: string, status: PetStatus): Promise<void> {
  const requestData: UpdatePetStatusRequest = { petId, status };
  await http.put(`/pets/${petId}/status`, requestData);
}

export async function markMessageAsRead(messageId: string): Promise<void> {
  const requestData: MarkMessageReadRequest = { messageId };
  await http.put('/messages/read', requestData);
}

export async function sendMessage(request: SendMessageRequest): Promise<void> {
  await http.post('/messages', request);
}

export async function getUserMessages(userId: string, cursor?: string): Promise<MessagesResponse> {
  const response = await http.get('/messages/user/' + userId, {
    params: { cursor, limit: 0 },
  });
  return response.data;
}

export async function getUnreadMessagesCount(): Promise<number> {
  try {
    const response = await http.get<number>('/messages/unread/count');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch unread message count:', error);
    return 0; // Return 0 as fallback value
  }
}

export async function getPetMessages(petId: string, cursor?: string): Promise<MessagesResponse> {
  try {
    const response = await http.get('/messages/pet/' + petId, {
      params: { cursor, limit: 0 },
    });
    return {
      messages: response.data.messages || [],
      totalCount: response.data.totalCount || 0,
      nextCursor: response.data.nextCursor,
    };
  } catch (error) {
    console.error('Failed to fetch pet messages:', error);
    return { messages: [], totalCount: 0 };
  }
}

export async function getConversations(cursor?: string): Promise<ConversationsResponse> {
  try {
    const response = await http.get('/messages/conversations', {
      params: { cursor, limit: 0 },
    });

    // Ensure we have the proper structure
    if (!response.data || !response.data.conversations) {
      console.warn('Malformed response from getConversations:', response.data);
      return { conversations: [], totalCount: 0 };
    }

    return {
      conversations: response.data.conversations || [],
      totalCount: response.data.totalCount || 0,
      nextCursor: response.data.nextCursor,
    };
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return { conversations: [], totalCount: 0 };
  }
}
