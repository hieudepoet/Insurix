'use client';

import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@mysten/dapp-kit/dist/index.css';

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
          <div className="min-h-screen bg-gray-950 text-white">
            {/* App navigation bar */}
            <nav className="border-b border-gray-800 px-6 py-4">
              <div className="flex items-center justify-between max-w-7xl mx-auto">
                <a href="/" className="text-xl font-bold text-blue-400">Insurix</a>
                <div className="flex items-center gap-6">
                  <a href="/claims" className="text-gray-300 hover:text-white">My Claims</a>
                  <a href="/admin" className="text-gray-300 hover:text-white">Admin</a>
                </div>
              </div>
            </nav>
            <main className="max-w-7xl mx-auto px-6 py-8">
              {children}
            </main>
          </div>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
