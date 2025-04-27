import { Star } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

const testimonials = [
  {
    name: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?img=1',
    role: 'Dog Owner',
    content:
      "I found my best friend Max through PetConnect. The process was so smooth, and now I can't imagine life without him. Thank you for making pet adoption so accessible!",
    rating: 5,
  },
  {
    name: 'Michael Torres',
    avatar: 'https://i.pravatar.cc/150?img=8',
    role: 'Cat Owner',
    content:
      'After months of searching for the perfect pet, I found Luna on PetConnect. The platform made it easy to connect with the shelter and complete the adoption process.',
    rating: 5,
  },
  {
    name: 'Emily Chen',
    avatar: 'https://i.pravatar.cc/150?img=5',
    role: 'Rabbit Owner',
    content:
      'As someone looking to adopt a more uncommon pet, PetConnect had a great variety of animals. I found my rabbit Thumper and the rest is history!',
    rating: 4,
  },
];

export function Testimonials() {
  return (
    <section className="bg-background w-full py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Happy Pet Parents</h2>
            <p className="text-muted-foreground mx-auto max-w-[700px] text-base/relaxed">
              Hear from people who found their perfect companions through our platform.
            </p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="flex h-full flex-col justify-between p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating ? 'fill-primary text-primary' : 'fill-muted text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <blockquote className="mt-3 text-base italic">&quot;{testimonial.content}&quot;</blockquote>
                </div>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-medium">{testimonial.name}</p>
                    <p className="text-muted-foreground text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
