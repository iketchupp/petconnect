import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart, Home, MapPin, MessageCircle, User } from 'lucide-react';
import { toast } from 'sonner';

import { favoritePet, getPetIsFavorited, unFavoritePet } from '@/actions/favorites';
import { getPetAddress, getPetOwner } from '@/actions/pets';
import { Pet, PetStatus } from '@/types/api';
import { calculateAge } from '@/lib/date';
import { cn, getFullName } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface FavoritePetCardProps {
  pet: Pet;
}

export function FavoritePetCard({ pet }: FavoritePetCardProps) {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  // Calculate age from birthDate
  const age = calculateAge(pet.birthDate);
  const ageText = age === 0 ? 'Less than 1 year' : `${age} year${age > 1 ? 's' : ''}`;

  const { data: petOwner } = useQuery({
    queryKey: ['petOwner', pet.id],
    queryFn: () => getPetOwner(pet.id),
  });

  const { data: address } = useQuery({
    queryKey: ['petAddress', pet.id],
    queryFn: () => getPetAddress(pet.id),
  });

  const { data: isFavorited } = useQuery({
    queryKey: ['petFavorite', pet.id],
    queryFn: () => getPetIsFavorited(pet.id),
    enabled: isAuthenticated,
  });

  const favoriteMutation = useMutation({
    mutationFn: favoritePet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petFavorite', pet.id] });
    },
    onError: () => {
      toast.error('Failed to favorite pet');
    },
  });

  const unfavoriteMutation = useMutation({
    mutationFn: unFavoritePet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petFavorite', pet.id] });
      queryClient.invalidateQueries({ queryKey: ['favoritedPets'] });
    },
    onError: () => {
      toast.error('Failed to unfavorite pet');
    },
  });

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the Link navigation when clicking the favorite button
    if (isFavorited) {
      unfavoriteMutation.mutate(pet.id);
    } else {
      favoriteMutation.mutate(pet.id);
    }
  };

  const isUserPet = !pet.shelterId;

  // Status display helper
  const getStatusDisplay = (status: PetStatus) => {
    switch (status) {
      case PetStatus.AVAILABLE:
        return { label: 'Available', className: 'bg-green-500 text-white' };
      case PetStatus.ADOPTED:
        return { label: 'Adopted', className: 'bg-blue-500 text-white' };
      case PetStatus.PENDING:
        return { label: 'Pending', className: 'bg-yellow-500 text-white' };
      default:
        return { label: status, className: 'bg-gray-500 text-white' };
    }
  };

  const statusInfo = getStatusDisplay(pet.status);

  return (
    <Link href={`/pets/${pet.id}`} className="block">
      <Card className="flex h-full flex-col gap-0 overflow-hidden p-0 transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg">
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
              onClick={handleFavoriteToggle}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
            </Button>
          )}
          <Badge className={cn('absolute left-2 top-2 bg-opacity-85', statusInfo.className)}>{statusInfo.label}</Badge>
          <Badge variant="outline" className="bg-background/80 absolute bottom-2 left-2 flex items-center gap-1">
            {pet.species}
          </Badge>
        </div>

        <CardContent className="flex-1 space-y-4 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{pet.name}</h3>
              <p className="text-muted-foreground text-sm">
                {pet.breed} • {ageText}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                {pet.gender}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            {isUserPet ? (
              <div className="text-muted-foreground flex items-center text-sm">
                <User className="mr-2 h-4 w-4" />
                Registered by {petOwner && getFullName(petOwner)}
              </div>
            ) : (
              <div className="text-muted-foreground flex items-center text-sm">
                <Home className="mr-2 h-4 w-4" />
                {pet.shelterName}
              </div>
            )}

            {address && (
              <div className="text-muted-foreground flex items-start text-sm">
                <MapPin className="mr-2 mt-1 h-4 w-4 shrink-0" />
                <span>{address.formattedAddress}</span>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <p className="line-clamp-3 text-sm">{pet.description}</p>
          </div>
        </CardContent>

        <CardFooter className="mt-auto flex justify-between p-4">
          <Button variant="outline" size="sm" className="w-full" onClick={(e) => e.preventDefault()}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Message
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
