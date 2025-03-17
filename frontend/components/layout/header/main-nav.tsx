'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PawPrint } from 'lucide-react';

import { navConfig } from '@/config/nav.config';
import { siteConfig } from '@/config/site.config';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-4 flex items-center space-x-2 lg:mr-6">
        <div className="rounded-sm bg-white p-1">
          <PawPrint className="size-4 text-black" />
        </div>
        <span className="hidden font-bold lg:inline-block">{siteConfig.name}</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm lg:gap-6">
        {navConfig.main.map((navItem) => {
          return (
            <Link
              key={navItem.href}
              href={navItem.href}
              className={cn(
                'hover:text-foreground/80 transition-colors',
                pathname === navItem.href ? 'text-foreground' : 'text-foreground/60'
              )}
              target={navItem.title === 'Invite' ? '_blank' : '_self'}
            >
              {navItem.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
