'use client';

import { useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const MAX_MESSAGE_LENGTH = 2000;

interface MessageInputProps {
  newMessage: string;
  isSending: boolean;
  disabled?: boolean;
  onMessageChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSendMessage: () => void;
}

export function MessageInput({
  newMessage,
  isSending,
  disabled,
  onMessageChange,
  onKeyDown,
  onSendMessage,
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';

      const scrollHeight = textarea.scrollHeight;
      // Shorter max height on mobile/tablet
      const maxHeight = window.innerWidth < 1200 ? 150 : 400;

      if (scrollHeight > maxHeight) {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.height = `${scrollHeight + 2}px`;
        textarea.style.overflowY = 'hidden';
      }
    }
  };

  useEffect(() => {
    adjustTextareaHeight();

    // Re-adjust on window resize
    const handleResize = () => adjustTextareaHeight();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [newMessage]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onMessageChange(e);
  };

  return (
    <div className="bg-background sticky bottom-0 z-10 border-t p-2 xl:p-4">
      <div className="flex w-full flex-col">
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            placeholder="Type a message..."
            value={newMessage}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            disabled={disabled}
            className="min-h-[40px] flex-1 resize-none break-all text-sm xl:text-base"
            maxLength={MAX_MESSAGE_LENGTH}
          />
          <Button
            onClick={onSendMessage}
            disabled={isSending || !newMessage.trim() || disabled}
            size="icon"
            className="h-10 w-10 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-muted-foreground mt-1 flex justify-end text-xs">
          {newMessage.length}/{MAX_MESSAGE_LENGTH} characters
        </div>
      </div>
    </div>
  );
}
