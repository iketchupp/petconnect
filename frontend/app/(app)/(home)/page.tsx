import Image from 'next/image';

import { CallToAction } from '@/components/app/home/call-to-action';
import { FeaturedPets } from '@/components/app/home/featured-pets';
import { Hero } from '@/components/app/home/hero';
import { HowItWorks } from '@/components/app/home/how-it-works';
import { Testimonials } from '@/components/app/home/testimonials';

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
