import { UseFormReturn } from 'react-hook-form';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { ShelterFormValues } from './types';

interface ShelterBasicInfoProps {
  form: UseFormReturn<ShelterFormValues>;
}

export function ShelterBasicInfo({ form }: ShelterBasicInfoProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Basic Information</h2>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Shelter Name</FormLabel>
            <FormControl>
              <Input placeholder="Happy Paws Shelter" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Tell us about your shelter..." className="min-h-[100px]" {...field} />
            </FormControl>
            <FormDescription>Provide details about your shelter&apos;s mission, history, and services.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
