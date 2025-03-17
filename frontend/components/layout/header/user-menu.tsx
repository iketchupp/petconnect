'use client';

import { redirect } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { LogIn, UserPlus } from 'lucide-react';

import { getAbbreviation } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/kibo-ui/spinner';
import { UserDropdown } from '@/components/layout/user-dropdown';
import { Loading } from '@/components/loading';

export function UserMenu() {
  const { session, isLoading } = useAuthStore();

  if (!session && isLoading) {
    return <Spinner className="size-4" />;
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => redirect('/auth/login')}>
          <LogIn /> Login
        </Button>
        <Button size="sm" onClick={() => redirect('/auth/register')}>
          <UserPlus /> Register
        </Button>
      </div>
    );
  }

  return (
    <UserDropdown side="bottom" sideOffset={6}>
      <Button variant="ghost" className="relative size-8 rounded-full">
        <Avatar className="size-8">
          <AvatarImage src={session.avatarUrl} alt={session.username} />
          <AvatarFallback>{getAbbreviation(session?.username)}</AvatarFallback>
        </Avatar>
      </Button>
    </UserDropdown>
  );
}
