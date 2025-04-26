'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { UserHeader } from '@/components/app/user/layout/header';
import { UserSidebar } from '@/components/app/user/layout/sidebar';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/?error=unauthorized');
    }
  }, [isLoading, session, router]);

  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <UserSidebar />
      <SidebarInset className="border">
        <div className="relative flex h-full flex-col rounded-lg">
          <UserHeader />
          <div className="flex-1 overflow-y-auto rounded-b-lg">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
