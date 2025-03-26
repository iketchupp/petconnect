import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { bookmarkPet, getPetIsBookmarked, getPetOwner, unBookmarkPet } from '@/actions/pets';
import { useAuthStore } from '@/stores/auth-store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bookmark, MapPin, MessageCircle, User } from 'lucide-react';
import { toast } from 'sonner';

import { Pet, PetStatus } from '@/types/api';
import { getFullName } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

interface PetCardProps extends Pet {}

export function PetCard({ pet }: { pet: PetCardProps }) {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  // Calculate age from birthDate
  const age = new Date().getFullYear() - new Date(pet.birthDate).getFullYear();
  const ageText = age === 0 ? 'Less than 1 year' : `${age} year${age > 1 ? 's' : ''}`;

  const { data: petOwner } = useQuery({
    queryKey: ['petOwner', pet.id],
    queryFn: () => getPetOwner(pet.id),
  });

  const { data: isBookmarked } = useQuery({
    queryKey: ['petBookmark', pet.id],
    queryFn: () => getPetIsBookmarked(pet.id),
    enabled: isAuthenticated,
  });

  const bookmarkMutation = useMutation({
    mutationFn: bookmarkPet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petBookmark', pet.id] });
    },
    onError: () => {
      toast.error('Failed to bookmark pet');
    },
  });

  const unbookmarkMutation = useMutation({
    mutationFn: unBookmarkPet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petBookmark', pet.id] });
    },
    onError: () => {
      toast.error('Failed to unbookmark pet');
    },
  });

  const handleBookmarkToggle = () => {
    if (isBookmarked) {
      unbookmarkMutation.mutate(pet.id);
    } else {
      bookmarkMutation.mutate(pet.id);
    }
  };

  return (
    <Card className="-py-6 flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative">
        <Image
          src={pet.imageUrls[0] || 'https://placehold.co/300x400?text=No+images'}
          alt={pet.name}
          width={400}
          height={300}
          className="h-48 w-full object-cover"
        />
        {isAuthenticated && (
          <Button
            variant="ghost"
            size="icon"
            className="bg-background/80 absolute right-2 top-2 rounded-full"
            onClick={handleBookmarkToggle}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        )}
      </div>

      <CardContent className="flex-1 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{pet.name}</h3>
            <p className="text-muted-foreground text-sm">
              {pet.breed}, {ageText}
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            {pet.species}
          </Badge>
        </div>
        {pet.shelterName ? (
          <div className="text-muted-foreground mt-2 flex items-center text-sm">
            <MapPin className="mr-1 mt-0.5 h-3 w-3" />
            {pet.shelterName}
          </div>
        ) : (
          <div className="text-muted-foreground mt-2 flex items-center text-sm">
            <User className="mr-1 mt-0.5 h-3 w-3" />
            {petOwner && getFullName(petOwner)}
          </div>
        )}
        <p className="mt-2 line-clamp-2 text-sm">{pet.description}</p>
      </CardContent>

      <CardFooter className="mt-auto flex justify-between p-4 pt-0">
        <Button variant="outline" size="sm">
          <MessageCircle className="mr-2 h-4 w-4" />
          Message
        </Button>
        <Button size="sm">Details</Button>
      </CardFooter>
    </Card>
  );
}
