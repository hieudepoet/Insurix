import { BaseClient } from '@mysten/sui/client';

const NETWORK = process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet';

const NODE_URL = NETWORK === 'mainnet'
  ? 'https://fullnode.mainnet.sui.io:443'
  : 'https://fullnode.testnet.sui.io:443';

// Use type assertion to work around abstract class typing
export const suiClient = new (BaseClient as unknown as new (config: { url: string }) => BaseClient)({ url: NODE_URL });

export function getExplorerUrl(txDigest: string): string {
  const base = NETWORK === 'mainnet'
    ? 'https://suiscan.xyz/mainnet'
    : `https://suiscan.xyz/${NETWORK}`;
  return `${base}/tx/${txDigest}`;
}

export function getObjectUrl(objectId: string): string {
  const base = NETWORK === 'mainnet'
    ? 'https://suiscan.xyz/mainnet'
    : `https://suiscan.xyz/${NETWORK}`;
  return `${base}/object/${objectId}`;
}
