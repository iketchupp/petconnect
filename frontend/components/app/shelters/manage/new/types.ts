import { isValidPhoneNumber } from 'react-phone-number-input';
import * as z from 'zod';

export const shelterFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine(isValidPhoneNumber, { message: 'Please enter a valid phone number' }),
  email: z.string().email('Invalid email address'),
  website: z.string().url('Invalid website URL').or(z.literal('')).optional(),
  address: z.object({
    address1: z.string().min(1, 'Address line 1 is required'),
    address2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    region: z.string().min(1, 'Region/State is required'),
    postalCode: z.string().min(1, 'Postal/ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
});

export type ShelterFormValues = z.infer<typeof shelterFormSchema>;
