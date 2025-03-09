'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

export function HeaderBackground() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      className={cn(
        isScrolled
          ? 'border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur'
          : '',
        'absolute top-0 -z-50 -mx-4 h-12 min-w-full'
      )}
    />
  );
}
