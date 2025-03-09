import React from 'react';

import { AuthContainer } from '@/components/app/auth/auth-container';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthContainer>{children}</AuthContainer>;
}
