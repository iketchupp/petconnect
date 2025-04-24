import React from 'react';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { UserHeader } from '@/components/app/user/layout/header';
import { UserSidebar } from '@/components/app/user/layout/sidebar';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <UserSidebar />
      <SidebarInset>
        <div className="relative flex h-full flex-col">
          <UserHeader />
          <div className="flex-1 overflow-y-auto pb-2">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
