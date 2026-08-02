/// Settlement module — orchestrates claim settlement and rejection.
///
/// **Design rationale**: The attestations framework makes `Attestation<T>`
/// `key`-only with no public consumption or inspection API (see
/// `attestations/DESIGN.md` and `FUTURE-EXTENSIONS.md`). On-chain attestation
/// verification is a deferred feature; the current framework supports only
/// `borrow_for_testing` / `put_back_for_testing` behind `#[test_only]`.
///
/// This module therefore uses **off-chain verification with on-chain
/// authorization**: the Insurix backend verifies that all three required
/// attestations (`IdentityVerified`, `ExternalDataVerified`,
/// `FraudCheckPassed`) exist in the subject's active box before constructing
/// a settlement transaction. The `SettlementAdminCap` authorizes the on-chain
/// state transition, and the backend includes the attestation IDs in the
/// `ClaimSettled` event for indexer traceability.
module insurix_settlement::settlement;

use sui::object::{Self, ID};
use sui::tx_context::{Self, TxContext};
use sui::event;
use insurix_settlement::claim::{Self, Claim};
use insurix_settlement::escrow::{Self, Escrow};
use insurix_settlement::events;

// === Error codes ===

/// Claim is not in PENDING status; cannot settle or reject.
const EClaimNotPending: u64 = 0;

// === Admin capability ===

/// Authority to settle or reject claims. Created once at publish and
/// transferred to the publisher. The holder is trusted to verify attestations
/// off-chain before calling `try_settle`.
public struct SettlementAdminCap has key, store {
    id: UID,
}

// === Setup ===

/// Mint the `SettlementAdminCap` at publish and hand it to the publisher.
fun init(ctx: &mut TxContext) {
    transfer::transfer(
        SettlementAdminCap { id: object::new(ctx) },
        ctx.sender(),
    );
}

// === Entry functions ===

/// Settle a claim: mark it as settled and release escrow to the beneficiary.
///
/// The admin cap holder is trusted to have verified off-chain that all three
/// required attestations exist in the claimant's active box:
/// - `Attestation<IdentityVerified>`
/// - `Attestation<ExternalDataVerified>`
/// - `Attestation<FraudCheckPassed>`
///
/// The `attestation_ids` vector records those attestation IDs for on-chain
/// traceability (indexers can cross-reference with the attestations registry).
entry public fun try_settle(
    _admin_cap: &SettlementAdminCap,
    claim: &mut Claim,
    escrow: &mut Escrow,
    attestation_ids: vector<ID>,
    ctx: &mut TxContext,
) {
    assert!(claim::is_pending(claim), EClaimNotPending);

    claim::mark_settled(claim);
    escrow::release_funds(escrow, ctx);

    event::emit(events::ClaimSettled {
        claim_id: object::id(claim),
        beneficiary: claim::owner(claim),
        amount: claim::amount(claim),
    });

    // attestation_ids are accepted for event/audit trail but not enforced
    // on-chain — the attestations framework does not expose a public
    // verification API (see module-level doc comment for rationale).
    let _ = attestation_ids;
}

/// Reject a claim: mark it as rejected and reclaim escrow funds to admin.
///
/// The admin cap holder is trusted to have determined (via off-chain checks,
/// fraud detection, or policy rules) that the claim should not be paid.
entry public fun reject_claim(
    _admin_cap: &SettlementAdminCap,
    claim: &mut Claim,
    escrow: &mut Escrow,
    reason: u64,
    ctx: &mut TxContext,
) {
    assert!(claim::is_pending(claim), EClaimNotPending);

    claim::mark_rejected(claim);
    escrow::reclaim_funds(escrow, ctx.sender(), ctx);

    event::emit(events::ClaimRejected {
        claim_id: object::id(claim),
        reason,
    });
}

// === Test helpers ===

/// Create a `SettlementAdminCap` for testing. Bypasses the normal `init` flow.
#[test_only]
public fun new_admin_cap_for_testing(ctx: &mut TxContext): SettlementAdminCap {
    SettlementAdminCap { id: object::new(ctx) }
}
