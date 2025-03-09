import Image from 'next/image';

import { Hero } from '@/components/app/home/hero';

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
    </main>
  );
}
