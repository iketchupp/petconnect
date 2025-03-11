'use client';

import { redirect } from 'next/navigation';
import { LogIn, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function UserNav() {
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
