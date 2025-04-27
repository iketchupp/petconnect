import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useMessageStore } from '@/stores/message-store';

import { PetStatus } from '@/types/api';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { useChatScroll } from '@/hooks/use-chat-scroll';
import { usePetActions } from '@/hooks/use-pet-actions';
import { useTypingIndicator } from '@/hooks/use-typing-indicator';
import { Loading } from '@/components/loading';

import { ChatHeader } from './chat-header';
import { MessageInput } from './message-input';
import { MessageList } from './message-list';

interface ChatWindowProps {
  isLoading?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function ChatWindow({ isLoading, showBackButton, onBack }: ChatWindowProps) {
  const { messages, currentConversationUserId, currentConversationPetId } = useMessageStore();

  const { newMessage, setNewMessage, isSending, currentPartner, currentPet, isOwner, sendMessage, handleKeyDown } =
    useChatMessages();

  const { messagesEndRef, scrollAreaRef } = useChatScroll(messages, currentConversationUserId, isSending);

  const { isTyping, setIsTyping, typingIndicatorRef, isUserTyping, handleMessageChange } = useTypingIndicator(
    currentConversationUserId,
    currentConversationPetId
  );

  const { fullAddress, updatePetStatus, adoptPet, getFullAddress: fetchFullAddress } = usePetActions(currentPet?.id);

  // Reset typing state when sending a message
  useEffect(() => {
    if (isSending) {
      setIsTyping(false);
    }
  }, [isSending, setIsTyping]);

  // Helper for handling message input changes
  const onMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleMessageChange(e, setNewMessage);
  };

  // Function to get address and insert it into message input
  const getFullAddress = () => {
    fetchFullAddress();
  };

  // Update message input when fullAddress is fetched
  useEffect(() => {
    if (fullAddress) {
      setNewMessage(newMessage.concat(`The pet's full address is: ${fullAddress.formattedAddress}`));
    }
  }, [fullAddress, setNewMessage]);

  // No active conversation selected
  if (!currentConversationUserId || !currentConversationPetId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground text-center">
          <p>Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return <Loading />;
  }

  const isPartnerTyping =
    currentConversationUserId && isUserTyping(currentConversationUserId, currentConversationPetId);

  return (
    <div className="flex h-full flex-col">
      {/* Chat header */}
      {currentPet && (
        <ChatHeader
          currentPartner={currentPartner}
          currentPet={currentPet}
          isOwner={isOwner}
          onUpdatePetStatus={updatePetStatus}
          onAdoptPet={adoptPet}
          onGetFullAddress={getFullAddress}
          showBackButton={showBackButton}
          onBack={onBack}
        />
      )}

      {/* Messages area */}
      <MessageList
        messages={messages}
        messagesEndRef={messagesEndRef}
        scrollAreaRef={scrollAreaRef}
        typingIndicatorRef={typingIndicatorRef}
        isUserTyping={!!isPartnerTyping}
      />

      {/* Message input */}
      <MessageInput
        newMessage={newMessage}
        isSending={isSending}
        disabled={currentPet?.status === PetStatus.ADOPTED}
        onMessageChange={onMessageChange}
        onKeyDown={handleKeyDown}
        onSendMessage={sendMessage}
      />
    </div>
  );
}
