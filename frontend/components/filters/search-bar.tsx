import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }: SearchBarProps) {
  return (
    <div className={`relative flex-1 ${className}`}>
      <div className="relative">
        <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
        <Input placeholder={placeholder} className="pl-9" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}
