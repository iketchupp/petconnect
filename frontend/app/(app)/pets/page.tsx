'use client';

import { useState } from 'react';
import type { PetFilters as PetFiltersType } from '@/actions/pets';

import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider } from '@/components/ui/sidebar';
import { PetFilters } from '@/components/pets/PetFilters';
import { PetList } from '@/components/pets/PetList';

export default function PetsPage() {
  const [filters, setFilters] = useState<PetFiltersType>({});

  return (
    <main className="container mx-auto flex h-full flex-1 justify-center px-2 py-4">
      <PetList filters={filters} />
    </main>
  );
}
