import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getPetFullAddress, markPetAsAdopted, updatePetStatus } from '@/actions/pets';
import { Address, PetStatus } from '@/types/api';

export function usePetActions(petId: string | undefined) {
  const [fullAddress, setFullAddress] = useState<Address | null>(null);

  // Update pet status
  const updatePetStatusMutation = useMutation({
    mutationFn: async (status: PetStatus) => {
      if (!petId) return;

      try {
        await updatePetStatus(petId, status);
        toast.success(`Pet status updated to ${status}`);
      } catch (error) {
        console.error('Failed to update pet status:', error);
        toast.error('Failed to update pet status');
      }
    },
  });

  // Mark pet as adopted
  const adoptPetMutation = useMutation({
    mutationFn: async () => {
      if (!petId) return;

      try {
        await markPetAsAdopted(petId);
        toast.success('Pet marked as adopted');
      } catch (error) {
        console.error('Failed to mark pet as adopted:', error);
        toast.error('Failed to mark pet as adopted');
      }
    },
  });

  // Get full pet address
  const getFullAddressMutation = useMutation({
    mutationFn: async () => {
      if (!petId) return;

      try {
        const address = await getPetFullAddress(petId);
        setFullAddress(address);
      } catch (error) {
        console.error('Failed to get full address:', error);
        toast.error('Failed to get full address');
      }
    },
  });

  return {
    fullAddress,
    updatePetStatus: updatePetStatusMutation.mutate,
    adoptPet: adoptPetMutation.mutate,
    getFullAddress: getFullAddressMutation.mutate,
  };
}
