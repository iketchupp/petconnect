'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { Dog, Loader2, Plus } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';

import { deletePet, getUserPets } from '@/actions/pets';
import { PetsResponse } from '@/types/api';
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
import { PetManageCard } from '@/components/app/pets/manage/pet-manage-card';
import { Loading } from '@/components/loading';

export default function UserPetsPage() {
  const router = useRouter();
  const { ref, inView } = useInView();
  const [petToDelete, setPetToDelete] = useState<string | null>(null);

  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status, refetch } = useInfiniteQuery({
    queryKey: ['userPets'],
    queryFn: async ({ pageParam }) => {
      return getUserPets(pageParam as string | undefined);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: PetsResponse) => lastPage.nextCursor,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePet,
    onSuccess: () => {
      toast.success('Pet deleted successfully');
      refetch();
      setPetToDelete(null);
    },
    onError: (error) => {
      toast.error('Failed to delete pet');
      console.error('Error deleting pet:', error);
      setPetToDelete(null);
    },
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleEdit = (petId: string) => {
    router.push(`/user/pets/${petId}/edit`);
  };

  const handleDelete = async (petId: string) => {
    setPetToDelete(petId);
  };

  const handleAddPet = () => {
    router.push('/user/pets/new');
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

  const pets = data.pages.flatMap((page) => page.pets);
  const totalCount = data.pages[0].totalCount;

  if (pets.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <Dog className="text-muted-foreground size-12" />
        <h2 className="text-lg font-semibold">No pets found</h2>
        <p className="text-muted-foreground">You haven&apos;t added any pets yet.</p>
        <Button onClick={handleAddPet}>
          <Plus className="mr-2 h-4 w-4" />
          Register Pet
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Dog className="text-muted-foreground mr-2 mt-1 size-4" />
            <span className="text-muted-foreground">
              Your pets: <strong>{totalCount}</strong>
            </span>
          </div>
          <Button onClick={handleAddPet}>
            <Plus className="mr-2 h-4 w-4" />
            Register Pet
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pets.map((pet) => (
            <PetManageCard key={pet.id} pet={pet} onEdit={handleEdit} onDelete={handleDelete} />
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

      <AlertDialog open={!!petToDelete} onOpenChange={(open) => !open && setPetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this pet?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your pet&apos;s profile and all associated
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants({ variant: 'destructive' }))}
              onClick={() => petToDelete && deleteMutation.mutate(petToDelete)}
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
