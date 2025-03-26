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
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [imgSrc, setImgSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 400, height: 400 }); // Default size

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
    if (!width || !height) return;

    setImageSize({ width, height });

    // Calculate display size to ensure minimum dimensions
    const MIN_DISPLAY_SIZE = 400; // Minimum display size in pixels
    const containerWidth = Math.min(window.innerWidth - 64, 600); // Max width of dialog minus padding
    const containerHeight = window.innerHeight - 200; // Available height minus header/footer

    let displayWidth = width;
    let displayHeight = height;

    // Scale up if image is too small
    if (width < MIN_DISPLAY_SIZE || height < MIN_DISPLAY_SIZE) {
      const scale = Math.max(MIN_DISPLAY_SIZE / width, MIN_DISPLAY_SIZE / height);
      displayWidth = width * scale;
      displayHeight = height * scale;
    }

    // Scale down if image is too large
    if (displayWidth > containerWidth || displayHeight > containerHeight) {
      const scale = Math.min(containerWidth / displayWidth, containerHeight / displayHeight);
      displayWidth *= scale;
      displayHeight *= scale;
    }

    // Only update display size if we have valid dimensions
    if (displayWidth > 0 && displayHeight > 0) {
      setDisplaySize({ width: displayWidth, height: displayHeight });
    }

    // Set a 1:1 aspect ratio crop centered in the image
    const initialCrop = centerAspectCrop(width, height, 1);
    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  }, []);

  // Convert the cropped area to a File object
  const handleCropComplete = async () => {
    if (!imgRef.current || !completedCrop) return;

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
      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;
      const cropWidth = completedCrop.width * scaleX;
      const cropHeight = completedCrop.height * scaleY;

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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4">
          {imgSrc ? (
            <div className="relative flex w-full items-center justify-center">
              <div className="relative mx-auto flex max-h-[60vh] items-center justify-center overflow-hidden rounded-lg">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop={false}
                  keepSelection
                  className="max-h-[60vh]"
                >
                  <img
                    ref={imgRef}
                    src={imgSrc}
                    alt="Crop me"
                    style={{
                      width: displaySize.width || 400,
                      height: displaySize.height || 400,
                      maxWidth: '100%',
                      objectFit: 'contain',
                    }}
                    onLoad={onImageLoad}
                  />
                </ReactCrop>
              </div>
            </div>
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
