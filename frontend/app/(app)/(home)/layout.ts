'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.refresh);
  const reset = useAuthStore((state) => state.reset);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'unauthorized') {
      toast.error('You are not authorized to access this page.');
      reset();
      router.replace('/');
    }
    if (error === 'no_token') {
      toast.error('No token found.');
      reset();
      router.replace('/');
    }
    if (error === 'auth_failed') {
      toast.error('Authentication failed.');
      reset();
      router.replace('/');
    }
  }, [searchParams]);

  useEffect(() => {
    const login = searchParams.get('login');
    if (login) {
      initialize();
      router.replace('/');
    }
  }, [searchParams]);

  return children;
}
