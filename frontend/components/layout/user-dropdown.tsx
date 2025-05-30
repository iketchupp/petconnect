'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { Heart, Home, LayoutDashboard, LogOut, MessageSquare, Monitor, Moon, PawPrint, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';

import { getAbbreviation } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserDropdownProps {
  children: React.ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
  align?: 'start' | 'center' | 'end' | undefined;
  sideOffset?: number;
}

export function UserDropdown({ children, side = 'right', sideOffset = 4, align = 'end' }: UserDropdownProps) {
  const { session, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  if (!session) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        align={align}
        forceMount
        side={side}
        sideOffset={sideOffset}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={session.avatarUrl} alt={session.username} />
              <AvatarFallback>{getAbbreviation(session.username)}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{session.fullName}</span>
              <span className="truncate text-xs">{session.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/user/pets">
              <PawPrint className="mr-2 size-4" />
              <span>My Pets</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/user/shelters">
              <Home className="mr-2 size-4" />
              <span>My Shelters</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/user/favorites">
              <Heart className="mr-2 size-4" />
              <span>Favorites</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/user/messages">
              <MessageSquare className="mr-2 size-4" />
              <span>Messages</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/user">
              <User className="mr-2 size-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="flex items-center">
          <DropdownMenuItem
            className="flex-1 hover:cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              logout();
            }}
          >
            <LogOut className="mr-2 size-4" />
            <span>Log out</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="ml-0.5 p-2 hover:cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              cycleTheme();
            }}
          >
            {theme === 'dark' ? (
              <Moon className="size-4" />
            ) : theme === 'light' ? (
              <Sun className="size-4" />
            ) : (
              <Monitor className="size-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
