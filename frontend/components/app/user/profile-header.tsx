'use client';

import { Camera } from 'lucide-react';
import { toast } from 'sonner';

import { User } from '@/types/api';
import { getAbbreviation } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileHeaderProps {
  session: User;
  isAvatarLoading: boolean;
  onFileSelect: (file: File) => void;
}

export function ProfileHeader({ session, isAvatarLoading, onFileSelect }: ProfileHeaderProps) {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 20MB)
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image size should be less than 20MB');
      return;
    }

    onFileSelect(file);
  };

  return (
    <div className="mb-6 flex flex-col items-center space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
      <div className="relative">
        <Avatar className="size-20 border shadow">
          <AvatarImage src={session.avatarUrl} alt={session.username} />
          <AvatarFallback>{getAbbreviation(session.username)}</AvatarFallback>
        </Avatar>
        <label
          htmlFor="avatar"
          className="bg-primary text-primary-foreground hover:bg-primary/90 absolute bottom-0 right-0 flex size-7 cursor-pointer items-center justify-center rounded-full"
        >
          <Camera className="size-3.5" />
          <input
            id="avatar"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isAvatarLoading}
          />
        </label>
      </div>
      <div className="flex h-full flex-col justify-center text-center sm:text-left">
        <h3 className="text-base font-semibold">
          {session.fullName} ({session.username})
        </h3>
        <p className="text-muted-foreground text-xs">{session.email}</p>
      </div>
    </div>
  );
}
