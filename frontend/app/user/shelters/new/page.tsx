'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { createShelter, uploadShelterAvatar } from '@/actions/shelters';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ShelterAddress } from '@/components/shelters/manage/new/shelter-address';
import { ShelterAvatarUpload } from '@/components/shelters/manage/new/shelter-avatar-upload';
import { ShelterBasicInfo } from '@/components/shelters/manage/new/shelter-basic-info';
import { ShelterContactDetails } from '@/components/shelters/manage/new/shelter-contact-details';
import { shelterFormSchema, ShelterFormValues } from '@/components/shelters/manage/new/types';

export default function NewShelterPage() {
  const router = useRouter();
  const [avatar, setAvatar] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ShelterFormValues>({
    resolver: zodResolver(shelterFormSchema),
    defaultValues: {
      name: '',
      description: '',
      phone: '',
      email: '',
      website: '',
      address: {
        address1: '',
        address2: '',
        city: '',
        region: '',
        postalCode: '',
        country: '',
      },
    },
  });

  const onSubmit = async (data: ShelterFormValues) => {
    try {
      // Validate avatar
      if (!avatar) {
        toast.error('Please upload a shelter logo/avatar');
        return;
      }

      setIsSubmitting(true);

      // Create shelter
      const shelter = await createShelter(data);

      // Upload avatar if available
      if (avatar) {
        await uploadShelterAvatar(shelter.id, avatar);
      }

      toast.success('Shelter registered successfully');
      router.push('/user/shelters');
    } catch (error) {
      toast.error('Failed to register shelter');
      console.error('Error registering shelter:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-4">
      <div>
        <h1 className="text-2xl font-bold">Register a New Shelter</h1>
        <p className="text-muted-foreground">Fill in the details about your shelter</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <ShelterBasicInfo form={form} />
          <ShelterContactDetails form={form} />
          <ShelterAddress form={form} />
          <ShelterAvatarUpload avatar={avatar} setAvatar={setAvatar} />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              'Register Shelter'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
