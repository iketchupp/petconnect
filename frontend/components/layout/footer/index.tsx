import Link from 'next/link';

import { siteConfig } from '@/config/site.config';

export function Footer() {
  return (
    <footer className="z-50">
      <div className="text-foreground/60 flex h-8 items-center justify-between px-4 text-xs font-light">
        <div>
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>
        <div>
          <Link href="/terms">Terms</Link>
          <span className="mx-2">•</span>
          <Link href="/privacy">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
