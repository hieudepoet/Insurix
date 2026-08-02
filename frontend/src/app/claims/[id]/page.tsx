import { ClaimDetailClient } from './claim-detail-client';

// Next.js 15 App Router: `params` is a Promise and must be awaited.
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClaimDetailClient claimId={id} />;
}
