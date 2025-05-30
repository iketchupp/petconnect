import Link from 'next/link';
import { PawPrint } from 'lucide-react';

import { navConfig } from '@/config/nav.config';
import { siteConfig } from '@/config/site.config';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { NavUser } from '@/components/layout/sidebar/nav-user';

import { NavGroup } from './nav-group';

export function UserSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton asChild>
          <Link href="/" className="flex items-center">
            <div className="rounded-sm bg-white p-1">
              <PawPrint className="size-4 text-black" />
            </div>
            <span className="hidden font-bold lg:inline-block">{siteConfig.name}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent className="pl-1">
        <NavGroup
          label="Main"
          items={navConfig.sidebar.main.map((item) => ({
            title: item.title,
            href: `/user${item.href}`,
            icon: item.icon,
          }))}
        />
        <NavGroup
          items={navConfig.sidebar.secondary.map((item) => ({
            title: item.title,
            href: `/user${item.href}`,
            icon: item.icon,
          }))}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter className="pl-3">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
