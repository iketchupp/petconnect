import { BadgeCheck, CheckCircle, ChevronLeft, Clock, MapPin, PawPrint } from 'lucide-react';

import { PetStatus } from '@/types/api';
import { MessageDTO } from '@/types/api/message';
import { formatLocalDate } from '@/lib/date';
import { getFullName } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface ChatHeaderProps {
  currentPartner: MessageDTO['sender'] | null;
  currentPet: MessageDTO['pet'];
  isOwner: boolean;
  onUpdatePetStatus: (status: PetStatus) => void;
  onAdoptPet: () => void;
  onGetFullAddress: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function ChatHeader({
  currentPartner,
  currentPet,
  isOwner,
  onUpdatePetStatus,
  onAdoptPet,
  onGetFullAddress,
  showBackButton,
  onBack,
}: ChatHeaderProps) {
  return (
    <div className="bg-background sticky top-0 z-10 flex items-center justify-between border-b p-3 xl:p-4">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-1 h-8 w-8 xl:hidden"
            onClick={onBack}
            aria-label="Back to conversations"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar>
          {currentPartner?.avatarUrl ? (
            <AvatarImage src={currentPartner.avatarUrl} alt={currentPartner ? getFullName(currentPartner) : 'User'} />
          ) : (
            <AvatarFallback>{currentPartner?.firstName?.charAt(0) || '?'}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <h3 className="font-medium">{currentPartner ? getFullName(currentPartner) : 'User'}</h3>
          {currentPet && (
            <div className="flex items-center gap-1 text-sm">
              <PawPrint className="h-3 w-3" />
              <HoverCard>
                <HoverCardTrigger asChild>
                  <span className="cursor-pointer hover:underline">{currentPet.name}</span>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      {currentPet.imageUrls && currentPet.imageUrls.length > 0 && (
                        <img
                          src={currentPet.imageUrls[0]}
                          alt={currentPet.name}
                          className="h-16 w-16 rounded-md object-cover"
                        />
                      )}
                      <div>
                        <h4 className="font-medium">{currentPet.name}</h4>
                        <p className="text-muted-foreground text-sm">
                          {currentPet.species} • {currentPet.breed}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Gender:</span>
                        <span>{currentPet.gender}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Birth Date:</span>
                        <span>{formatLocalDate(currentPet.birthDate)}</span>
                      </div>
                      {currentPet.shelterName && (
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Shelter:</span>
                          <span>{currentPet.shelterName}</span>
                        </div>
                      )}
                    </div>
                    {currentPet.description && (
                      <p className="text-muted-foreground line-clamp-3 text-sm">{currentPet.description}</p>
                    )}
                  </div>
                </HoverCardContent>
              </HoverCard>
              <Badge
                variant={
                  currentPet.status === PetStatus.AVAILABLE
                    ? 'default'
                    : currentPet.status === PetStatus.ADOPTED
                      ? 'secondary'
                      : 'outline'
                }
                className="ml-1 text-xs"
              >
                {currentPet.status}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {currentPet && (
        <div className="flex flex-col gap-0.5 xl:flex-row xl:gap-2">
          {isOwner && currentPet.status !== PetStatus.ADOPTED && (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                onUpdatePetStatus(currentPet.status === PetStatus.AVAILABLE ? PetStatus.PENDING : PetStatus.AVAILABLE)
              }
              className="flex"
            >
              {currentPet.status === PetStatus.AVAILABLE ? (
                <Clock className="mr-2 h-4 w-4" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              <span className="hidden xl:inline">
                {currentPet.status === PetStatus.AVAILABLE ? 'Mark as Pending' : 'Mark as Available'}
              </span>
              <span className="xl:hidden">{currentPet.status === PetStatus.AVAILABLE ? 'Pending' : 'Available'}</span>
            </Button>
          )}

          {!isOwner && (
            <Button
              size="sm"
              variant="outline"
              onClick={onAdoptPet}
              disabled={currentPet.status !== PetStatus.PENDING}
              className="flex"
            >
              <BadgeCheck className="mr-2 h-4 w-4" />
              <span className="hidden xl:inline">Mark as Adopted</span>
              <span className="xl:hidden">Adopted</span>
            </Button>
          )}

          {isOwner && (
            <Button
              size="sm"
              variant="outline"
              onClick={onGetFullAddress}
              disabled={currentPet.status === PetStatus.ADOPTED}
            >
              <MapPin className="mr-2 h-4 w-4" />
              <span className="hidden xl:inline">Reveal Address</span>
              <span className="xl:hidden">Address</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
