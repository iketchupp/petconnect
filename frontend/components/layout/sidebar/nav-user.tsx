'use client';

import { useAuthStore } from '@/stores/auth-store';
import { ChevronsUpDown } from 'lucide-react';

import { getAbbreviation } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import { UserDropdown } from '@/components/layout/user-dropdown';

export function NavUser() {
  const { session } = useAuthStore();
  const { isMobile } = useSidebar();

  if (!session) {
    return null;
  }

  return (
    <UserDropdown side={isMobile ? 'top' : 'right'} align={isMobile ? 'start' : undefined}>
      <SidebarMenuButton
        size="lg"
        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
      >
        <Avatar className="size-8 rounded-lg">
          <AvatarImage src={session.avatarUrl} />
          <AvatarFallback>{getAbbreviation(session.username)}</AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">{session.username}</span>
          <span className="truncate text-xs">{session.email}</span>
        </div>
        <ChevronsUpDown className="ml-auto size-4" />
      </SidebarMenuButton>
    </UserDropdown>
  );
}
