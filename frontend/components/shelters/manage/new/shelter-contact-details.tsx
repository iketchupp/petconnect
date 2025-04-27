import { UseFormReturn } from 'react-hook-form';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/phone-input';

import { ShelterFormValues } from './types';
// Custom styling to fix flag alignment
import './phone-input-fixes.css';

interface ShelterContactDetailsProps {
  form: UseFormReturn<ShelterFormValues>;
}

export function ShelterContactDetails({ form }: ShelterContactDetailsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Contact Information</h2>
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem className="phone-input-container">
            <FormLabel>Phone Number</FormLabel>
            <FormControl>
              <PhoneInput
                placeholder="Enter phone number"
                defaultCountry="US"
                international
                className="phone-input-fixed"
                {...field}
                value={field.value}
                onChange={(value) => field.onChange(value || '')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email Address</FormLabel>
            <FormControl>
              <Input placeholder="contact@happypaws.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="website"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Website (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="https://www.happypaws.com" {...field} />
            </FormControl>
            <FormDescription>Enter the full URL including https://</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
