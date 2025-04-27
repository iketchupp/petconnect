import { getLocationLabel } from '@/actions/locations';

// Sort labels for pet filtering
export const SORT_LABELS: Record<string, string> = {
  name_asc: 'Name (A-Z)',
  name_desc: 'Name (Z-A)',
  newest: 'Newest First',
  oldest: 'Oldest First',
  youngest: 'Age (Youngest)',
  eldest: 'Age (Eldest)',
  distance: 'Distance (Nearest)',
};

// Helper function to capitalize first letter of each word
export const capitalizeWords = (str: string) => {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Helper function to format filter labels
export const formatFilterLabel = (key: string, value: string | { min: number; max: number }): string => {
  switch (key) {
    case 'species':
      return `Species: ${capitalizeWords(value as string)}`;
    case 'breed':
      return `Breed: ${capitalizeWords(value as string)}`;
    case 'ageRange':
      const ageValue = value as { min: number; max: number };
      if (!ageValue || (ageValue.min === 0 && ageValue.max === 240)) return '';
      if (ageValue.min === ageValue.max) return `Age: ${formatAge(ageValue.min)}`;
      return `Age: ${formatAge(ageValue.min)} - ${formatAge(ageValue.max)}`;
    case 'gender':
      return `Gender: ${capitalizeWords(value as string)}`;
    case 'sortBy':
      return `Sort: ${SORT_LABELS[value as string] || capitalizeWords(value as string)}`;
    case 'searchQuery':
      return `Search: ${value}`;
    case 'country':
      return `Country: ${capitalizeWords(value as string)}`;
    case 'city':
      return `City: ${capitalizeWords(value as string)}`;
    default:
      return `${capitalizeWords(key)}: ${value}`;
  }
};

// Helper function to format age in years and months
export const formatAge = (months: number): string => {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) return `${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
  if (remainingMonths === 0) return `${years} ${years === 1 ? 'year' : 'years'}`;
  return `${years}y ${remainingMonths}m`;
};

export { getLocationLabel };
