import React, { Suspense } from 'react';

import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Loading } from '@/components/loading';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </Suspense>
  );
}
