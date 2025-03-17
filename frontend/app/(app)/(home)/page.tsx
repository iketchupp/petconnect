import Image from 'next/image';

import { Hero } from '@/components/app/home/hero';
import { Loading } from '@/components/loading';

export default function Home() {
  return (
    <main className="h-full flex-1">
      <div className="h-full flex-1">
        <Hero />
      </div>
    </main>
  );
}
