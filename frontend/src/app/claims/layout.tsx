'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from '@/lib/session';
import { MobileLayout } from '@/components/MobileLayout';
import { ToastProvider } from '@/components/Toast';

// react-query is retained for data fetching (getClaims/getClaim/settleClaim).
// Wallet providers (@mysten/dapp-kit) have been removed in favor of the mock session.
const queryClient = new QueryClient();

export default function ClaimsLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <MobileLayout>
          <ToastProvider>{children}</ToastProvider>
        </MobileLayout>
      </SessionProvider>
    </QueryClientProvider>
  );
}
