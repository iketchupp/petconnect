export interface Pet {
  id: string;
  name: string;
  description: string;
  species: string;
  breed: string;
  gender: string;
  birthDate: string;
  status: PetStatus;
  shelterId?: string;
  shelterName?: string;
  createdAt: string;
  imageUrls: string[];
}

export interface PetsResponse {
  pets: Pet[];
  nextCursor: string;
  hasMore: boolean;
  totalCount: number;
}

export enum PetStatus {
  AVAILABLE = 'AVAILABLE',
  ADOPTED = 'ADOPTED',
  PENDING = 'PENDING',
}
