'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

import { http } from '@/lib/http';
import { ImageCropper } from '@/components/app/user/image-cropper';
import { ProfileForm } from '@/components/app/user/profile-form';
import { ProfileHeader } from '@/components/app/user/profile-header';

export default function UserProfilePage() {
  const { session, refresh } = useAuthStore();
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);

  if (!session) {
    return null;
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setCropperOpen(true);
  };

  const handleCroppedImage = async (croppedImage: File) => {
    try {
      setIsAvatarLoading(true);
      const formData = new FormData();
      formData.append('file', croppedImage);

      await http.post('/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      refresh();
      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update avatar');
    } finally {
      setIsAvatarLoading(false);
      setSelectedFile(null);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6 flex flex-col">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground text-sm">Update your profile information and avatar</p>
      </div>

      <ProfileHeader session={session} isAvatarLoading={isAvatarLoading} onFileSelect={handleFileSelect} />

      <ProfileForm session={session} onUpdateSuccess={refresh} />

      {/* Image Cropper Modal */}
      <ImageCropper
        open={cropperOpen}
        onClose={() => setCropperOpen(false)}
        onCropComplete={handleCroppedImage}
        selectedFile={selectedFile}
      />
    </div>
  );
}
