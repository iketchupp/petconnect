import Image from 'next/image';

import { CallToAction } from '@/components/home/call-to-action';
import { FeaturedPets } from '@/components/home/featured-pets';
import { Hero } from '@/components/home/hero';
import { HowItWorks } from '@/components/home/how-it-works';
import { Testimonials } from '@/components/home/testimonials';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center">
      <Hero />
      <FeaturedPets />
      <HowItWorks />
      <Testimonials />
      <CallToAction />
    </main>
  );
}
