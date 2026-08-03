import { ClaimDetailClient } from "./ClaimDetailClient";

// Next.js 16 App Router: `params` is a Promise and must be awaited.
export default async function ClaimDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClaimDetailClient claimId={id} />;
}
