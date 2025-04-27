import { Heart, Home, MessageSquare, Search } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: <Search className="text-primary h-10 w-10" />,
      title: 'Search',
      description: 'Browse through our collection of available pets from shelters and individuals.',
    },
    {
      icon: <Heart className="text-primary h-10 w-10" />,
      title: 'Save Favorites',
      description: "Create a list of pets you're interested in to compare and review later.",
    },
    {
      icon: <MessageSquare className="text-primary h-10 w-10" />,
      title: 'Connect',
      description: 'Contact shelters or pet owners directly through our messaging system.',
    },
    {
      icon: <Home className="text-primary h-10 w-10" />,
      title: 'Adopt',
      description: 'Complete the adoption process and welcome your new companion home.',
    },
  ];

  return (
    <section className="bg-muted/50 w-full py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
            <p className="text-muted-foreground mx-auto max-w-[700px] text-base/relaxed">
              Finding your perfect pet companion is easy with our streamlined adoption process.
            </p>
          </div>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-card flex flex-col items-center rounded-lg border p-6 text-center shadow-sm transition-all hover:shadow-md"
              >
                <div className="bg-primary/10 mb-4 flex size-16 items-center justify-center rounded-full">
                  {step.icon}
                </div>
                <h3 className="mb-2 text-xl font-medium">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
