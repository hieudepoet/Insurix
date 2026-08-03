// Static demo data. Nothing here calls a network — every value is seeded so
// the app can be clicked through offline. Thresholds match the real backend
// (backend/src/agents/external-data.ts, fraud-check.ts): flight delay > 120min,
// rainfall > 50mm, fraud check fails on a duplicate claim within a 24h window.

export type ProductType = "flight-delay" | "heavy-rain" | "health";

export type CheckpointId = "identity" | "externalData" | "fraudCheck";

export type CheckpointState = "pending" | "checking" | "verified" | "failed";

export interface CheckpointRecord {
  id: CheckpointId;
  title: string;
  description: string;
  /** Longer, technical explanation of what this checkpoint actually does and why it can't be gamed — shown on the processing screen. */
  narrative: string;
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
  /** Guidance shown on a rejected claim: what the checkpoint failure means and what the user can actually do about it. */
  remediation?: string;
  failedCheckpoint?: CheckpointId;
  checkpoints: CheckpointRecord[];
  eventSummary: { label: string; value: string }[];
}

// The technical "why" behind each checkpoint — generic to the checkpoint
// type, not the individual claim. Shown on the processing screen so the
// verification sequence reads as a real audit trail, not a spinner.
const CHECKPOINT_NARRATIVE: Record<CheckpointId, string> = {
  identity:
    "Every Insurix policyholder verifies their identity once, at onboarding. This checkpoint doesn't re-run that process — it confirms this claim's signer matches that original attestation and hasn't been revoked, so a claim can only ever be filed by the policyholder it names.",
  externalData:
    "This is the checkpoint that keeps the claim honest. It queries a data source neither the policyholder nor Insurix controls — aviation records, a weather station reading, or a hospital's billing system, depending on your policy — and compares it against your policy's trigger threshold. Self-reported numbers are never used; if the source doesn't independently confirm the event, this checkpoint fails regardless of what the claim form says.",
  fraudCheck:
    "A rules engine checks this claim against recent activity on the same policy — duplicate submissions, blocklisted accounts, and known abuse patterns — before any funds move. It's the last gate before settlement, and the one most likely to catch a claim that looks legitimate on paper but isn't.",
};

export interface InsuranceCategory {
  id: string;
  name: string;
  description: string;
  from: string;
  /** Promo/status tag shown as a larger badge on the card — e.g. a limited-time discount or a popularity signal. */
  badge?: string;
  /** This category's own accent color — a scoped exception to the app's gold/dark system so each coverage type reads distinctly, the way real insurance marketplaces color-code categories. */
  color: string;
}

// Browsable coverage categories — mock/inert (no purchase flow), shown on
// the Policies hub so the app reads as a full insurance product line rather
// than the two owned, claimable policies alone.
export const INSURANCE_CATEGORIES: InsuranceCategory[] = [
  {
    id: "health",
    name: "Health",
    description: "Hospital stays, outpatient visits & prescription cover",
    from: "$12/mo",
    badge: "Popular",
    color: "#f43f5e",
  },
  {
    id: "motor",
    name: "Motor",
    description: "Accident, theft & third-party liability for your vehicle",
    from: "$18/mo",
    color: "#3b82f6",
  },
  {
    id: "home",
    name: "Home",
    description: "Fire, flood & burglary protection for renters and owners",
    from: "$9/mo",
    badge: "Save 15%",
    color: "#f59e0b",
  },
  {
    id: "life",
    name: "Life",
    description: "Term life cover that protects your family's income",
    from: "$15/mo",
    color: "#14b8a6",
  },
  {
    id: "gadget",
    name: "Gadget",
    description: "Cracked screens, water damage & theft for phones & laptops",
    from: "$4/mo",
    badge: "New",
    color: "#06b6d4",
  },
  {
    id: "pet",
    name: "Pet",
    description: "Vet bills, surgery & emergency care for cats and dogs",
    from: "$7/mo",
    color: "#22c55e",
  },
  {
    id: "business",
    name: "Business",
    description: "Liability, property & equipment cover for small teams",
    from: "$25/mo",
    color: "#78716c",
  },
];

