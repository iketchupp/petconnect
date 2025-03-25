'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { http } from '@/lib/http';
import { getAbbreviation } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ImageCropper } from '@/components/image-cropper';

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
});

export default function UserProfilePage() {
  const { session, refresh } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
    },
  });

  useEffect(() => {
    if (session) {
      form.reset({
        firstName: session.firstName,
        lastName: session.lastName,
        username: session.username,
        email: session.email,
      });
    }
  }, [session, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const response = await http.put('/user/me', values);
      refresh();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      console.log(error);
      toast.error('Failed to update avatar');
    } finally {
      setIsAvatarLoading(false);
      setSelectedFile(null);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your profile information and avatar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="size-24">
                <AvatarImage src={session.avatarUrl} alt={session.username} />
                <AvatarFallback>{getAbbreviation(session.username)}</AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar"
                className="bg-primary text-primary-foreground hover:bg-primary/90 absolute bottom-0 right-0 flex size-8 cursor-pointer items-center justify-center rounded-full"
              >
                <Camera className="size-4" />
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={isAvatarLoading}
                />
              </label>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{session.username}</h3>
              <p className="text-muted-foreground text-sm">{session.email}</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

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
