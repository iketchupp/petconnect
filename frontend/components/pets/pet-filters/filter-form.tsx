import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

import { getCities, getCountries } from '@/actions/locations';
import { getPetBreeds, getPetGenders, getPetSpecies } from '@/actions/pets';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SheetClose, SheetFooter } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';

import { FilterFormValues } from './types';
import { capitalizeWords, formatAge, SORT_LABELS } from './utils';

interface FilterFormProps {
  form: UseFormReturn<FilterFormValues>;
  onSubmit: (data: FilterFormValues) => void;
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
  const selectedSpecies = form.watch('species');
  const selectedCountry = form.watch('country');

  // Data fetching with React Query
  const { data: speciesData, isLoading: isLoadingSpecies } = useQuery({
    queryKey: ['petSpecies'],
    queryFn: getPetSpecies,
  });

  const { data: genderData, isLoading: isLoadingGenders } = useQuery({
    queryKey: ['petGenders'],
    queryFn: getPetGenders,
  });

  const { data: breedData, isLoading: isLoadingBreeds } = useQuery({
    queryKey: ['petBreeds', selectedSpecies],
    queryFn: () => getPetBreeds(selectedSpecies || ''),
    enabled: !!selectedSpecies && selectedSpecies !== 'null',
  });

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
          {/* Species field */}
          <FormField
            control={form.control}
            name="species"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Species</FormLabel>
                {isLoadingSpecies ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    onValueChange={(value) => handleSelectChange(field.onChange, value)}
                    value={field.value === null ? 'null' : field.value || 'null'}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select species" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">All Species</SelectItem>
                      {speciesData?.map((species: string) => (
                        <SelectItem key={species} value={species.toLowerCase()}>
                          {capitalizeWords(species)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Breed field */}
          <FormField
            control={form.control}
            name="breed"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Breed</FormLabel>
                {selectedSpecies && selectedSpecies !== 'null' ? (
                  isLoadingBreeds ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      onValueChange={(value) => handleSelectChange(field.onChange, value)}
                      value={field.value === null ? 'null' : field.value || 'null'}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select breed" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">Any Breed</SelectItem>
                        {breedData?.map((breed: string) => (
                          <SelectItem key={breed} value={breed.toLowerCase()}>
                            {capitalizeWords(breed)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )
                ) : (
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Select a species first"
                      disabled={!selectedSpecies || selectedSpecies === 'null'}
                      value={field.value === null ? '' : field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Age range field */}
          <FormField
            control={form.control}
            name="ageRange"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Age Range</FormLabel>
                <div className="w-full space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>{formatAge(field.value?.min || 0)}</span>
                    <span>{formatAge(field.value?.max || 240)}</span>
                  </div>
                  <FormControl>
                    <Slider
                      min={0}
                      max={240}
                      step={1}
                      minStepsBetweenThumbs={1}
                      value={[field.value?.min || 0, field.value?.max || 240]}
                      onValueChange={([min, max]) => {
                        field.onChange({ min, max });
                      }}
                      className="w-full [&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                    />
                  </FormControl>
                  <div className="text-muted-foreground flex justify-between text-xs">
                    <span>0 months</span>
                    <span>20 years</span>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gender field */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Gender</FormLabel>
                {isLoadingGenders ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    onValueChange={(value) => handleSelectChange(field.onChange, value)}
                    value={field.value === null ? 'null' : field.value || 'null'}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">Any Gender</SelectItem>
                      {genderData?.map((gender: string) => (
                        <SelectItem key={gender} value={gender.toLowerCase()}>
                          {capitalizeWords(gender)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

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
                  value={field.value === null ? 'null' : field.value || 'null'}
                  disabled={isGettingLocation}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select sort option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="null">Default</SelectItem>
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
