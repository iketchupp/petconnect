import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, User } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

import { getUserShelters } from '@/actions/shelters';
import { SheltersResponse } from '@/types/api';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';

import { PetFormValues } from './types';

interface ShelterSelectProps {
  form: UseFormReturn<PetFormValues>;
}

export function ShelterSelect({ form }: ShelterSelectProps) {
  const { data } = useQuery<SheltersResponse>({
    queryKey: ['userShelters', 'newPet'],
    queryFn: () => getUserShelters(),
  });

  // Automatically set to personal if no shelters are available
  useEffect(() => {
    if (data !== undefined && (!data.shelters || data.shelters.length === 0)) {
      form.setValue('shelterId', 'personal');
    }
  }, [data, form]);

  if (!data?.shelters || data.shelters.length === 0) {
    return null;
  }

  return (
    <FormField
      control={form.control}
      name="shelterId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Register Under</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select where to register the pet" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="personal">
                <User className="mr-2 h-4 w-4" /> Personal Account
              </SelectItem>
              <SelectSeparator />
              {data.shelters.map((shelter) => (
                <SelectItem key={shelter.id} value={shelter.id}>
                  <Building2 className="mr-2 h-4 w-4" /> {shelter.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            Choose whether to register the pet under your personal account or a shelter you manage
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
