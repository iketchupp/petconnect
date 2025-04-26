'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Building, Calendar, Globe, Mail, MapPin, Phone, User } from 'lucide-react';

import { getShelterById, getShelterOwner, getShelterPets } from '@/actions/shelters';
import { formatLocalDate } from '@/lib/date';
import { cn, getFullName, getWebsiteUrl, stripProtocol } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PetCard } from '@/components/app/pets/pet-card';
import { Loading } from '@/components/loading';

export default function ShelterDetailPage() {
  const { id } = useParams();
  const shelterId = (Array.isArray(id) ? id[0] : id) as string;
  const [activeTab, setActiveTab] = useState<string>('info');

  // Fetch shelter details
  const {
    data: shelter,
    isLoading: isLoadingShelter,
    error: shelterError,
  } = useQuery({
    queryKey: ['shelter', shelterId],
    queryFn: () => getShelterById(shelterId),
    enabled: !!shelterId,
  });

  // Fetch shelter owner details
  const { data: owner, isLoading: isLoadingOwner } = useQuery({
    queryKey: ['shelterOwner', shelterId],
    queryFn: () => getShelterOwner(shelterId),
    enabled: !!shelterId,
  });

  // Fetch shelter pets with infinite scrolling
  const {
    data: petsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingPets,
  } = useInfiniteQuery({
    queryKey: ['shelterPets', shelterId],
    queryFn: ({ pageParam }) => getShelterPets(shelterId, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: !!shelterId && activeTab === 'pets',
  });

  if (isLoadingShelter) {
    return <Loading />;
  }

  if (shelterError || !shelter) {
    return (
      <div className="container mx-auto flex h-full flex-1 flex-col items-center justify-center px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Shelter Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The shelter you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const handleLoadMorePets = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Flatten the pets data from all pages
  const pets = petsData?.pages.flatMap((page) => page.pets) || [];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-6 md:flex-row">
        {/* Shelter Header Card */}
        <Card className="w-full py-0">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4 md:flex-row md:items-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={shelter.avatarUrl} alt={shelter.name} />
                <AvatarFallback className="text-lg">{shelter.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2 text-center md:text-left">
                <h1 className="text-2xl font-bold">{shelter.name}</h1>
                <div className="text-muted-foreground flex flex-wrap justify-center gap-4 text-sm md:justify-start">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatLocalDate(shelter.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Information</TabsTrigger>
          <TabsTrigger value="pets">Pets</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          {/* Shelter Information */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>Details about this shelter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap text-sm">{shelter.description}</p>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-medium">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" />
                      <span>{shelter.phone}</span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4" />
                      <span>{shelter.email}</span>
                    </div>
                    {shelter.website && (
                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4" />
                        <a
                          href={getWebsiteUrl(shelter.website)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {stripProtocol(shelter.website)}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Address</h3>
                  <div className="text-muted-foreground space-y-1 text-sm">
                    <p>{shelter.address.address1}</p>
                    {shelter.address.address2 && <p>{shelter.address.address2}</p>}
                    <p>
                      {shelter.address.city}, {shelter.address.region} {shelter.address.postalCode}
                    </p>
                    <p>{shelter.address.country}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Owner</h3>
                {isLoadingOwner ? (
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : owner ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={owner.avatarUrl} alt={getFullName(owner)} />
                      <AvatarFallback>{owner.firstName ? owner.firstName[0] : 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{getFullName(owner)}</p>
                      <p className="text-muted-foreground text-xs">{owner.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <User className="h-4 w-4" />
                    <span>ID: {shelter.ownerId}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Location</h3>
                <div className="relative h-64 w-full overflow-hidden rounded-lg">
                  {shelter.address.lat && shelter.address.lng ? (
                    <iframe
                      title={`${shelter.name} location`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${shelter.address.lat},${shelter.address.lng}&zoom=15`}
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <iframe
                      title={`${shelter.name} location`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(shelter.address.formattedAddress)}&zoom=15`}
                      allowFullScreen
                    ></iframe>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pets" className="space-y-6">
          {isLoadingPets ? (
            <div className="flex justify-center p-8">
              <Loading />
            </div>
          ) : pets.length === 0 ? (
            <Card className="p-6 text-center">
              <CardContent>
                <Building className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <h3 className="mb-2 text-lg font-medium">No Pets Available</h3>
                <p className="text-muted-foreground">This shelter doesn't have any pets listed right now.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {pets.map((pet) => (
                  <PetCard key={pet.id} pet={pet} />
                ))}
              </div>
              {hasNextPage && (
                <div className="mt-6 flex justify-center">
                  <Button onClick={handleLoadMorePets} disabled={isFetchingNextPage}>
                    {isFetchingNextPage ? 'Loading more...' : 'Load more pets'}
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
