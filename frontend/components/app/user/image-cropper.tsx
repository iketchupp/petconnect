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

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  const cropSize = Math.min(mediaWidth, mediaHeight);

  return centerCrop(
    makeAspectCrop(
      {
        unit: 'px',
        width: cropSize,
        height: cropSize,
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
  const [displaySize, setDisplaySize] = useState({ width: 400, height: 400 });

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

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    if (!width || !height) return;

    setImageSize({ width, height });

    const containerWidth = Math.min(window.innerWidth - 64, 600);
    const containerHeight = window.innerHeight - 200;

    const scale = Math.min(containerWidth / width, containerHeight / height);

    const displayWidth = width * scale;
    const displayHeight = height * scale;

    setDisplaySize({ width: displayWidth, height: displayHeight });

    const initialCrop = centerAspectCrop(width, height, 1);
    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  }, []);

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

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const pixelRatio = window.devicePixelRatio;
      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;
      const cropWidth = completedCrop.width * scaleX;
      const cropHeight = completedCrop.height * scaleY;

      canvas.width = cropWidth * pixelRatio;
      canvas.height = cropHeight * pixelRatio;

      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

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
                  minWidth={50}
                  minHeight={50}
                >
                  <img
                    ref={imgRef}
                    src={imgSrc}
                    alt="Crop me"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '60vh',
                      width: 'auto',
                      height: 'auto',
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
