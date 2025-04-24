import { useCallback, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SlidersHorizontal } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { getLocationLabel } from '@/actions/locations';
import { getLocationErrorMessage } from '@/lib/utils';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import { useLocation } from '@/hooks/use-location';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SearchBar } from '@/components/filters/search-bar';

import { ActiveFilters } from './active-filters';
import { FilterForm } from './filter-form';
import { ShelterFilters, shelterFormSchema, ShelterFormValues, ShelterSortOption } from './types';

interface ShelterFiltersProps {
  onFiltersChange: (filters: ShelterFilters) => void;
  initialFilters?: ShelterFilters;
}

export function ShelterFiltersComponent({ onFiltersChange, initialFilters }: ShelterFiltersProps) {
  // Search input state with debounce
  const { searchValue, handleSearchChange } = useDebouncedSearch({
    initialValue: initialFilters?.searchQuery || '',
    onSearch: (value) => {
      const formValues = form.getValues();
      formValues.searchQuery = value;
      const formattedData = Object.fromEntries(
        Object.entries(formValues).map(([key, val]) => [key, val === null || val === 'null' ? undefined : val])
      );
      onFiltersChange(formattedData as ShelterFilters);
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
      form.setValue('sortBy', sortBy as ShelterSortOption);
      form.setValue('latitude', latitude);
      form.setValue('longitude', longitude);
    },
  });

  // Form setup with zod validation
  const form = useForm<ShelterFormValues>({
    resolver: zodResolver(shelterFormSchema),
    defaultValues: {
      searchQuery: initialFilters?.searchQuery || '',
      sortBy: initialFilters?.sortBy || 'name_asc',
      latitude: initialFilters?.latitude,
      longitude: initialFilters?.longitude,
      country: initialFilters?.country || null,
      city: initialFilters?.city || null,
    },
  });

  // Reset city when country changes
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
    (data: ShelterFormValues) => {
      const formValues = { ...data, searchQuery: searchValue };
      // Format for API by removing null values
      const formattedData = Object.fromEntries(
        Object.entries(formValues).map(([key, val]) => [key, val === null || val === 'null' ? undefined : val])
      );
      onFiltersChange(formattedData as ShelterFilters);
    },
    [searchValue, onFiltersChange]
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    handleSearchChange('');
    clearLocation();
    form.reset({
      searchQuery: '',
      sortBy: 'name_asc',
      latitude: undefined,
      longitude: undefined,
      country: null,
      city: null,
    });
    onFiltersChange({ sortBy: 'name_asc' });
  }, [form, onFiltersChange, handleSearchChange, clearLocation]);

  // Remove a single filter
  const removeFilter = useCallback(
    (key: keyof ShelterFormValues) => {
      if (key === 'searchQuery') {
        handleSearchChange('');
      } else if (key === 'sortBy') {
        form.setValue(key, 'name_asc');
        if (form.getValues('sortBy') === 'distance') {
          clearLocation();
        }
      } else {
        form.setValue(key, null);
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

      onFiltersChange(formattedData as ShelterFilters);
    },
    [form, searchValue, onFiltersChange, handleSearchChange, clearLocation]
  );

  // Get active filters for display
  const activeFilters = Object.entries({
    ...initialFilters,
    searchQuery: initialFilters?.searchQuery || '',
  }).filter(([key, value]) => {
    if (key === 'latitude' || key === 'longitude') return false;
    if (key === 'sortBy' && value === 'name_asc') return false;
    return value !== undefined && value !== '' && value !== null && value !== 'null';
  });

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className="space-y-4">
      {/* Search bar and filter button */}
      <div className="flex items-center gap-2">
        <SearchBar value={searchValue} onChange={handleSearchChange} placeholder="Search shelters..." />

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
              <SheetTitle>Filter Shelters</SheetTitle>
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
