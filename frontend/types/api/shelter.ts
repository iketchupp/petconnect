import { Address } from './address';

export interface Shelter {
  id: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  ownerId: string;
  avatarUrl: string;
  address: Address;
  createdAt: Date;
}

export interface SheltersResponse {
  shelters: Shelter[];
  totalCount: number;
  nextCursor?: string;
  hasMore: boolean;
}

export interface CreateShelterData {
  name: string;
  description: string;
  phone: string;
  email: string;
  website?: string;
  address: {
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
