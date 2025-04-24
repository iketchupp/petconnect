import { X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { ShelterFormValues } from './types';
import { formatFilterLabel } from './utils';

interface ActiveFiltersProps {
  activeFilters: [string, unknown][];
  onRemoveFilter: (key: keyof ShelterFormValues) => void;
  onClearAll: () => void;
}

export function ActiveFilters({ activeFilters, onRemoveFilter, onClearAll }: ActiveFiltersProps) {
  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {activeFilters.map(([key, value]) => (
        <Badge key={key} variant="secondary" className="flex items-center gap-1">
          {formatFilterLabel(key, value as string)}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter(key as keyof ShelterFormValues)}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove {key} filter</span>
          </Button>
        </Badge>
      ))}
      {activeFilters.length > 1 && (
        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={onClearAll}>
          Clear all
        </Button>
      )}
    </div>
  );
}
