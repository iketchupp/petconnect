'use client';

import { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Filter, Loader2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

import { getShelters } from '@/actions/shelters';
import { SheltersResponse } from '@/types/api';
import { Button } from '@/components/ui/button';
import { ShelterCard } from '@/components/app/shelters/shelter-card';
import { ShelterFiltersComponent } from '@/components/app/shelters/shelter-filters';
import { ShelterFilters } from '@/components/app/shelters/shelter-filters/types';
import { Loading } from '@/components/loading';

export default function SheltersPage() {
  const { ref, inView } = useInView();
  const [filters, setFilters] = useState<ShelterFilters>({});

  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['shelters', filters],
    queryFn: async ({ pageParam }) => {
      return getShelters(pageParam as string | undefined, filters);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: SheltersResponse) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const shelters = data?.pages.flatMap((page) => page.shelters) || [];
  const totalCount = data?.pages[0]?.totalCount || 0;

  return (
    <main className="container mx-auto flex h-full flex-1 flex-col px-4 py-6">
      <div className="space-y-8">
        <ShelterFiltersComponent onFiltersChange={setFilters} initialFilters={filters} />

        {status === 'pending' ? (
          <Loading />
        ) : status === 'error' ? (
          <div className="text-center text-red-500">Error: {(error as Error).message}</div>
        ) : shelters.length === 0 ? (
          <div className="text-muted-foreground py-12 text-center">No shelters found matching your criteria</div>
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
                {shelters.map((shelter) => (
                  <ShelterCard key={shelter.id} shelter={shelter} />
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
