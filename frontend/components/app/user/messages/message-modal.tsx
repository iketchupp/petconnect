import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useMutation } from '@tanstack/react-query';
import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

import { sendMessage } from '@/actions/message';
import { getPetOwner } from '@/actions/pets';
import { Pet, User } from '@/types/api';
import { cn, getFullName, getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

// Character limit for messages
const MAX_MESSAGE_LENGTH = 2000;

interface MessageModalProps {
  pet: Pet;
  recipient?: User;
  className?: string;
  buttonText?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  fullWidth?: boolean;
}

export function MessageModal({
  pet,
  recipient,
  className,
  buttonText = 'Message',
  variant = 'outline',
  size = 'sm',
  fullWidth = false,
}: MessageModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      try {
        // If we don't have a recipient, fetch the pet owner
        let targetRecipient = recipient;
        if (!targetRecipient) {
          targetRecipient = await getPetOwner(pet.id);
        }

        if (!targetRecipient) {
          throw new Error('Could not find a recipient for this message');
        }

        // Send the message
        await sendMessage({
          receiverId: targetRecipient.id,
          content: message,
          petId: pet.id,
          shelterId: pet.shelterId || undefined,
          sentAt: new Date().toISOString(),
        });

        // Close modal and navigate to messages
        setOpen(false);
        toast.success('Message sent');
        router.push(`/user/messages?userId=${targetRecipient.id}&petId=${pet.id}`);
      } catch (error) {
        console.error('Failed to send message:', error);
        toast.error('Failed to send message');
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleSend = () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    sendMessageMutation.mutate();
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated()) {
      toast.error('Please log in to send messages');
      router.push('/auth/login');
      return;
    }

    setOpen(true);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Limit message to MAX_MESSAGE_LENGTH characters
    const input = e.target.value;
    if (input.length <= MAX_MESSAGE_LENGTH) {
      setMessage(input);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant={variant}
        size={size}
        className={cn(fullWidth && 'w-full', className)}
        onClick={handleTriggerClick}
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        {buttonText}
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send a message about {pet.name}</DialogTitle>
          <DialogDescription>
            Your message will be sent to {pet.shelterId ? pet.shelterName : 'the owner'}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 py-2">
          <Avatar>
            {recipient?.avatarUrl ? (
              <AvatarImage src={recipient.avatarUrl} alt={getFullName(recipient)} />
            ) : (
              <AvatarFallback>{recipient ? getInitials(recipient) : '?'}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <p className="font-medium">
              {recipient ? getFullName(recipient) : pet.shelterId ? pet.shelterName : 'Owner'}
            </p>
            <p className="text-muted-foreground text-sm">
              About: {pet.name} ({pet.species})
            </p>
          </div>
        </div>

        <div className="mt-2">
          <Textarea
            placeholder="Write your message here..."
            value={message}
            onChange={handleMessageChange}
            rows={4}
            className="resize-none"
            maxLength={MAX_MESSAGE_LENGTH}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (message.trim()) {
                  handleSend();
                }
              }
            }}
          />
          <div className="text-muted-foreground mt-1 flex justify-end text-xs">
            {message.length}/{MAX_MESSAGE_LENGTH} characters
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSend} disabled={isLoading || !message.trim()}>
            {isLoading ? 'Sending...' : 'Send message'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
