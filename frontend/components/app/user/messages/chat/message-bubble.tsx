import { Check, CheckCheck } from 'lucide-react';

import { MessageDTO } from '@/types/api/message';
import { formatLocalTime } from '@/lib/date';

interface MessageBubbleProps {
  message: MessageDTO;
  isOwnMessage: boolean;
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const time = formatLocalTime(message.sentAt, 'h:mm a');

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 xl:max-w-[80%] ${
          isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}
      >
        <p className="break-word whitespace-pre-wrap text-sm xl:text-base" style={{ overflowWrap: 'anywhere' }}>
          {message.content}
        </p>
        <div className={`mt-1 flex items-center text-xs ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
          <span className={isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'}>{time}</span>
          {isOwnMessage && (
            <div className="ml-1 flex items-center">
              {message.isRead ? (
                <CheckCheck className="text-primary-foreground h-3 w-3" />
              ) : (
                <Check className="text-primary-foreground h-3 w-3" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
