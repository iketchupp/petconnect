import { ConversationDTO } from '@/types/api/message';
import { formatMessageTime } from '@/lib/date';
import { cn, getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ConversationProps {
  conversation: ConversationDTO;
  isSelected: boolean;
  onSelect: (conversation: ConversationDTO) => void;
}

export function Conversation({ conversation, isSelected, onSelect }: ConversationProps) {
  return (
    <div
      className="select-none"
      onClick={() => onSelect(conversation)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(conversation);
        }
      }}
    >
      <div
        className={cn(
          'hover:bg-offsetLight hover:bg-primary/5 active:bg-primary/10 group relative flex cursor-pointer flex-col items-start overflow-clip rounded-lg border border-transparent px-4 py-4 text-left text-sm transition-all hover:opacity-100',
          (isSelected || !conversation.hasUnread) && 'opacity-80 dark:opacity-50 dark:hover:opacity-80',
          isSelected && 'border-border bg-primary/5 opacity-100'
        )}
      >
        <div className="flex w-full items-center justify-between gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={conversation.otherUser.avatarUrl} alt={conversation.otherUser.fullName} />
            <AvatarFallback>{getInitials(conversation.otherUser)}</AvatarFallback>
          </Avatar>
          <div className="flex w-full justify-between">
            <div className="w-full">
              <div className="flex w-full flex-row items-center justify-between">
                <div className="flex flex-row items-center gap-1">
                  <p
                    className={cn(
                      conversation.hasUnread && !isSelected ? 'font-bold' : 'font-medium',
                      'text-md group-houver:opacity-100 flex items-baseline gap-1'
                    )}
                  >
                    <span className="max-w-[20ch] truncate">{conversation.otherUser.fullName}</span>
                    {conversation.hasUnread && !isSelected && (
                      <Badge variant="outline" className="ml-1">
                        New
                      </Badge>
                    )}
                  </p>
                </div>
                <p
                  className={cn(
                    'text-nowrap text-xs font-normal opacity-70 transition-opacity group-hover:opacity-100',
                    isSelected && 'opacity-100'
                  )}
                >
                  {formatMessageTime(conversation.lastMessageAt)}
                </p>
              </div>
              <p className="mt-1 line-clamp-2 break-all text-xs opacity-70 transition-opacity">
                {conversation.lastMessage}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
