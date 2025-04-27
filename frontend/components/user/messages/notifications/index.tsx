'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useMessageStore } from '@/stores/message-store';
import { Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { getConversations, getUnreadMessagesCount } from '@/actions/message';
import { getPetById } from '@/actions/pets';
import { ConversationDTO, MessageDTO, WebSocketMessageType } from '@/types/api/message';
import websocketService from '@/lib/websocket';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Conversation } from '../conversations/conversation';

export function MessageNotifications() {
  const router = useRouter();
  const { session } = useAuthStore();
  const { unreadCount, conversations, setUnreadCount, setConversations, connect, connected } = useMessageStore();
  const [showToast, setShowToast] = useState(false);
  const [latestMessage, setLatestMessage] = useState<ConversationDTO | null>(null);
  const [open, setOpen] = useState(false);
  const initialRenderRef = useRef(true);
  const lastKnownMessageTimeRef = useRef<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Filter unread conversations
  const unreadConversations = conversations.filter((convo) => convo.hasUnread);

  // Fetch initial unread messages count and conversations when component mounts
  useEffect(() => {
    // Skip API calls if user is not authenticated
    if (!session?.token) return;

    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadMessagesCount();
        setUnreadCount(count);

        // Fetch conversations if there are unread messages
        if (count > 0) {
          const convos = await getConversations();
          setConversations(convos);

          // Store the latest message time to avoid showing toast for existing messages
          if (convos.length > 0) {
            const latestConvo = [...convos].sort(
              (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
            )[0];
            lastKnownMessageTimeRef.current = latestConvo.lastMessageAt;
          }
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
    initialRenderRef.current = false;
  }, [session, setUnreadCount, setConversations]);

  // Connect to WebSocket and listen for new messages
  useEffect(() => {
    if (!session?.token) return;

    // Connect to WebSocket if not already connected
    if (!connected && !isConnecting) {
      setIsConnecting(true);
      connect(session.token)
        .then(() => {
          setIsConnecting(false);
        })
        .catch((err) => {
          console.error('WebSocket connection error:', err);
          setIsConnecting(false);
        });
    }

    // Set up a direct message listener instead of relying on the store
    const handleNewMessage = async (payload: any) => {
      if (!payload) return;

      // Different handling based on the message format
      const message: MessageDTO = payload.message || payload;

      // Only show toast for messages sent to the current user while notification popover is closed
      if (!open && message.receiverId === session?.id) {
        // Get current conversation from message store to check if user is already viewing this conversation
        const { currentConversationUserId, currentConversationPetId } = useMessageStore.getState();
        const isViewingConversation =
          currentConversationUserId === message.senderId && currentConversationPetId === message.petId;

        // Only show toast if the user is not already viewing this conversation
        if (!isViewingConversation) {
          const messageTime = new Date(message.sentAt).getTime();
          const lastKnownTime = lastKnownMessageTimeRef.current
            ? new Date(lastKnownMessageTimeRef.current).getTime()
            : 0;

          // Check if this is a new message after our last known message
          if (!lastKnownMessageTimeRef.current || messageTime > lastKnownTime) {
            try {
              // Get the conversations to find user info if sender is null
              const convos = await getConversations();

              // Try to find the sender information from conversations if not available in the message
              let senderInfo = message.sender;
              if (!senderInfo) {
                const conversation = convos.find((c) => c.otherUserId === message.senderId);
                if (conversation) {
                  senderInfo = conversation.otherUser;
                }
              }

              // If we found sender information, show the toast
              if (senderInfo) {
                console.log('senderInfo', message);
                // Only create a toast if the message has a petId
                if (message.petId) {
                  let pet = message.pet;

                  // If pet is null but petId exists, fetch the pet data
                  if (!pet) {
                    pet = await getPetById(message.petId);
                  }

                  const newMessageConvo: ConversationDTO = {
                    otherUserId: message.senderId,
                    otherUser: senderInfo,
                    lastMessage: message.content,
                    lastMessageAt: message.sentAt,
                    hasUnread: true,
                    petId: message.petId,
                    pet: pet,
                    shelterId: message.shelterId,
                    shelter: message.shelter,
                    unreadCount: 1,
                  };

                  // Update lastKnownMessageTime before showing toast
                  lastKnownMessageTimeRef.current = message.sentAt;

                  // Show the toast notification
                  setLatestMessage(newMessageConvo);
                  setShowToast(true);

                  // Hide toast after 5 seconds
                  setTimeout(() => {
                    setShowToast(false);
                  }, 5000);
                } else {
                  console.warn('Received message without a petId, not showing notification');
                }
              }
            } catch (error) {
              console.error('Error fetching conversation data:', error);
            }
          }
        }
      }
    };

    // Register a direct listener on the websocket service
    if (websocketService.isConnected()) {
      const removeListener = websocketService.onMessage(WebSocketMessageType.NEW_MESSAGE, handleNewMessage);

      return () => {
        removeListener();
      };
    }
  }, [session, connected, connect, open, isConnecting]);

  // Set up a refreshConversations function to update the message store
  useEffect(() => {
    // Skip if user is not authenticated
    if (!session?.token) return;

    // Define a function to refresh conversations when new messages arrive
    const refreshConversations = async () => {
      try {
        const count = await getUnreadMessagesCount();
        setUnreadCount(count);

        if (count > 0) {
          const convos = await getConversations();
          setConversations(convos);

          // Update latest known message time
          if (convos.length > 0) {
            const latestConvo = [...convos].sort(
              (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
            )[0];
            if (
              !lastKnownMessageTimeRef.current ||
              new Date(latestConvo.lastMessageAt).getTime() > new Date(lastKnownMessageTimeRef.current).getTime()
            ) {
              lastKnownMessageTimeRef.current = latestConvo.lastMessageAt;
            }
          }
        }
      } catch (error) {
        console.error('Failed to refresh conversations:', error);
      }
    };

    // Override the refreshConversations function in the message store
    useMessageStore.setState({
      refreshConversations,
    });

    return () => {
      // Reset the refreshConversations function when component unmounts
      useMessageStore.setState({
        refreshConversations: () => {},
      });
    };
  }, [session, setUnreadCount, setConversations]);

  const handleSelectConversation = (conversation: ConversationDTO) => {
    setOpen(false);

    // Navigate to the conversation
    const params = new URLSearchParams();
    params.set('userId', conversation.otherUserId);
    if (conversation.petId) {
      params.set('petId', conversation.petId);
    }
    router.push(`/user/messages?${params.toString()}`);
  };

  if (!session) {
    return null;
  }

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="bg-destructive absolute right-0 top-0 flex size-4 items-center justify-center rounded-full text-xs text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          <div className="flex flex-col">
            <div className="border-b px-4 py-2">
              <h3 className="font-medium">Notifications</h3>
            </div>
            {unreadConversations.length > 0 ? (
              <ScrollArea className="max-h-[300px]">
                <div className="flex flex-col p-2">
                  {unreadConversations.map((conversation) => (
                    <Conversation
                      key={`${conversation.otherUserId}-${conversation.petId}`}
                      conversation={conversation}
                      isSelected={false}
                      onSelect={handleSelectConversation}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center p-4">
                <p className="text-muted-foreground text-center text-sm">No new messages</p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Toast notification */}
      <AnimatePresence>
        {showToast && latestMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-lg border p-4 shadow-lg"
          >
            <div className="flex flex-col">
              <div className="flex justify-between">
                <p className="font-medium">{latestMessage.otherUser.fullName}</p>
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => setShowToast(false)}>
                  ×
                </Button>
              </div>
              <p className="line-clamp-2 text-sm opacity-80">{latestMessage.lastMessage}</p>
              <div className="mt-2 flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    handleSelectConversation(latestMessage);
                    setShowToast(false);
                  }}
                >
                  View Message
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
