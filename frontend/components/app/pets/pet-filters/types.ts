import * as z from 'zod';

import { PetFilters } from '@/actions/pets';

// Schema definition for filter form
export const filterFormSchema = z.object({
  searchQuery: z.string().optional(),
  species: z.string().nullable().optional(),
  breed: z.string().nullable().optional(),
  ageRange: z
    .object({
      min: z.number().min(0).max(240),
      max: z.number().min(0).max(240),
    })
    .optional(),
  gender: z.string().nullable().optional(),
  sortBy: z.enum(['newest', 'oldest', 'name_asc', 'name_desc', 'youngest', 'eldest', 'distance']).nullable().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  country: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
});

export type FilterFormValues = z.infer<typeof filterFormSchema>;

export interface PetFiltersProps {
  onFiltersChange: (filters: PetFilters) => void;
  initialFilters?: PetFilters;
}
