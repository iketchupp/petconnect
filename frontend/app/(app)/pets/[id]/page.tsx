'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Heart, Home, MapPin, MessageCircle, User } from 'lucide-react';
import { toast } from 'sonner';

import { favoritePet, getPetIsFavorited, unFavoritePet } from '@/actions/favorites';
import { getPetAddress, getPetById, getPetOwner } from '@/actions/pets';
import { calculateAge, formatLocalDate } from '@/lib/date';
import { cn, getFullName } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { MessageModal } from '@/components/app/user/messages/message-modal';
import { ImageOverlay } from '@/components/image-overlay';
import { Loading } from '@/components/loading';

export default function PetDetailsPage() {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const petId = (Array.isArray(id) ? id[0] : id) as string;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();
  const isLoggedIn = isAuthenticated();

  // Fetch pet details
  const {
    data: pet,
    isLoading: isLoadingPet,
    error: petError,
  } = useQuery({
    queryKey: ['pet', petId],
    queryFn: () => getPetById(petId),
    enabled: !!petId,
  });

  // Fetch pet owner details
  const { data: petOwner } = useQuery({
    queryKey: ['petOwner', petId],
    queryFn: () => getPetOwner(petId),
    enabled: !!petId,
  });

  // Fetch pet address
  const { data: address } = useQuery({
    queryKey: ['petAddress', petId],
    queryFn: () => getPetAddress(petId),
    enabled: !!petId,
  });

  // Fetch favorite status
  const { data: isFavorited, isLoading: isFavoritedLoading } = useQuery({
    queryKey: ['petFavorite', petId],
    queryFn: () => getPetIsFavorited(petId),
    enabled: !!petId && isLoggedIn,
  });

  // Favorite pet
  const favoriteMutation = useMutation({
    mutationFn: favoritePet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petFavorite', petId] });
    },
  });

  const unfavoriteMutation = useMutation({
    mutationFn: unFavoritePet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petFavorite', petId] });
    },
  });

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error('Please log in to favorite pets');
      return;
    }
    if (isFavorited) {
      unfavoriteMutation.mutate(petId);
    } else {
      favoriteMutation.mutate(petId);
    }
  };

  if (isLoadingPet) {
    return <Loading />;
  }

  if (petError || !pet) {
    return (
      <div className="container mx-auto flex h-full flex-1 flex-col items-center justify-center px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Pet Not Found</h1>
          <p className="text-muted-foreground mt-2">The pet you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  // Calculate age
  const age = calculateAge(pet.birthDate);
  const ageText = age === 0 ? 'Less than 1 year' : `${age} year${age > 1 ? 's' : ''}`;

  return (
    <>
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column - Main Image */}
          <div className="md:col-span-2">
            <Card className="overflow-hidden py-0">
              <CardContent className="p-6">
                <Carousel className="w-full">
                  <CarouselContent>
                    {pet.imageUrls.map((imageUrl, index) => (
                      <CarouselItem key={index}>
                        <div
                          className="relative aspect-video cursor-pointer overflow-hidden rounded-lg"
                          onClick={() => setSelectedImage(imageUrl)}
                        >
                          <img
                            src={imageUrl}
                            alt={`${pet.name} - Image ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {pet.imageUrls.length > 1 && (
                    <>
                      <CarouselPrevious className="left-2" />
                      <CarouselNext className="right-2" />
                    </>
                  )}
                </Carousel>

                <Separator className="my-6" />

                <div>
                  <h2 className="mb-4 text-xl font-semibold">About {pet.name}</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap text-sm">{pet.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Pet Info */}
          <div>
            <Card className="py-0">
              <CardContent className="space-y-6 p-6">
                {/* Header with Available Badge */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{pet.name}</h1>
                    <p className="text-muted-foreground text-sm">
                      {pet.breed} • {pet.species}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      pet.status === 'AVAILABLE'
                        ? 'bg-green-500 text-white'
                        : pet.status === 'ADOPTED'
                          ? 'bg-blue-500 text-white'
                          : 'bg-yellow-500 text-white'
                    )}
                  >
                    {pet.status === 'AVAILABLE'
                      ? 'Available'
                      : pet.status === 'ADOPTED'
                        ? 'Adopted'
                        : pet.status === 'PENDING'
                          ? 'Pending'
                          : pet.status}
                  </Badge>
                </div>

                <Separator />

                {/* Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground text-sm">Gender</p>
                      <p className="font-medium">{pet.gender}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Age</p>
                      <p className="font-medium">{ageText}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="text-muted-foreground h-4 w-4" />
                      <span className="text-muted-foreground text-sm">Birth Date</span>
                    </div>
                    <p className="font-medium">{formatLocalDate(pet.birthDate)}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="text-muted-foreground h-4 w-4" />
                      <span className="text-muted-foreground text-sm">Location</span>
                    </div>
                    {address && <p className="font-medium">{address.formattedAddress}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {pet.shelterId ? (
                        <Home className="text-muted-foreground h-4 w-4" />
                      ) : (
                        <User className="text-muted-foreground h-4 w-4" />
                      )}
                      <span className="text-muted-foreground text-sm">Listed by</span>
                    </div>
                    {pet.shelterId ? (
                      <p className="font-medium">{pet.shelterName}</p>
                    ) : (
                      petOwner && <p className="font-medium">{getFullName(petOwner)}</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <MessageModal pet={pet} recipient={petOwner} variant="default" fullWidth />
                  <Button
                    variant="outline"
                    className={cn('w-full', isFavorited && 'bg-secondary')}
                    onClick={handleFavoriteToggle}
                    disabled={
                      !isLoggedIn || isFavoritedLoading || favoriteMutation.isPending || unfavoriteMutation.isPending
                    }
                    title={!isLoggedIn ? 'Please log in to favorite pets' : ''}
                  >
                    <Heart className={cn('mr-2 h-4 w-4', isFavorited && 'fill-current')} />
                    {!isLoggedIn ? 'Log in to Favorite' : isFavorited ? 'Favorited' : 'Favorite'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Overlay */}
      {selectedImage && (
        <ImageOverlay
          images={pet.imageUrls}
          initialIndex={pet.imageUrls.indexOf(selectedImage)}
          alt={pet.name}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}
