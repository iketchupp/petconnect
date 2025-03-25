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
