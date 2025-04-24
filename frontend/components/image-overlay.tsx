import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import type { CarouselApi } from '@/components/ui/carousel';

interface ImageOverlayProps {
  images: string[];
  initialIndex?: number;
  alt: string;
  onClose: () => void;
  className?: string;
}

export function ImageOverlay({ images, initialIndex = 0, alt, onClose, className }: ImageOverlayProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // Close on escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Handle carousel API
  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div
      className="overlay-bg fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-y-auto bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="close-btn fixed right-2 top-2 z-50 sm:right-4 sm:top-4">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onClose}>
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </div>

      <div
        className="image-container relative my-auto min-h-screen w-[calc(100vw-1rem)] max-w-[95vw] p-2 sm:min-h-0 sm:w-auto sm:max-w-[90vw] sm:p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <Carousel
          setApi={setApi}
          className="flex h-full min-h-screen items-center sm:min-h-0"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
          opts={{
            startIndex: initialIndex,
            loop: true,
            align: 'center',
          }}
        >
          <CarouselContent className="-ml-2 flex min-h-screen items-center sm:-ml-4 sm:min-h-0">
            {images.map((src, index) => (
              <CarouselItem
                key={src}
                className="flex min-h-screen items-center justify-center pl-2 sm:min-h-0 sm:pl-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    onClose();
                  }
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${alt} ${index + 1} of ${images.length}`}
                  className={cn(
                    'max-h-[80vh] w-auto max-w-[calc(100vw-2rem)] rounded-lg object-contain sm:max-h-[75vh] sm:max-w-[calc(90vw-2rem)]',
                    className
                  )}
                  onClick={(e) => e.stopPropagation()}
                />
              </CarouselItem>
            ))}
          </CarouselContent>

          {images.length > 1 && (
            <>
              <div onClick={(e) => e.stopPropagation()}>
                <CarouselPrevious className="left-0 h-8 w-8 bg-white/10 text-white hover:bg-white/20 sm:left-4 sm:h-10 sm:w-10" />
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <CarouselNext className="right-0 h-8 w-8 bg-white/10 text-white hover:bg-white/20 sm:right-4 sm:h-10 sm:w-10" />
              </div>
            </>
          )}
        </Carousel>

        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 sm:bottom-4">
            <p className="rounded-full bg-black/50 px-3 py-1.5 text-xs text-white/80 sm:px-4 sm:py-2 sm:text-sm">
              {current} / {count}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
