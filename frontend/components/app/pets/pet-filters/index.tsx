import { useCallback, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SlidersHorizontal } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { getLocationLabel } from '@/actions/locations';
import { PetFilters } from '@/actions/pets';
import { getLocationErrorMessage } from '@/lib/utils';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import { useLocation } from '@/hooks/use-location';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SearchBar } from '@/components/filters/search-bar';

import { ActiveFilters } from './active-filters';
import { FilterForm } from './filter-form';
import { filterFormSchema, FilterFormValues, PetFiltersProps } from './types';

export function PetFiltersComponent({ onFiltersChange, initialFilters }: PetFiltersProps) {
  // Search input state with debounce
  const { searchValue, handleSearchChange } = useDebouncedSearch({
    initialValue: initialFilters?.searchQuery || '',
    onSearch: (value) => {
      const formValues = form.getValues();
      formValues.searchQuery = value;
      const formattedData = Object.fromEntries(
        Object.entries(formValues).map(([key, val]) => [key, val === null || val === 'null' ? undefined : val])
      );
      onFiltersChange(formattedData as PetFilters);
    },
  });

  // Use the location hook
  const {
    locationError,
    isGettingLocation,
    locationLabel,
    showLocationLabel,
    handleSortChange: handleLocationSortChange,
    clearLocation,
  } = useLocation({
    initialSortBy: initialFilters?.sortBy,
    initialLatitude: initialFilters?.latitude,
    initialLongitude: initialFilters?.longitude,
    onLocationChange: ({ sortBy, latitude, longitude }) => {
      form.setValue(
        'sortBy',
        sortBy === 'distance' ? 'distance' : sortBy ? (sortBy as typeof filterFormSchema._type.sortBy) : null
      );
      form.setValue('latitude', latitude);
      form.setValue('longitude', longitude);
    },
  });

  // Form setup with zod validation
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterFormSchema),
    defaultValues: {
      searchQuery: initialFilters?.searchQuery || '',
      species: initialFilters?.species || null,
      breed: initialFilters?.breed || null,
      ageRange: initialFilters?.ageRange || { min: 0, max: 240 },
      gender: initialFilters?.gender || null,
      sortBy: initialFilters?.sortBy || null,
      latitude: initialFilters?.latitude,
      longitude: initialFilters?.longitude,
      country: initialFilters?.country || null,
      city: initialFilters?.city || null,
    },
  });

  // Reset breed when species changes
  const selectedSpecies = form.watch('species');
  useEffect(() => {
    if (form.getValues('breed') && (selectedSpecies === null || selectedSpecies === 'null')) {
      form.setValue('breed', null);
    }
  }, [selectedSpecies, form]);

  // Reset city when country changes or is deselected
  const selectedCountry = form.watch('country');
  useEffect(() => {
    const currentCity = form.getValues('city');
    if (currentCity && (selectedCountry === null || selectedCountry === 'null')) {
      form.setValue('city', null);
    }
  }, [selectedCountry, form]);

  // Wrapper for sort change to handle both form values and location hook
  const handleSortChange = useCallback(
    async (value: string) => {
      await handleLocationSortChange(value);
    },
    [handleLocationSortChange]
  );

  // Form submission handler
  const onSubmit = useCallback(
    (data: FilterFormValues) => {
      const formValues = { ...data, searchQuery: searchValue };
      // Format for API by removing null values
      const formattedData = Object.fromEntries(
        Object.entries(formValues).map(([key, val]) => [key, val === null || val === 'null' ? undefined : val])
      );
      onFiltersChange(formattedData as PetFilters);
    },
    [searchValue, onFiltersChange]
  );

  // Clear location data when clearing filters
  const clearAllFilters = useCallback(() => {
    handleSearchChange('');
    clearLocation();
    form.reset({
      searchQuery: '',
      species: null,
      breed: null,
      ageRange: { min: 0, max: 240 },
      gender: null,
      sortBy: null,
      latitude: undefined,
      longitude: undefined,
      country: null,
      city: null,
    });
    onFiltersChange({});
  }, [form, onFiltersChange, handleSearchChange, clearLocation]);

  const removeFilter = useCallback(
    (key: keyof FilterFormValues) => {
      if (key === 'searchQuery') {
        handleSearchChange('');
      }

      if (key === 'ageRange') {
        form.setValue(key, { min: 0, max: 240 });
      } else if (key === 'sortBy') {
        form.setValue(key, null);
        if (form.getValues('sortBy') === 'distance') {
          clearLocation();
        }
      } else {
        form.setValue(key, key === 'searchQuery' ? '' : null);
      }

      const formValues = form.getValues();
      if (key === 'searchQuery') {
        formValues.searchQuery = '';
      } else {
        formValues.searchQuery = searchValue;
      }

      const formattedData = Object.fromEntries(
        Object.entries(formValues).map(([k, val]) => [k, val === null || val === 'null' ? undefined : val])
      );

      onFiltersChange(formattedData as PetFilters);
    },
    [form, searchValue, onFiltersChange, handleSearchChange, clearLocation]
  );

  // Get active filters for display
  const activeFilters = Object.entries({
    ...initialFilters,
    searchQuery: initialFilters?.searchQuery || '',
  }).filter(([key, value]) => {
    if (key === 'latitude' || key === 'longitude') return false;
    if (key === 'ageRange') {
      const ageRange = value as { min: number; max: number } | null;
      return ageRange && (ageRange.min !== 0 || ageRange.max !== 240);
    }
    return value !== undefined && value !== '' && value !== null && value !== 'null';
  });

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className="space-y-4">
      {/* Search bar and filter button */}
      <div className="flex items-center gap-2">
        <SearchBar value={searchValue} onChange={handleSearchChange} placeholder="Search pets..." />

        {/* Filter sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className={hasActiveFilters ? 'relative' : undefined}>
              <SlidersHorizontal className="h-4 w-4" />
              {hasActiveFilters && (
                <span className="bg-primary text-primary-foreground absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px]">
                  {activeFilters.length}
                </span>
              )}
              <span className="sr-only">Filter</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="flex h-full flex-col overflow-hidden">
            <SheetHeader>
              <SheetTitle>Filter Pets</SheetTitle>
              <SheetDescription>Narrow down your search with these filters</SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto py-4">
              <FilterForm
                form={form}
                onSubmit={onSubmit}
                onClearAll={clearAllFilters}
                hasActiveFilters={hasActiveFilters}
                handleSortChange={handleSortChange}
                isGettingLocation={isGettingLocation}
                locationError={locationError}
                locationLabel={locationLabel}
                showLocationLabel={showLocationLabel}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active filters display */}
      <ActiveFilters activeFilters={activeFilters} onRemoveFilter={removeFilter} onClearAll={clearAllFilters} />
    </div>
  );
}
