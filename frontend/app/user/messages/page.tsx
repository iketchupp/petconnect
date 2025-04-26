'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useMessageStore } from '@/stores/message-store';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, WifiOff } from 'lucide-react';

import {
  getConversationAboutPet,
  getConversations,
  getConversationWithUser,
  getUnreadMessagesCount,
} from '@/actions/message';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChatWindow } from '@/components/app/user/messages/chat/chat-window';
import { ConversationsList } from '@/components/app/user/messages/conversations/conversations-list';
import { Loading } from '@/components/loading';

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const petId = searchParams.get('petId');

  const { session } = useAuthStore();
  const {
    connected,
    currentConversationUserId,
    currentConversationPetId,
    selectConversation,
    clearCurrentConversation,
    setConversations,
    setMessages,
    setUnreadCount,
    setMessagesPageActive,
  } = useMessageStore();

  // Monitor WebSocket connection status
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Track if we're in mobile/tablet view (responsive view)
  const [isResponsiveView, setIsResponsiveView] = useState(false);

  // Set messages page active state
  useEffect(() => {
    setMessagesPageActive(true);

    return () => {
      setMessagesPageActive(false);
    };
  }, [setMessagesPageActive]);

  // Handle responsive layout for mobile and tablet
  useEffect(() => {
    const checkResponsiveView = () => {
      setIsResponsiveView(window.innerWidth < 1200); // Increased from 1024px to 1200px to fix layout issues
    };

    // Initial check
    checkResponsiveView();

    // Listen for window resize
    window.addEventListener('resize', checkResponsiveView);

    return () => {
      window.removeEventListener('resize', checkResponsiveView);
    };
  }, []);

  useEffect(() => {
    // Set up connection status listener
    const unsubscribe = useMessageStore.subscribe((state) => {
      if (!state.connected) {
        setConnectionError('Lost connection to messaging service');
      } else {
        setConnectionError(null);
      }
    });

    return unsubscribe;
  }, []);

  // Load conversations
  const { data: conversations, isLoading: isLoadingConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
    enabled: !!session,
  });

  // Set conversations in store
  useEffect(() => {
    if (conversations) {
      setConversations(conversations);
    }
  }, [conversations, setConversations]);

  // Get unread messages count
  const { data: unreadCount } = useQuery({
    queryKey: ['unreadMessagesCount'],
    queryFn: getUnreadMessagesCount,
    enabled: !!session,
  });

  // Update unread count in store when it changes
  useEffect(() => {
    if (unreadCount !== undefined) {
      setUnreadCount(unreadCount);
    }
  }, [unreadCount, setUnreadCount]);

  // Select conversation based on URL params
  useEffect(() => {
    if (userId) {
      selectConversation(userId, petId || '');
    } else {
      // Clear the conversation when no userId is in the URL
      clearCurrentConversation();
    }
  }, [userId, petId, selectConversation, clearCurrentConversation]);

  // Load messages for selected conversation
  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['conversation', currentConversationUserId, currentConversationPetId],
    queryFn: () => {
      if (!currentConversationUserId) return null;

      if (currentConversationPetId) {
        return getConversationAboutPet(currentConversationUserId, currentConversationPetId);
      } else {
        return getConversationWithUser(currentConversationUserId);
      }
    },
    enabled: !!currentConversationUserId && !!session,
  });

  // Set messages in store
  useEffect(() => {
    if (messages) {
      setMessages(messages);
    }
  }, [messages, setMessages]);

  const handleBackToConversations = () => {
    clearCurrentConversation();
    router.push('/user/messages');
  };

  if (!session || isLoadingConversations) {
    return <Loading />;
  }

  const showConversationsList = !isResponsiveView || !currentConversationUserId;
  const showChatWindow = !isResponsiveView || (isResponsiveView && currentConversationUserId);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {connectionError && (
        <Alert variant="destructive" className="rounded-none border-0 border-b">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            <WifiOff className="h-4 w-4" /> Connection Error
          </AlertTitle>
          <AlertDescription>{connectionError}. Real-time updates might not work.</AlertDescription>
        </Alert>
      )}

      <div className="flex h-full flex-1 overflow-hidden">
        {/* Conversations List - hide on mobile/tablet when conversation is selected */}
        {showConversationsList && (
          <div
            className={`bg-muted/20 h-full overflow-y-auto border-r ${currentConversationUserId && !isResponsiveView ? 'w-96' : 'w-full'}`}
          >
            <ConversationsList />
          </div>
        )}

        {/* Chat Window - show full width on mobile/tablet when conversation is selected */}
        {showChatWindow && (
          <div className="flex-1 overflow-hidden">
            <ChatWindow
              isLoading={isLoadingMessages}
              onBack={handleBackToConversations}
              showBackButton={isResponsiveView}
            />
          </div>
        )}
      </div>
    </div>
  );
}
