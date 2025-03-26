'use client';

import { useState } from 'react';
import type { PetFilters as PetFiltersType } from '@/actions/pets';

import { PetFilters } from '@/components/app/pets/pet-filters';
import { PetList } from '@/components/app/pets/pet-list';

export default function PetsPage() {
  const [filters, setFilters] = useState<PetFiltersType>({});

  return (
    <main className="container mx-auto flex h-full flex-1 justify-center px-2 py-4">
      <PetList filters={filters} />
    </main>
  );
}
