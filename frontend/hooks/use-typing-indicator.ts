import { useCallback, useEffect, useRef, useState } from 'react';
import { useMessageStore } from '@/stores/message-store';

export function useTypingIndicator(currentConversationUserId: string | null, currentConversationPetId: string | null) {
  const { typingUsers, sendTypingStatus } = useMessageStore();
  const [isTyping, setIsTyping] = useState(false);
  const typingIndicatorRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to check if user is typing in current conversation
  const isUserTyping = useCallback(
    (userId: string, petId: string | null): boolean => {
      if (!typingUsers[userId]) return false;

      if (petId) {
        return !!typingUsers[userId][petId];
      } else {
        return !!typingUsers[userId]['default'];
      }
    },
    [typingUsers]
  );

  // Debounced typing status effect
  useEffect(() => {
    // Only send typing status if we have a valid conversation and typing state changed
    if (currentConversationUserId && isTyping) {
      sendTypingStatus(currentConversationUserId, isTyping);
    }

    // Clean up timeout on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping, currentConversationUserId, sendTypingStatus]);

  // Scroll to typing indicator when it appears
  useEffect(() => {
    if (
      currentConversationUserId &&
      isUserTyping(currentConversationUserId, currentConversationPetId) &&
      typingIndicatorRef.current
    ) {
      typingIndicatorRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [typingUsers, currentConversationUserId, currentConversationPetId, isUserTyping]);

  // Handle typing events with debounce
  const handleMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>, setNewMessage: (value: string) => void) => {
      const value = e.target.value;
      setNewMessage(value);

      // Only update typing status if content exists and we have a valid conversation
      if (currentConversationUserId) {
        // Update typing state based on content
        const shouldBeTyping = value.length > 0;

        // Reset timeout on every keystroke
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        if (shouldBeTyping) {
          // Only send typing status if state changed
          if (shouldBeTyping !== isTyping) {
            setIsTyping(shouldBeTyping);
          }

          // Set timeout to clear typing status after inactivity (1.5 seconds)
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            sendTypingStatus(currentConversationUserId, false);
          }, 1500);
        } else {
          // If message is empty, stop typing immediately
          setIsTyping(false);
          sendTypingStatus(currentConversationUserId, false);
        }
      } else {
        console.warn('Cannot send typing status: no currentConversationUserId');
      }
    },
    [currentConversationUserId, isTyping, sendTypingStatus]
  );

  return {
    isTyping,
    setIsTyping,
    typingIndicatorRef,
    isUserTyping,
    handleMessageChange,
  };
}
