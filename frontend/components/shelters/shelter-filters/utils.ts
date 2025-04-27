import { getLocationLabel } from '@/actions/locations';

// Helper function to capitalize first letter of each word
export const capitalizeWords = (str: string) => {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Helper function to format filter labels
export const formatFilterLabel = (key: string, value: string): string => {
  switch (key) {
    case 'sortBy':
      const sortLabels: Record<string, string> = {
        name_asc: 'Name (A-Z)',
        name_desc: 'Name (Z-A)',
        newest: 'Newest First',
        oldest: 'Oldest First',
        distance: 'Distance (Nearest)',
      };
      return `Sort: ${sortLabels[value] || capitalizeWords(value)}`;
    case 'searchQuery':
      return `Search: ${value}`;
    case 'country':
      return `Country: ${capitalizeWords(value)}`;
    case 'city':
      return `City: ${capitalizeWords(value)}`;
    default:
      return `${capitalizeWords(key)}: ${value}`;
  }
};

export { getLocationLabel };
