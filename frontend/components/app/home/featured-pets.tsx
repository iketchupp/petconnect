'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { getPets } from '@/actions/pets';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PetCard } from '@/components/app/pets/pet-card';

export function FeaturedPets() {
  const { data: petsData, isLoading } = useQuery({
    queryKey: ['featuredPets'],
    queryFn: () => getPets(undefined, { sortBy: 'newest' }, 4),
  });

  return (
    <section className="bg-background w-full py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Featured Pets</h2>
            <p className="text-muted-foreground max-w-[700px] text-base/relaxed">
              Meet some of our adorable pets waiting for their forever homes.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/pets">View All Pets</Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="h-48 w-full rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            ))
          ) : petsData?.pets && petsData.pets.length > 0 ? (
            petsData.pets.map((pet) => <PetCard key={pet.id} pet={pet} />)
          ) : (
            <div className="col-span-full text-center">
              <p className="text-muted-foreground">No pets available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
