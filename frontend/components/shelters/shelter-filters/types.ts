import * as z from 'zod';

export type ShelterSortOption = 'name_asc' | 'name_desc' | 'newest' | 'oldest' | 'distance';

export interface ShelterFilters {
  searchQuery?: string;
  sortBy?: ShelterSortOption;
  latitude?: number;
  longitude?: number;
  country?: string;
  city?: string;
}

export const SORT_LABELS: Record<ShelterSortOption, string> = {
  name_asc: 'Name (A-Z)',
  name_desc: 'Name (Z-A)',
  newest: 'Newest First',
  oldest: 'Oldest First',
  distance: 'Distance (Nearest)',
};

// Schema definition for filter form
export const shelterFormSchema = z.object({
  searchQuery: z.string().optional(),
  sortBy: z.enum(['name_asc', 'name_desc', 'newest', 'oldest', 'distance']).nullable().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  country: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
});

export type ShelterFormValues = z.infer<typeof shelterFormSchema>;

export interface ShelterFiltersProps {
  onFiltersChange: (filters: ShelterFilters) => void;
  initialFilters?: ShelterFilters;
}
