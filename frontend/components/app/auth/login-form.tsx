'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { login } from '@/actions/auth';
import { useAuthStore } from '@/stores/auth-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface LoginFormProps extends React.ComponentPropsWithoutRef<'form'> {}

const formSchema = z.object({
  email: z.string().email().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

export function LoginForm({ className, ...props }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let shouldRedirect = false;

    try {
      setIsLoading(true);

      const response = await login(values);

      if ('error' in response) {
        // Handle validation errors
        if (response.validationErrors?.length > 0) {
          response.validationErrors.forEach((error) => {
            form.setError(error.field as any, {
              message: error.message,
            });
          });
          return;
        }

        // Handle other errors
        setError(response.message);
        return;
      }

      shouldRedirect = true;
    } catch (error) {
      toast('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      if (shouldRedirect) {
        redirect('/?login=success');
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn('flex flex-col gap-6', className)} {...props}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-balance text-sm">Enter your email below to login to your account</p>
        </div>

        <div className="mt-6 space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} id={field.name} placeholder="john@example.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Button asChild variant="link" size="sm" className="p-0">
                    <Link href="#" className="link intent-info variant-ghost text-sm">
                      Forgot your Password?
                    </Link>
                  </Button>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input {...field} id={field.name} type={showPassword ? 'text' : 'password'} className="pr-10" />
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
                <FormMessage />
              </div>
            )}
          />

          {error && <p className="text-center text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>

          <div>
            <p className="text-center text-sm">
              Don't have an account?
              <Button asChild variant="link" className="px-2">
                <Link href="/auth/register" className="underline underline-offset-4">
                  Register
                </Link>
              </Button>
            </p>
          </div>
        </div>
      </form>
    </Form>
  );
}
