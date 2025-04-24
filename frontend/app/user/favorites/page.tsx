'use client';

import { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Heart, Loader2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

import { getFavoritedPets } from '@/actions/favorites';
import { PetsResponse } from '@/types/api';
import { Button } from '@/components/ui/button';
import { FavoritePetCard } from '@/components/app/pets/pet-favorite-card';
import { Loading } from '@/components/loading';

export default function FavoritesPage() {
  const { ref, inView } = useInView();

  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['favoritedPets'],
    queryFn: async ({ pageParam }) => {
      return getFavoritedPets(pageParam as string | undefined);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: PetsResponse) => lastPage.nextCursor,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === 'pending') {
    return <Loading />;
  }

  if (status === 'error') {
    return <div className="text-center text-red-500">Error: {(error as Error).message}</div>;
  }

  if (!data) {
    return null;
  }

  const pets = data.pages.flatMap((page) => page.pets);
  const totalCount = data.pages[0].totalCount;

  if (pets.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <Heart className="text-muted-foreground size-12" />
        <h2 className="text-lg font-semibold">No favorited pets</h2>
        <p className="text-muted-foreground">You haven&apos;t favorited any pets yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div className="space-y-2">
        <div className="flex items-center">
          <Heart className="text-muted-foreground mr-2 mt-1 size-4" />
          <span className="text-muted-foreground">
            Favorited pets: <strong>{totalCount}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pets.map((pet) => (
            <FavoritePetCard key={pet.id} pet={pet} />
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
    </div>
  );
}
