import * as z from 'zod';

const addressSchema = z.object({
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  region: z.string().min(1, 'State/Province/Region is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const petFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  species: z.string().min(1, 'Species is required'),
  breed: z.string().min(1, 'Breed is required'),
  gender: z.enum(['Male', 'Female']),
  birthDate: z.string().min(1, 'Birth date is required'),
  shelterId: z.string().optional(),
  address: addressSchema.optional(),
});

export type PetFormValues = z.infer<typeof petFormSchema>;
