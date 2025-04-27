import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Home, MapPin, Pencil, Trash } from 'lucide-react';

import { getPetFullAddress } from '@/actions/pets';
import { Pet } from '@/types/api';
import { calculateAge } from '@/lib/date';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface PetManageCardProps {
  pet: Pet;
  onEdit: (petId: string) => void;
  onDelete: (petId: string) => void;
}

export function PetManageCard({ pet, onEdit, onDelete }: PetManageCardProps) {
  // Calculate age from birthDate
  const age = calculateAge(pet.birthDate);
  const ageText = age === 0 ? 'Less than 1 year' : `${age} year${age > 1 ? 's' : ''}`;

  const { data: address } = useQuery({
    queryKey: ['petAddress', pet.id],
    queryFn: () => getPetFullAddress(pet.id),
  });

  const isUserPet = !pet.shelterId;

  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden p-0 transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg">
      <div className="relative">
        <Image
          src={pet.imageUrls[0] || 'https://placehold.co/300x400?text=No+images'}
          alt={pet.name}
          width={400}
          height={300}
          className="h-48 w-full object-cover"
        />
        <Badge
          className={cn(
            'absolute left-2 top-2 bg-opacity-85',
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
              <Home className="mr-2 h-4 w-4" />
              Your registered pet
            </div>
          ) : (
            <div className="text-muted-foreground flex items-center text-sm">
              <Home className="mr-2 h-4 w-4" />
              {pet.shelterName || 'Shelter pet'}
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

      <CardFooter className="mt-auto flex p-4">
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive/10 flex-1"
          onClick={(e) => {
            e.preventDefault();
            onDelete(pet.id);
          }}
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
