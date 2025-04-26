import Image from 'next/image';
import { Edit, MapPin, MoreVertical, Phone, Trash } from 'lucide-react';

import { Shelter } from '@/types/api';
import { getWebsiteUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ShelterManageCardProps {
  shelter: Shelter;
  onEdit: (shelterId: string) => void;
  onDelete: (shelterId: string) => void;
}

export function ShelterManageCard({ shelter, onEdit, onDelete }: ShelterManageCardProps) {
  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden p-0 transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg">
      <div className="relative">
        <Image
          src={shelter.avatarUrl || 'https://placehold.co/300x400?text=No+image'}
          alt={shelter.name}
          width={400}
          height={300}
          className="h-48 w-full object-cover"
        />
        <Badge variant="outline" className="bg-background/80 absolute bottom-2 left-2 flex items-center gap-1">
          Shelter
        </Badge>
      </div>

      <CardContent className="flex-1 space-y-4 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{shelter.name}</h3>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-muted-foreground flex items-start text-sm">
            <MapPin className="mr-2 mt-1 h-4 w-4 shrink-0" />
            <span>
              {shelter.address.city}, {shelter.address.region}, {shelter.address.country}
            </span>
          </div>

          {shelter.phone && (
            <div className="text-muted-foreground flex items-center text-sm">
              <Phone className="mr-2 h-4 w-4" />
              {shelter.phone}
            </div>
          )}
        </div>

        <Separator />

        <div>
          <p className="line-clamp-3 text-sm">{shelter.description}</p>
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex p-4">
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive/10 flex-1"
          onClick={(e) => {
            e.preventDefault();
            onDelete(shelter.id);
          }}
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
