import dog from '@/assets/images/dog.jpg';

export function Hero() {
  return (
    <section className="flex size-full flex-1 justify-center py-8 md:py-12 lg:py-16">
      <div className="container px-4 md:px-6">
        <div className="grid size-full items-center justify-center gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-4 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Find your new pet on PetConnect
            </h1>
            <p className="text-muted-foreground mx-auto max-w-[600px] text-base/relaxed lg:mx-0">
              Browse among pets waiting for a new owner or put your own pet up for adoption. Register to use the chat
              feature or save your favorites with a bookmark.
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <img
              src={dog.src}
              alt="Dog"
              className="aspect-square w-full max-w-[400px] overflow-hidden rounded-md object-cover shadow-2xl sm:max-w-[500px] lg:aspect-video lg:max-w-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
