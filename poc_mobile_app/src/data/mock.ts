// Static demo data. Nothing here calls a network — every value is seeded so
// the app can be clicked through offline. Thresholds match the real backend
// (backend/src/agents/external-data.ts, fraud-check.ts): flight delay > 120min,
// rainfall > 50mm, fraud check fails on a duplicate claim within a 24h window.

export type ProductType = "flight-delay" | "heavy-rain";

export type CheckpointId = "identity" | "externalData" | "fraudCheck";

export type CheckpointState = "pending" | "checking" | "verified" | "failed";

export interface CheckpointRecord {
  id: CheckpointId;
  title: string;
  description: string;
  state: CheckpointState;
  attestationId?: string;
  verifiedAt?: string;
  detail?: string;
}

export interface Policy {
  id: string;
  product: ProductType;
  name: string;
  coverageLabel: string;
  policyNumber: string;
  payoutUsd: number;
  active: boolean;
  meta: string;
}

export interface Claim {
  id: string;
  policyId: string;
  product: ProductType;
  title: string;
  subtitle: string;
  amountUsd: number;
  status: "pending" | "settled" | "rejected";
  createdAt: string;
  settledAt?: string;
  rejectionReason?: string;
  failedCheckpoint?: CheckpointId;
  checkpoints: CheckpointRecord[];
  eventSummary: { label: string; value: string }[];
}

export const POLICIES: Policy[] = [
  {
    id: "pol-flight",
    product: "flight-delay",
    name: "Flight Delay Shield",
    coverageLabel: "Delay coverage · > 120 min",
    policyNumber: "FDS-8842-VN",
    payoutUsd: 250,
    active: true,
    meta: "Covers any booked flight",
  },
  {
    id: "pol-rain",
    product: "heavy-rain",
    name: "Heavy Rain Cover",
    coverageLabel: "Rainfall coverage · > 50 mm",
    policyNumber: "HRC-2291-VN",
    payoutUsd: 180,
    active: true,
    meta: "Covers your registered trip location",
  },
];

function baseCheckpoints(): CheckpointRecord[] {
  return [
    {
      id: "identity",
      title: "Identity",
      description: "Confirms the claim belongs to the verified policyholder",
      state: "pending",
    },
    {
      id: "externalData",
      title: "External Data",
      description: "Confirms the triggering event against an independent data source",
      state: "pending",
    },
    {
      id: "fraudCheck",
      title: "Fraud Check",
      description: "Screens the claim for duplicate or suspicious patterns",
      state: "pending",
    },
  ];
}

// A flight-delay claim ready to be filed live in the demo. All three
// checkpoints pass → instant settlement.
export const SCENARIO_SUCCESS: Claim = {
  id: "CLM-71042",
  policyId: "pol-flight",
  product: "flight-delay",
  title: "Flight VN212 · SGN → HAN",
  subtitle: "Delayed 3h 05m on departure",
  amountUsd: 250,
  status: "pending",
  createdAt: new Date().toISOString(),
  checkpoints: baseCheckpoints(),
  eventSummary: [
    { label: "Flight", value: "VN212" },
    { label: "Scheduled departure", value: "14:20, Aug 3" },
    { label: "Actual departure", value: "17:25, Aug 3" },
    { label: "Delay recorded", value: "185 min (threshold 120 min)" },
  ],
};

// A heavy-rain claim that is confirmed real by external data, but the fraud
// checkpoint catches a duplicate claim on the same policy window.
export const SCENARIO_FAILURE: Claim = {
  id: "CLM-71039",
  policyId: "pol-rain",
  product: "heavy-rain",
  title: "Da Nang trip · Heavy Rain Cover",
  subtitle: "62 mm recorded at registered location",
  amountUsd: 180,
  status: "pending",
  createdAt: new Date().toISOString(),
  checkpoints: baseCheckpoints(),
  eventSummary: [
    { label: "Location", value: "Da Nang, VN" },
    { label: "Trip window", value: "Aug 1 – Aug 4" },
    { label: "Rainfall recorded", value: "62 mm (threshold 50 mm)" },
  ],
};

