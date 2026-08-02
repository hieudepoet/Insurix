'use client';

import Link from 'next/link';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@mysten/dapp-kit/dist/index.css';
import { WalletConnect } from '@/components/WalletConnect';

const queryClient = new QueryClient();

const networks = {
  testnet: { url: 'https://fullnode.testnet.sui.io:443', network: 'testnet' as const },
  mainnet: { url: 'https://fullnode.mainnet.sui.io:443', network: 'mainnet' as const },
};

export default function ClaimsLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <div className="relative min-h-screen bg-[#0a0e27] text-white">
            {/* Subtle grid background */}
            <div className="fixed inset-0 bg-grid pointer-events-none opacity-50" />

            {/* Navigation bar */}
            <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
              <div className="flex items-center justify-between max-w-7xl mx-auto px-6 py-4">
                <Link href="/" className="text-xl font-bold text-gradient">
                  Insurix
                </Link>
                <div className="flex items-center gap-6">
                  <Link href="/claims" className="text-gray-300 hover:text-white transition-colors">
                    My Claims
                  </Link>
                  <Link href="/claims/new" className="text-gray-300 hover:text-white transition-colors">
                    New Claim
                  </Link>
                  <Link href="/admin" className="text-gray-300 hover:text-white transition-colors">
                    Admin
                  </Link>
                  <div className="ml-2">
                    <WalletConnect />
                  </div>
                </div>
              </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
              {children}
            </main>
          </div>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
