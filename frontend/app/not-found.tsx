'use client';

import Link from 'next/link';
import { PawPrint } from 'lucide-react';

import { siteConfig } from '@/config/site.config';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="bg-primary/10 mb-6 rounded-sm p-3">
        <PawPrint className="text-primary size-8" />
      </div>

      <h1 className="mb-2 text-4xl font-bold tracking-tight">404</h1>
      <h2 className="mb-4 text-2xl font-medium">Page not found</h2>

      <p className="text-muted-foreground mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved to another location.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button asChild variant="default">
          <Link href="/">Return Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/contact">Contact Support</Link>
        </Button>
      </div>
    </div>
  );
}
