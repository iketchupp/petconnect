import { useAuthStore } from '@/stores/auth-store';

import { MessageDTO } from '@/types/api/message';
import { ScrollArea } from '@/components/ui/scroll-area';

import { MessageBubble } from './message-bubble';

interface MessageListProps {
  messages: MessageDTO[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
  typingIndicatorRef: React.RefObject<HTMLDivElement | null>;
  isUserTyping: boolean;
}

export function MessageList({
  messages,
  messagesEndRef,
  scrollAreaRef,
  typingIndicatorRef,
  isUserTyping,
}: MessageListProps) {
  const { session } = useAuthStore();

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full p-2 xl:p-4" ref={scrollAreaRef}>
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-muted-foreground text-center text-sm">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} isOwnMessage={message.senderId === session?.id} />
            ))
          )}

          {/* Typing indicator */}
          {isUserTyping && (
            <div ref={typingIndicatorRef} className="text-muted-foreground flex items-center pl-2 text-sm">
              <div className="mr-2 flex space-x-1">
                <span className="animate-bounce">•</span>
                <span className="animate-bounce delay-75">•</span>
                <span className="animate-bounce delay-150">•</span>
              </div>
              <span>Typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