// Two already-resolved claims for the Claims history tab / passport detail
// screen, so that surface never opens empty.
export const HISTORY_SETTLED: Claim = {
  id: "CLM-70981",
  policyId: "pol-flight",
  product: "flight-delay",
  title: "Flight VJ408 · HAN → DAD",
  subtitle: "Delayed 2h 41m on arrival",
  amountUsd: 250,
  status: "settled",
  createdAt: "2026-07-29T09:12:00.000Z",
  settledAt: "2026-07-29T09:12:41.000Z",
  checkpoints: [
    {
      id: "identity",
      title: "Identity",
      description: "Confirms the claim belongs to the verified policyholder",
      state: "verified",
      attestationId: "att_id_4f9a2c",
      verifiedAt: "2026-07-29T09:12:14.000Z",
      detail: "Policyholder verified against onboarding record",
    },
    {
      id: "externalData",
      title: "External Data",
      description: "Confirms the triggering event against an independent data source",
      state: "verified",
      attestationId: "att_ext_7be013",
      verifiedAt: "2026-07-29T09:12:27.000Z",
      detail: "Aviation data source: 161 min delay (threshold 120 min)",
    },
    {
      id: "fraudCheck",
      title: "Fraud Check",
      description: "Screens the claim for duplicate or suspicious patterns",
      state: "verified",
      attestationId: "att_frd_c02e91",
      verifiedAt: "2026-07-29T09:12:41.000Z",
      detail: "Rule score 100/100 · no duplicate window",
    },
  ],
  eventSummary: [
    { label: "Flight", value: "VJ408" },
    { label: "Delay recorded", value: "161 min (threshold 120 min)" },
  ],
};

export const HISTORY_REJECTED: Claim = {
  id: "CLM-70890",
  policyId: "pol-rain",
  product: "heavy-rain",
  title: "Hoi An trip · Heavy Rain Cover",
  subtitle: "58 mm recorded at registered location",
  amountUsd: 180,
  status: "rejected",
  createdAt: "2026-07-22T16:04:00.000Z",
  failedCheckpoint: "fraudCheck",
  rejectionReason:
    "A claim referencing this same policy window was already attested 3h 12m earlier.",
  checkpoints: [
    {
      id: "identity",
      title: "Identity",
      description: "Confirms the claim belongs to the verified policyholder",
      state: "verified",
      attestationId: "att_id_1a77bd",
      verifiedAt: "2026-07-22T16:04:11.000Z",
      detail: "Policyholder verified against onboarding record",
    },
    {
      id: "externalData",
      title: "External Data",
      description: "Confirms the triggering event against an independent data source",
      state: "verified",
      attestationId: "att_ext_99dc42",
      verifiedAt: "2026-07-22T16:04:24.000Z",
      detail: "Weather data source: 58 mm rainfall (threshold 50 mm)",
    },
    {
      id: "fraudCheck",
      title: "Fraud Check",
      description: "Screens the claim for duplicate or suspicious patterns",
      state: "failed",
      verifiedAt: "2026-07-22T16:04:31.000Z",
      detail: "Duplicate claim window detected · score 0/100",
    },
  ],
  eventSummary: [
    { label: "Location", value: "Hoi An, VN" },
    { label: "Rainfall recorded", value: "58 mm (threshold 50 mm)" },
  ],
};

export const CLAIM_HISTORY: Claim[] = [HISTORY_SETTLED, HISTORY_REJECTED];

export function findPolicy(id: string): Policy | undefined {
  return POLICIES.find((p) => p.id === id);
}

export function findAnyClaim(id: string): Claim | undefined {
  return [SCENARIO_SUCCESS, SCENARIO_FAILURE, HISTORY_SETTLED, HISTORY_REJECTED].find(
    (c) => c.id === id,
  );
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function shortHash(id: string): string {
  return `0x${id.replace(/[^a-z0-9]/gi, "").padEnd(12, "0").slice(0, 12)}…`;
}
