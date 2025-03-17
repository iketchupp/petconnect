import React, { Suspense } from 'react';

import { Spinner } from '@/components/ui/kibo-ui/spinner';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Spinner variant="default" />}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </Suspense>
  );
}
