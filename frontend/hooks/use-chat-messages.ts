import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useMessageStore } from '@/stores/message-store';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { MessageDTO } from '@/types/api/message';
import { getCurrentUTCDate } from '@/lib/date';
import websocketService from '@/lib/websocket';

export function useChatMessages() {
  const { session } = useAuthStore();
  const { addMessage, sendTypingStatus, messages, currentConversationUserId, currentConversationPetId } =
    useMessageStore();

  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Find the current conversation partner and pet
  const currentPartner =
    messages && messages.length > 0
      ? messages[0].senderId === session?.id
        ? messages[0].receiver
        : messages[0].sender
      : null;

  const currentPet = messages && messages.length > 0 && messages[0].pet ? messages[0].pet : null;

  // Determine if current user is the pet owner
  const isOwner = currentPet?.ownerId === session?.id;

  // Send a new message
  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!currentConversationUserId || !newMessage.trim() || !currentConversationPetId || !currentPet) {
        if (!currentPet) {
          console.error('Cannot send message: Pet information is required');
        }
        return;
      }

      setIsSending(true);
      try {
        // Create a temporary message object for immediate display
        const tempMessage: MessageDTO = {
          id: `temp-${Date.now()}`,
          senderId: session?.id || '',
          receiverId: currentConversationUserId,
          content: newMessage.trim(),
          isRead: false,
          shelterId: null,
          petId: currentConversationPetId,
          sentAt: getCurrentUTCDate(),
          sender: session,
          receiver: currentPartner,
          shelter: null,
          pet: currentPet,
        };

        // Add message to local state immediately
        addMessage(tempMessage);

        // Stop typing indication
        if (currentConversationUserId) {
          sendTypingStatus(currentConversationUserId, false);
        }

        // Use websocket service to send the message
        websocketService.sendMessage(
          currentConversationUserId,
          newMessage.trim(),
          tempMessage.sentAt,
          currentConversationPetId
        );
        setNewMessage('');
      } catch (error) {
        console.error('Failed to send message:', error);
        toast.error('Failed to send message');
      } finally {
        setIsSending(false);
      }
    },
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessageMutation.mutate();
    }
  };

  return {
    // Only export what this hook is responsible for
    newMessage,
    setNewMessage,
    isSending,
    currentPartner,
    currentPet,
    isOwner,
    sendMessage: sendMessageMutation.mutate,
    handleKeyDown,
  };
}
