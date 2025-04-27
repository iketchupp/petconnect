import { AuthProvider } from '@/contexts/auth-context';

import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { WebSocketProvider } from '@/providers/websocket-provider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <TooltipProvider>
          <AuthProvider>
            <WebSocketProvider>
              {children}
              <Toaster richColors />
            </WebSocketProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
