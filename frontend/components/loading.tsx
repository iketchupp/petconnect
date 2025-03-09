import { Loader } from 'lucide-react';

import { cn } from '@/lib/utils';

interface LoadingProps {
  message?: string;
  className?: string;
  props?: React.HTMLAttributes<HTMLDivElement>;
}

export function Loading({ message = 'Loading...', className, ...props }: LoadingProps) {
  return (
    <div
      className={cn(
        className,
        'bg-background text-muted-foreground inset-0 z-10 flex h-full w-full items-center justify-center gap-2 text-sm'
      )}
      {...props}
    >
      <Loader className="size-4 animate-spin" />
      {message}
    </div>
  );
}
