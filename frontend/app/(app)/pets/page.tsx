'use client';

import { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Filter, Loader2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

import { getPets, PetFilters } from '@/actions/pets';
import { PetsResponse } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/loading';
import { PetCard } from '@/components/pets/pet-card';
import { PetFiltersComponent } from '@/components/pets/pet-filters';

export default function PetsPage() {
  const { ref, inView } = useInView();
  const [filters, setFilters] = useState<PetFilters>({});

  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status, refetch } = useInfiniteQuery({
    queryKey: ['pets', filters],
    queryFn: async ({ pageParam }) => {
      return getPets(pageParam as string | undefined, filters);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: PetsResponse) => lastPage.nextCursor,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const pets = data?.pages.flatMap((page) => page.pets) || [];
  const totalCount = data?.pages[0]?.totalCount || 0;

  return (
    <main className="container mx-auto flex h-full flex-1 flex-col px-4 py-6">
      <div className="space-y-8">
        <PetFiltersComponent onFiltersChange={setFilters} initialFilters={filters} />

        {status === 'pending' ? (
          <Loading />
        ) : status === 'error' ? (
          <div className="text-center text-red-500">Error: {(error as Error).message}</div>
        ) : pets.length === 0 ? (
          <div className="text-muted-foreground py-12 text-center">No pets found matching your criteria</div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center">
                <Filter className="text-muted-foreground mr-2 mt-1 size-4" />
                <span className="text-muted-foreground">
                  Results: <strong>{totalCount}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {pets.map((pet) => (
                  <PetCard key={pet.id} pet={pet} />
                ))}
              </div>
            </div>

            <div ref={ref} className="flex justify-center">
              {hasNextPage && (
                <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading more...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
