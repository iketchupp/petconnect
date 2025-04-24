import { useCallback, useEffect, useState } from 'react';
import { ImagePlus, Trash } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FormLabel } from '@/components/ui/form';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGES = 10;

interface PetImageUploadProps {
  images: File[];
  setImages: React.Dispatch<React.SetStateAction<File[]>>;
  onOrderChange?: (orderedImages: File[]) => void;
}

export function PetImageUpload({ images, setImages, onOrderChange }: PetImageUploadProps) {
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(-1);

  // Set initial primary image when images are first added
  useEffect(() => {
    if (images.length > 0 && primaryImageIndex === -1) {
      setPrimaryImageIndex(0);
    }
  }, [images.length, primaryImageIndex]);

  // Function to get images in the correct order (primary first)
  const getOrderedImages = () => {
    if (primaryImageIndex === -1) return images;
    const orderedImages = [...images];
    const primaryImage = orderedImages.splice(primaryImageIndex, 1)[0];
    orderedImages.unshift(primaryImage);
    return orderedImages;
  };

  // Update ordered images whenever primary image changes
  useEffect(() => {
    if (onOrderChange) {
      onOrderChange(getOrderedImages());
    }
  }, [primaryImageIndex, images, onOrderChange]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles = acceptedFiles.filter(
        (file) => file.size <= MAX_FILE_SIZE && ACCEPTED_IMAGE_TYPES.includes(file.type)
      );

      if (validFiles.length !== acceptedFiles.length) {
        toast.error('Some files were rejected. Images must be less than 5MB and in JPG, PNG, or WebP format.');
      }

      setImages((prev) => {
        // Check if adding new files would exceed the limit
        if (prev.length + validFiles.length > MAX_IMAGES) {
          toast.error(`You can upload a maximum of ${MAX_IMAGES} images`);
          // Only add files up to the limit
          const remainingSlots = MAX_IMAGES - prev.length;
          const filesToAdd = validFiles.slice(0, remainingSlots);
          return [...prev, ...filesToAdd];
        }

        return [...prev, ...validFiles];
      });
    },
    [setImages]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/*': ACCEPTED_IMAGE_TYPES,
    },
    maxSize: MAX_FILE_SIZE,
  });

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);
      // If we're removing the primary image, set the first image as primary
      if (index === primaryImageIndex) {
        setPrimaryImageIndex(newImages.length > 0 ? 0 : -1);
      }
      // If we're removing an image before the primary image, adjust the primary index
      else if (index < primaryImageIndex) {
        setPrimaryImageIndex(primaryImageIndex - 1);
      }
      return newImages;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel>Images</FormLabel>
        {images.length > 0 && <p className="text-muted-foreground text-sm">Click an image to set it as primary</p>}
      </div>
      <div
        {...getRootProps()}
        onClick={open} // Manually handle click events
        className={cn(
          'border-input bg-background hover:bg-accent cursor-pointer rounded-md border-2 border-dashed p-4 text-center transition-colors',
          isDragActive && 'border-primary'
        )}
      >
        <input {...getInputProps()} />
        <ImagePlus className="mx-auto h-8 w-8" />
        <p className="mt-2">Drag & drop images here, or click to select files</p>
        <p className="text-muted-foreground text-sm">JPG, PNG or WebP, up to 5MB each (maximum {MAX_IMAGES} images)</p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((file, index) => (
            <div key={index} className="group relative">
              <div
                role="button"
                onClick={() => setPrimaryImageIndex(index)}
                className={cn(
                  'hover:ring-primary/50 cursor-pointer transition-all hover:ring-2',
                  'relative aspect-square overflow-hidden rounded-md',
                  primaryImageIndex === index && 'ring-primary ring-2'
                )}
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <Button
                variant="destructive"
                size="icon"
                className={cn(
                  'bg-background/80 absolute right-1 top-1',
                  'flex group-hover:flex sm:hidden' // Always show on mobile, hide on desktop except on hover
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
              >
                <Trash className="h-4 w-4" />
              </Button>
              {primaryImageIndex === index && (
                <div className="bg-primary text-primary-foreground absolute left-1 top-1 rounded px-2 py-0.5 text-xs">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
