import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useMessageStore } from '@/stores/message-store';
import { MessageSquare } from 'lucide-react';

import { ConversationDTO } from '@/types/api/message';
import { getFullName, getInitials } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loading } from '@/components/loading';

import { Conversation } from './conversation';

function ConversationsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    conversations,
    currentConversationUserId,
    currentConversationPetId,
    selectConversation: markConversationAsRead,
  } = useMessageStore();
  const { session } = useAuthStore();

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4">
        <MessageSquare className="text-muted-foreground mb-2 h-8 w-8" />
        <p className="text-muted-foreground text-center text-sm">No conversations yet.</p>
      </div>
    );
  }

  const selectConversation = (conversation: ConversationDTO) => {
    // Mark conversation as read in the store
    if (conversation.petId) {
      markConversationAsRead(conversation.otherUserId, conversation.petId);
    }

    // Navigate to the conversation
    const params = new URLSearchParams();
    params.set('userId', conversation.otherUserId);
    if (conversation.petId) {
      params.set('petId', conversation.petId);
    }
    router.push(`/user/messages?${params.toString()}`);
  };

  return (
    <div className="flex flex-col">
      <div className="border-b p-4">
        <h2 className="text-xl font-semibold">Conversations</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="flex flex-col gap-1 p-2">
          {conversations.map((conversation) => {
            const isSelected =
              currentConversationUserId === conversation.otherUserId &&
              (!currentConversationPetId || currentConversationPetId === conversation.petId);

            return (
              <Conversation
                key={`${conversation.otherUserId}-${conversation.petId || 'general'}`}
                conversation={conversation}
                isSelected={isSelected}
                onSelect={selectConversation}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

export function ConversationsList() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-4">
          <Loading />
        </div>
      }
    >
      <ConversationsListContent />
    </Suspense>
  );
}
