'use client';

import Image from 'next/image';
import Link from 'next/link';
import dog from '@/assets/images/dog.jpg';
import { useAuthStore } from '@/stores/auth-store';

import { Button } from '@/components/ui/button';

export function Hero() {
  const { isAuthenticated } = useAuthStore();
  const listPetPath = isAuthenticated() ? '/user/pets' : '/auth/login';

  return (
    <section className="from-background to-muted/30 relative w-full overflow-hidden bg-gradient-to-b py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-4 text-center lg:text-left">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Find Your Perfect <span className="text-primary">Pet Companion</span>
              </h1>
              <p className="text-muted-foreground mx-auto max-w-[600px] text-base/relaxed lg:mx-0 lg:text-lg">
                Browse among pets waiting for a new owner or put your own pet up for adoption. Connect with shelters and
                pet owners to give animals a loving home.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row sm:justify-center lg:justify-start">
              <Button size="lg" asChild>
                <Link href="/pets">Find a Pet</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={listPetPath}>List Your Pet</Link>
              </Button>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="overflow-hidden rounded-lg shadow-xl">
              <Image
                src={dog}
                alt="Happy dog waiting for adoption"
                className="aspect-square w-full max-w-[500px] object-cover transition-transform duration-500 hover:scale-105 lg:aspect-video"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
