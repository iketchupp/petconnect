'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';

import { Button } from '@/components/ui/button';

export function CallToAction() {
  const { isAuthenticated } = useAuthStore();
  const isLoggedIn = isAuthenticated();

  return (
    <section className="bg-muted/60 relative w-full py-12 md:py-16 lg:py-20">
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to Find Your Perfect Pet?
            </h2>
            <p className="text-muted-foreground mx-auto max-w-[700px] text-base/relaxed md:text-lg">
              Start your journey to find a new pet or help an animal find a loving home by listing your pet for
              adoption.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Button size="lg" asChild>
              <Link href="/pets">Browse Pets</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              {isLoggedIn ? <Link href="/user/pets">List Your Pet</Link> : <Link href="/auth/login">Log In</Link>}
            </Button>
          </div>
        </div>
      </div>
      <div className="from-background/80 to-muted/90 absolute inset-0 z-0 bg-gradient-to-b opacity-50"></div>
    </section>
  );
}
