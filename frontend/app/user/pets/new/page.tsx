'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { createPet, uploadPetImages } from '@/actions/pets';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { AddressForm } from '@/components/address-form';
import { PetBasicInfo } from '@/components/pets/manage/new/pet-basic-info';
import { PetDetailsFields } from '@/components/pets/manage/new/pet-details-fields';
import { PetImageUpload } from '@/components/pets/manage/new/pet-image-upload';
import { ShelterSelect } from '@/components/pets/manage/new/shelter-select';
import { petFormSchema, PetFormValues } from '@/components/pets/manage/new/types';

export default function NewPetPage() {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [orderedImages, setOrderedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPersonalPet, setIsPersonalPet] = useState(false);
  const [buttonText, setButtonText] = useState('Register Pet');

  const form = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: '',
      description: '',
      species: '',
      breed: '',
      gender: 'Male',
      birthDate: '',
    },
  });

  // Watch for shelter ID changes to determine if it's a personal pet
  useEffect(() => {
    const subscription = form.watch((value) => {
      setIsPersonalPet(value.shelterId === 'personal');
    });

    // Initial check for default value
    const currentShelterId = form.getValues('shelterId');
    if (currentShelterId === 'personal') {
      setIsPersonalPet(true);
    }

    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: PetFormValues) => {
    try {
      setIsSubmitting(true);
      setButtonText('Registering...');

      if (images.length === 0) {
        toast.error('Please add at least one image');
        return;
      }

      // Set shelterId to undefined for personal pets
      const petData = {
        ...data,
        shelterId: data.shelterId === 'personal' ? undefined : data.shelterId,
      };

      // Create pet
      const pet = await createPet(petData);

      // Upload images in the correct order
      setButtonText('Uploading images...');
      await uploadPetImages(pet.id, orderedImages.length > 0 ? orderedImages : images);

      toast.success('Pet registered successfully');
      router.push('/user/pets');
    } catch (error) {
      setButtonText('Register Pet');
      toast.error('Failed to register pet');
      console.error('Error registering pet:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-4">
      <div>
        <h1 className="text-2xl font-bold">Register a New Pet</h1>
        <p className="text-muted-foreground">Fill in the details about your pet</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <PetBasicInfo form={form} />
          <PetDetailsFields form={form} />
          <ShelterSelect form={form} />

          {isPersonalPet && (
            <AddressForm
              form={form}
              title="Pet's Location"
              description="Enter the address where the pet is currently located"
            />
          )}

          <PetImageUpload images={images} setImages={setImages} onOrderChange={setOrderedImages} />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {buttonText}
              </>
            ) : (
              buttonText
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
