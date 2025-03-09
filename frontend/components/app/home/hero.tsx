import dog from '@/assets/images/dog.jpg';

export function Hero() {
  return (
    <section className="flex size-full flex-1 justify-center">
      <div className="container">
        <div className="grid size-full items-center justify-center gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Find your new pet on PetConnect
            </h1>
            <p className="text-muted-foreground max-w-[600px] text-base/relaxed">
              Browse among pets waiting for a new owner or put your own pet up for adoption. Register to use the chat
              feature or save your favorites with a bookmark.
            </p>
          </div>
          <img
            src={dog.src}
            alt="Dog"
            className="mx-auto aspect-square overflow-hidden rounded-md object-cover shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}
