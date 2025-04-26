import { User } from '@/types/api';
import { ConversationDTO, MessageDTO, SendMessageRequest } from '@/types/api/message';
import { http } from '@/lib/http';

// Send a new message
export async function sendMessage(request: SendMessageRequest): Promise<MessageDTO> {
  try {
    const response = await http.post('/messages', request);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

// Get all conversations
export async function getConversations(): Promise<ConversationDTO[]> {
  try {
    const response = await http.get('/messages/conversations');
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
}

// Get conversation with user
export async function getConversationWithUser(userId: string): Promise<MessageDTO[]> {
  try {
    const response = await http.get(`/messages/conversations/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation with user:', error);
    throw error;
  }
}

// Get conversation about pet
export async function getConversationAboutPet(userId: string, petId: string): Promise<MessageDTO[]> {
  try {
    const response = await http.get(`/messages/conversations/${userId}/pets/${petId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation about pet:', error);
    throw error;
  }
}

// Mark conversation as read
export async function markConversationAsRead(userId: string): Promise<void> {
  try {
    await http.put(`/messages/conversations/${userId}/read`);
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    throw error;
  }
}

// Mark pet conversation as read
export async function markPetConversationAsRead(userId: string, petId: string): Promise<void> {
  try {
    await http.put(`/messages/conversations/${userId}/pets/${petId}/read`);
  } catch (error) {
    console.error('Error marking pet conversation as read:', error);
    throw error;
  }
}

// Get unread messages count
export async function getUnreadMessagesCount(): Promise<number> {
  try {
    const response = await http.get('/messages/unread/count');
    return response.data;
  } catch (error) {
    console.error('Error fetching unread messages count:', error);
    throw error;
  }
}

// Get unread conversations
export async function getUnreadConversations(): Promise<ConversationDTO[]> {
  try {
    const response = await http.get('/messages/conversations/unread');
    return response.data;
  } catch (error) {
    console.error('Error fetching unread conversations:', error);
    throw error;
  }
}
