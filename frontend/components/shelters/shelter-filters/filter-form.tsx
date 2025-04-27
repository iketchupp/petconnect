import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

import { getCities, getCountries } from '@/actions/locations';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SheetClose, SheetFooter } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';

import { ShelterFormValues, SORT_LABELS } from './types';
import { capitalizeWords } from './utils';

interface FilterFormProps {
  form: UseFormReturn<ShelterFormValues>;
  onSubmit: (data: ShelterFormValues) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
  handleSortChange: (value: string) => void;
  isGettingLocation: boolean;
  locationError: string | null;
  locationLabel: string | null;
  showLocationLabel: boolean;
}

export function FilterForm({
  form,
  onSubmit,
  onClearAll,
  hasActiveFilters,
  handleSortChange,
  isGettingLocation,
  locationError,
  locationLabel,
  showLocationLabel,
}: FilterFormProps) {
  const selectedCountry = form.watch('country');

  // Data fetching with React Query
  const { data: countriesData, isLoading: isLoadingCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
  });

  const { data: citiesData, isLoading: isLoadingCities } = useQuery({
    queryKey: ['cities', selectedCountry],
    queryFn: () => getCities(selectedCountry || ''),
    enabled: !!selectedCountry && selectedCountry !== 'null',
  });

  // Helper for select value handling
  const handleSelectChange = useCallback((onChange: (...event: any[]) => void, value: string) => {
    onChange(value === 'null' ? null : value);
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6 p-4">
          {/* Country field */}
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Country</FormLabel>
                {isLoadingCountries ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    onValueChange={(value) => handleSelectChange(field.onChange, value)}
                    value={field.value === null ? 'null' : field.value || 'null'}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">All Countries</SelectItem>
                      {countriesData?.map((country: string) => (
                        <SelectItem key={country} value={country.toLowerCase()}>
                          {capitalizeWords(country)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* City field */}
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>City</FormLabel>
                {selectedCountry && selectedCountry !== 'null' ? (
                  isLoadingCities ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      onValueChange={(value) => handleSelectChange(field.onChange, value)}
                      value={field.value === null ? 'null' : field.value || 'null'}
                      disabled={!selectedCountry || selectedCountry === 'null'}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">Any City</SelectItem>
                        {citiesData?.map((city: string) => (
                          <SelectItem key={city} value={city.toLowerCase()}>
                            {capitalizeWords(city)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )
                ) : (
                  <Select disabled={true} value="null" onValueChange={() => {}}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a country first" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">Any City</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sort field */}
          <FormField
            control={form.control}
            name="sortBy"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Sort By</FormLabel>
                <Select
                  onValueChange={handleSortChange}
                  value={field.value === null ? 'null' : field.value || 'name_asc'}
                  disabled={isGettingLocation}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select sort option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(SORT_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {locationError && <p className="text-destructive mt-2 text-sm">{locationError}</p>}
                {isGettingLocation && <p className="text-muted-foreground mt-2 text-sm">Getting your location...</p>}
                {showLocationLabel && (
                  <p className="text-muted-foreground mt-2 flex items-center text-sm">
                    <MapPin className="mr-2 h-4 w-4" /> {locationLabel}
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <SheetFooter className="gap-2 sm:space-x-0">
          <Button type="button" variant="outline" onClick={onClearAll} disabled={!hasActiveFilters}>
            Clear All
          </Button>
          <SheetClose asChild>
            <Button type="submit">Apply Filters</Button>
          </SheetClose>
        </SheetFooter>
      </form>
    </Form>
  );
}
