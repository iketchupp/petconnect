import React from 'react';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { UserHeader } from '@/components/user/layout/header';
import { UserSidebar } from '@/components/user/layout/sidebar';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <UserSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col pb-2">
          <UserHeader />
          <div className="flex-1">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