export interface Bill {
  id: string;
  policyName: string;
  amountUsd: number;
  dueDate: string;
}

export const BILLS: Bill[] = [
  { id: "bill-1", policyName: "Flight Delay Shield", amountUsd: 14, dueDate: "Aug 15" },
  { id: "bill-2", policyName: "Heavy Rain Cover", amountUsd: 9, dueDate: "Aug 22" },
  { id: "bill-3", policyName: "Health Shield", amountUsd: 12, dueDate: "Aug 18" },
];

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
  {
    id: "pol-health",
    product: "health",
    name: "Health Shield",
    coverageLabel: "Treatment reimbursement · ≥ $50 deductible",
    policyNumber: "HLS-5510-VN",
    payoutUsd: 150,
    active: true,
    meta: "Covers hospital & outpatient treatment",
  },
];

function baseCheckpoints(): CheckpointRecord[] {
  return [
    {
      id: "identity",
      title: "Identity",
      description: "Confirms the claim belongs to the verified policyholder",
      narrative: CHECKPOINT_NARRATIVE.identity,
      state: "pending",
    },
    {
      id: "externalData",
      title: "External Data",
      description: "Confirms the triggering event against an independent data source",
      narrative: CHECKPOINT_NARRATIVE.externalData,
      state: "pending",
    },
    {
      id: "fraudCheck",
      title: "Fraud Check",
      description: "Screens the claim for duplicate or suspicious patterns",
      narrative: CHECKPOINT_NARRATIVE.fraudCheck,
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
  // Scripted for the demo: identity and external data both check out for
  // real, but the fraud checkpoint is scripted to catch a duplicate-claim
  // pattern. ProcessingClient reads this field to decide which checkpoint
  // to fail live — `status` stays "pending" until it actually resolves.
  failedCheckpoint: "fraudCheck",
  rejectionReason:
    "A claim referencing this same policy window was already attested 3h 12m earlier.",
  remediation:
    "If you believe this is a mistake, file an appeal with supporting evidence (boarding pass, a second policy reference) — appeals are reviewed within 24 hours. Don't resubmit the same claim in the meantime; a duplicate submission restarts the review window instead of speeding it up.",
  checkpoints: baseCheckpoints(),
  eventSummary: [
    { label: "Location", value: "Da Nang, VN" },
    { label: "Trip window", value: "Aug 1 – Aug 4" },
    { label: "Rainfall recorded", value: "62 mm (threshold 50 mm)" },
  ],
};

// A health claim ready to be filed live in the demo — the most common
// real-world case (an outpatient visit above the policy's deductible). All
// three checkpoints pass → instant settlement, same mechanism as flight
// delay and heavy rain, proving the attestation pipeline is product-agnostic.
export const SCENARIO_HEALTH: Claim = {
  id: "CLM-71061",
  policyId: "pol-health",
  product: "health",
  title: "Outpatient visit · Cho Ray Hospital",
  subtitle: "Treatment cost $85, deductible $50",
  amountUsd: 150,
  status: "pending",
  createdAt: new Date().toISOString(),
  checkpoints: baseCheckpoints(),
  eventSummary: [
    { label: "Provider", value: "Cho Ray Hospital, HCMC" },
    { label: "Visit date", value: "Aug 2, 2026" },
    { label: "Treatment cost", value: "$85 (deductible $50)" },
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
      narrative: CHECKPOINT_NARRATIVE.identity,
      state: "verified",
      attestationId: "att_id_4f9a2c",
      verifiedAt: "2026-07-29T09:12:14.000Z",
      detail: "Policyholder verified against onboarding record",
    },
    {
      id: "externalData",
      title: "External Data",
      description: "Confirms the triggering event against an independent data source",
      narrative: CHECKPOINT_NARRATIVE.externalData,
      state: "verified",
      attestationId: "att_ext_7be013",
      verifiedAt: "2026-07-29T09:12:27.000Z",
      detail: "Aviation data source: 161 min delay (threshold 120 min)",
    },
    {
      id: "fraudCheck",
      title: "Fraud Check",
      description: "Screens the claim for duplicate or suspicious patterns",
      narrative: CHECKPOINT_NARRATIVE.fraudCheck,
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
  remediation:
    "If you believe this is a mistake, file an appeal with supporting evidence (boarding pass, a second policy reference) — appeals are reviewed within 24 hours. Don't resubmit the same claim in the meantime; a duplicate submission restarts the review window instead of speeding it up.",
  checkpoints: [
    {
      id: "identity",
      title: "Identity",
      description: "Confirms the claim belongs to the verified policyholder",
      narrative: CHECKPOINT_NARRATIVE.identity,
      state: "verified",
      attestationId: "att_id_1a77bd",
      verifiedAt: "2026-07-22T16:04:11.000Z",
      detail: "Policyholder verified against onboarding record",
    },
    {
      id: "externalData",
      title: "External Data",
      description: "Confirms the triggering event against an independent data source",
      narrative: CHECKPOINT_NARRATIVE.externalData,
      state: "verified",
      attestationId: "att_ext_99dc42",
      verifiedAt: "2026-07-22T16:04:24.000Z",
      detail: "Weather data source: 58 mm rainfall (threshold 50 mm)",
    },
    {
      id: "fraudCheck",
      title: "Fraud Check",
      description: "Screens the claim for duplicate or suspicious patterns",
      narrative: CHECKPOINT_NARRATIVE.fraudCheck,
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

export const HISTORY_HEALTH_SETTLED: Claim = {
  id: "CLM-70932",
  policyId: "pol-health",
  product: "health",
  title: "Outpatient visit · Vinmec International",
  subtitle: "Treatment cost $63, deductible $50",
  amountUsd: 150,
  status: "settled",
  createdAt: "2026-07-25T10:30:00.000Z",
  settledAt: "2026-07-25T10:31:02.000Z",
  checkpoints: [
    {
      id: "identity",
      title: "Identity",
      description: "Confirms the claim belongs to the verified policyholder",
      narrative: CHECKPOINT_NARRATIVE.identity,
      state: "verified",
      attestationId: "att_id_7c3e19",
      verifiedAt: "2026-07-25T10:30:19.000Z",
      detail: "Policyholder verified against onboarding record",
    },
    {
      id: "externalData",
      title: "External Data",
      description: "Confirms the triggering event against an independent data source",
      narrative: CHECKPOINT_NARRATIVE.externalData,
      state: "verified",
      attestationId: "att_ext_2fa8c1",
      verifiedAt: "2026-07-25T10:30:41.000Z",
      detail: "Hospital billing record: $63 treatment cost (deductible $50)",
    },
    {
      id: "fraudCheck",
      title: "Fraud Check",
      description: "Screens the claim for duplicate or suspicious patterns",
      narrative: CHECKPOINT_NARRATIVE.fraudCheck,
      state: "verified",
      attestationId: "att_frd_88b21e",
      verifiedAt: "2026-07-25T10:31:02.000Z",
      detail: "Rule score 100/100 · no duplicate window",
    },
  ],
  eventSummary: [
    { label: "Provider", value: "Vinmec International, Hanoi" },
    { label: "Treatment cost", value: "$63 (deductible $50)" },
  ],
};

export const CLAIM_HISTORY: Claim[] = [HISTORY_SETTLED, HISTORY_HEALTH_SETTLED, HISTORY_REJECTED];

export function findPolicy(id: string): Policy | undefined {
  return POLICIES.find((p) => p.id === id);
}

export function findAnyClaim(id: string): Claim | undefined {
  return [
    SCENARIO_SUCCESS,
    SCENARIO_FAILURE,
    SCENARIO_HEALTH,
    HISTORY_SETTLED,
    HISTORY_REJECTED,
    HISTORY_HEALTH_SETTLED,
  ].find((c) => c.id === id);
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

const HEX = "0123456789abcdef";

export function randomAttestationId(prefix: string): string {
  let hex = "";
  for (let i = 0; i < 6; i++) hex += HEX[Math.floor(Math.random() * 16)];
  return `att_${prefix}_${hex}`;
}

export function nowLabel(): string {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
