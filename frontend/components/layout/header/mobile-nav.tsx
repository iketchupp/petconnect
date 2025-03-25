'use client';

import { useState } from 'react';
import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';
import { PawPrint } from 'lucide-react';

import { navConfig } from '@/config/nav.config';
import { siteConfig } from '@/config/site.config';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Icons } from '@/components/icons';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <svg strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-5">
            <path
              d="M3 5H11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M3 12H16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M3 19H21"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-4 pr-0">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <MobileLink href="/" className="flex items-center gap-2" onOpenChange={setOpen}>
          {/* <Icons.logo width={16} height={16} className="mr-2 rounded" /> */}
          <div className="rounded-sm bg-white p-1">
            <PawPrint className="size-4 text-black" />
          </div>
          <span className="font-bold">{siteConfig.name}</span>
        </MobileLink>
        <ScrollArea className="my-2 h-[calc(100vh-8rem)] pb-6 pl-4">
          <div className="flex flex-col space-y-3">
            {navConfig.main.map((navItem) => (
              <MobileLink key={navItem.href} href={navItem.href} onOpenChange={setOpen}>
                {navItem.title}
              </MobileLink>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

function MobileLink({ href, onOpenChange, className, children, ...props }: MobileLinkProps) {
  const router = useRouter();
  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString());
        onOpenChange?.(false);
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Link>
  );
}
