'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { User } from '@/types/api';
import { http } from '@/lib/http';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    username: z.string().min(1, 'Username is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    originalEmail: z.string(),
  })
  .refine(
    (data) => {
      // If email is changed, both password fields are required
      if (data.email !== data.originalEmail) {
        return data.password && data.password.length > 0;
      }
      return true;
    },
    {
      message: 'Password is required when changing email',
      path: ['password'],
    }
  )
  .refine(
    (data) => {
      // Only validate passwords match if either is provided
      if (data.password || data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }
  );

type FormValues = z.infer<typeof formSchema> & { originalEmail: string };

interface ProfileFormProps {
  session: User;
  onUpdateSuccess: () => void;
}

export function ProfileForm({ session, onUpdateSuccess }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { reAuth } = useAuthStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      originalEmail: '',
    },
  });

  useEffect(() => {
    if (session) {
      form.reset({
        firstName: session.firstName,
        lastName: session.lastName,
        username: session.username,
        email: session.email,
        password: '',
        confirmPassword: '',
        originalEmail: session.email,
      });
    }
  }, [session, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);

      // If email is being changed, validate password with original email first
      if (values.email !== values.originalEmail) {
        if (!values.password) {
          toast.error('Password is required to change email');
          setIsLoading(false);
          return;
        }

        // Validate password with original email first
        const validateResponse = await reAuth({
          email: values.originalEmail,
          password: values.password,
        });

        if ('error' in validateResponse) {
          toast.error('Invalid current password');
          setIsLoading(false);
          return;
        }

        // Store password for later use
        const currentPassword = values.password;

        // Remove unnecessary fields before sending to API
        const { originalEmail, confirmPassword, password, ...updateData } = values;

        try {
          // Update profile
          await http.put('/user/me', updateData);

          // Re-authenticate with new email
          const authResponse = await reAuth({
            email: values.email,
            password: currentPassword,
          });

          if ('error' in authResponse) {
            toast.error('Failed to authenticate with new email');
            return;
          }

          // Only call onUpdateSuccess if everything succeeded
          onUpdateSuccess();
          toast.success('Profile updated successfully');
        } catch (error) {
          toast.error('Failed to update profile');
          // Don't reset form on error
          return;
        }
      } else {
        // No email change, just update profile
        const { originalEmail, confirmPassword, password, ...updateData } = values;
        try {
          await http.put('/user/me', updateData);
          onUpdateSuccess();
          toast.success('Profile updated successfully');
        } catch (error) {
          toast.error('Failed to update profile');
          // Don't reset form on error
          return;
        }
      }
    } catch (error) {
      toast.error('Failed to update profile');
      // Don't reset form on error
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">First Name</FormLabel>
                <FormControl>
                  <Input {...field} className="h-9" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Last Name</FormLabel>
                <FormControl>
                  <Input {...field} className="h-9" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Username</FormLabel>
              <FormControl>
                <Input {...field} className="h-9" />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" className="h-9" />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Only show password fields if email is changed */}
        {form.watch('email') !== form.watch('originalEmail') && (
          <>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Current Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input {...field} type={showPassword ? 'text' : 'password'} className="h-9 pr-10" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:cursor-pointer hover:bg-transparent"
                        onClick={togglePasswordVisibility}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" aria-hidden="true" />
                        ) : (
                          <Eye className="size-4" aria-hidden="true" />
                        )}
                        <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Confirm Current Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input {...field} type={showPassword ? 'text' : 'password'} className="h-9 pr-10" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:cursor-pointer hover:bg-transparent"
                        onClick={togglePasswordVisibility}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" aria-hidden="true" />
                        ) : (
                          <Eye className="size-4" aria-hidden="true" />
                        )}
                        <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </>
        )}

        <Button type="submit" disabled={isLoading} className="mt-2 w-full">
          {isLoading ? 'Updating...' : 'Update Profile'}
        </Button>
      </form>
    </Form>
  );
}
