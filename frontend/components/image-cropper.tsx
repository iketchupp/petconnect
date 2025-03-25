'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, type Crop } from 'react-image-crop';

import 'react-image-crop/dist/ReactCrop.css';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ImageCropperProps {
  open: boolean;
  onClose: () => void;
  onCropComplete: (croppedImage: File) => void;
  selectedFile: File | null;
}

// This function creates a centered crop with a specific aspect ratio
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function ImageCropper({ open, onClose, onCropComplete, selectedFile }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [imgSrc, setImgSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load the image when the file changes
  useEffect(() => {
    if (!selectedFile) {
      setImgSrc('');
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImgSrc(reader.result?.toString() || '');
    });
    reader.readAsDataURL(selectedFile);
  }, [selectedFile]);

  // Set the initial crop when the image loads
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    // Set a 1:1 aspect ratio crop centered in the image
    setCrop(centerAspectCrop(width, height, 1));
  }, []);

  // Convert the cropped area to a File object
  const handleCropComplete = async () => {
    if (!imgRef.current || !crop) return;

    setIsLoading(true);
    try {
      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      // Calculate the crop area
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const pixelRatio = window.devicePixelRatio;
      const cropX = crop.x * scaleX;
      const cropY = crop.y * scaleY;
      const cropWidth = crop.width * scaleX;
      const cropHeight = crop.height * scaleY;

      // Set the canvas size to the crop size
      canvas.width = cropWidth * pixelRatio;
      canvas.height = cropHeight * pixelRatio;

      // Increase the size of the canvas for higher quality
      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = 'high';

      // Draw the cropped image
      ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else throw new Error('Canvas is empty');
          },
          selectedFile?.type || 'image/jpeg',
          1
        );
      });

      // Create a file from the blob
      const croppedFile = new File([blob], selectedFile?.name || 'cropped-image.jpg', {
        type: selectedFile?.type || 'image/jpeg',
      });

      onCropComplete(croppedFile);
      onClose();
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-1">
          {imgSrc ? (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              aspect={1}
              circularCrop={false}
              keepSelection
              className="max-h-[60vh] overflow-auto"
            >
              <img ref={imgRef} src={imgSrc} alt="Crop me" style={{ maxWidth: '100%' }} onLoad={onImageLoad} />
            </ReactCrop>
          ) : (
            <div className="flex h-40 w-full items-center justify-center rounded-md border border-dashed">
              No image selected
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!crop || isLoading} onClick={handleCropComplete}>
            {isLoading ? 'Processing...' : 'Apply'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
