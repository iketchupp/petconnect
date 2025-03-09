import Link from 'next/link';
import { GalleryVerticalEnd } from 'lucide-react';

import { siteConfig } from '@/config/site.config';

export function AuthContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1">
      <div className="flex flex-1 flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>
    </div>
  );
}
