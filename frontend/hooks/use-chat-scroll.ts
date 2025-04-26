import { useEffect, useRef } from 'react';

import { MessageDTO } from '@/types/api/message';

export function useChatScroll(messages: MessageDTO[], currentConversationUserId: string | null, isSending: boolean) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const prevConversationIdRef = useRef<string | null>(null);
  const initialScrollDoneRef = useRef(false);

  // Only scroll to bottom when new messages arrive in the same conversation
  // or when we've just sent a new message
  useEffect(() => {
    // If conversation changed, reset the initialScrollDone flag
    if (prevConversationIdRef.current !== currentConversationUserId) {
      initialScrollDoneRef.current = false;
      prevConversationIdRef.current = currentConversationUserId;
    }

    // Initial load - scroll to bottom once
    if (!initialScrollDoneRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
      initialScrollDoneRef.current = true;
      return;
    }

    // When a new message is added to the current conversation
    if (initialScrollDoneRef.current && isSending === false && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentConversationUserId, isSending]);

  return {
    messagesEndRef,
    scrollAreaRef,
    prevConversationIdRef,
    initialScrollDoneRef,
  };
}
