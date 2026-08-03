import { ProcessingClient } from "./ProcessingClient";

// Next.js 16 App Router: `params` is a Promise and must be awaited.
export default async function ProcessingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProcessingClient claimId={id} />;
}
