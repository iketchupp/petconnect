import { Address } from './address';

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
  ownerId?: string;
  createdAt: string;
  imageUrls: string[];
  address: Address;
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

export interface CreatePetData {
  name: string;
  description: string;
  species: string;
  breed: string;
  gender: string;
  birthDate: string;
  shelterId?: string;
  address?: {
    address1: string | number;
    address2?: string;
    city: string;
    region: string;
    postalCode: string | number;
    country: string;
    lat?: number;
    lng?: number;
  };
}
