'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { Home, Loader2, Plus } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';

import { deleteShelter, getUserShelters } from '@/actions/shelters';
import { SheltersResponse } from '@/types/api';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Loading } from '@/components/loading';
import { ShelterManageCard } from '@/components/shelters/manage/shelter-manage-card';

export default function UserSheltersPage() {
  const router = useRouter();
  const { ref, inView } = useInView();
  const [shelterToDelete, setShelterToDelete] = useState<string | null>(null);

  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status, refetch } = useInfiniteQuery({
    queryKey: ['userShelters'],
    queryFn: async ({ pageParam }) => {
      return getUserShelters(pageParam as string | undefined);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: SheltersResponse) => lastPage.nextCursor,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteShelter,
    onSuccess: () => {
      toast.success('Shelter deleted successfully');
      refetch();
      setShelterToDelete(null);
    },
    onError: (error) => {
      toast.error('Failed to delete shelter');
      console.error('Error deleting shelter:', error);
      setShelterToDelete(null);
    },
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleEdit = (shelterId: string) => {
    router.push(`/user/shelters/${shelterId}/edit`);
  };

  const handleDelete = async (shelterId: string) => {
    setShelterToDelete(shelterId);
  };

  const handleAddShelter = () => {
    router.push('/user/shelters/new');
  };

  if (status === 'pending') {
    return <Loading />;
  }

  if (status === 'error') {
    return <div className="text-center text-red-500">Error: {(error as Error).message}</div>;
  }

  if (!data) {
    return null;
  }

  const shelters = data.pages.flatMap((page) => page.shelters);
  const totalCount = data.pages[0].totalCount;

  if (shelters.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <Home className="text-muted-foreground size-12" />
        <h2 className="text-lg font-semibold">No shelters found</h2>
        <p className="text-muted-foreground">You haven&apos;t registered any shelters yet.</p>
        <Button onClick={handleAddShelter}>
          <Plus className="mr-2 h-4 w-4" />
          Register Shelter
        </Button>
      </div>
    );
  }
  return (
    <>
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Home className="text-muted-foreground mr-2 mt-1 size-4" />
            <span className="text-muted-foreground">
              Your shelters: <strong>{totalCount}</strong>
            </span>
          </div>
          <Button onClick={handleAddShelter}>
            <Plus className="mr-2 h-4 w-4" />
            Register Shelter
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shelters.map((shelter) => (
            <ShelterManageCard key={shelter.id} shelter={shelter} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
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

      <AlertDialog open={!!shelterToDelete} onOpenChange={(open) => !open && setShelterToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this shelter?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your shelter&apos;s profile and all associated
              data, including any pets registered with this shelter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants({ variant: 'destructive' }))}
              onClick={() => shelterToDelete && deleteMutation.mutate(shelterToDelete)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
