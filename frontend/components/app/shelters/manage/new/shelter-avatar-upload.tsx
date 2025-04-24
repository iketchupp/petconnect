import { useCallback } from 'react';
import { ImagePlus, Trash } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FormLabel } from '@/components/ui/form';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

interface ShelterAvatarUploadProps {
  avatar: File | null;
  setAvatar: React.Dispatch<React.SetStateAction<File | null>>;
}

export function ShelterAvatarUpload({ avatar, setAvatar }: ShelterAvatarUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (file.size > MAX_FILE_SIZE) {
        toast.error('Image must be less than 5MB');
        return;
      }

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error('Image must be in JPG, PNG, or WebP format');
        return;
      }

      setAvatar(file);
    },
    [setAvatar]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ACCEPTED_IMAGE_TYPES,
    },
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1,
  });

  const removeAvatar = () => {
    setAvatar(null);
  };

  return (
    <div className="space-y-4">
      <FormLabel>Shelter Logo/Avatar</FormLabel>
      {!avatar ? (
        <div
          {...getRootProps()}
          className={cn(
            'border-input bg-background hover:bg-accent cursor-pointer rounded-md border-2 border-dashed p-4 text-center transition-colors',
            isDragActive && 'border-primary'
          )}
        >
          <input {...getInputProps()} />
          <ImagePlus className="mx-auto h-8 w-8" />
          <p className="mt-2">Drag & drop an image here, or click to select</p>
          <p className="text-muted-foreground text-sm">JPG, PNG or WebP, up to 5MB</p>
        </div>
      ) : (
        <div className="relative">
          <div className="relative aspect-square w-40 overflow-hidden rounded-md">
            <img
              src={URL.createObjectURL(avatar)}
              alt="Shelter avatar preview"
              className="h-full w-full object-cover"
            />
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-8 w-8 rounded-full"
            onClick={removeAvatar}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
