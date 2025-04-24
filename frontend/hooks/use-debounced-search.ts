import { useCallback, useEffect, useRef, useState } from 'react';

interface UseDebouncedSearchProps {
  initialValue?: string;
  delay?: number;
  onSearch: (value: string) => void;
}

export function useDebouncedSearch({ initialValue = '', delay = 500, onSearch }: UseDebouncedSearchProps) {
  const [searchValue, setSearchValue] = useState(initialValue);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        onSearch(value);
      }, delay);
    },
    [delay, onSearch]
  );

  return {
    searchValue,
    handleSearchChange,
  };
}
