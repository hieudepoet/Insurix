/// Centralized event definitions for the Insurix settlement package.
///
/// All settlement-related events are defined here so claim, escrow, and
/// settlement modules emit consistent, indexable event types.
module insurix_settlement::events;

use sui::object::ID;

/// Emitted when a new claim is created.
public struct ClaimCreated has copy, drop {
    claim_id: ID,
    owner: address,
    amount: u64,
    product_type: u8,
}

/// Emitted when a claim is settled and escrow released.
public struct ClaimSettled has copy, drop {
    claim_id: ID,
    beneficiary: address,
    amount: u64,
}

/// Emitted when a claim is rejected.
public struct ClaimRejected has copy, drop {
    claim_id: ID,
    reason: u64,
}

/// Emitted when an escrow is created for a claim.
public struct EscrowCreated has copy, drop {
    escrow_id: ID,
    claim_id: ID,
    amount: u64,
    beneficiary: address,
}

/// Emitted when escrow funds are released to the beneficiary.
public struct EscrowReleased has copy, drop {
    escrow_id: ID,
    claim_id: ID,
    amount: u64,
}

/// Emitted when escrow funds are reclaimed by the admin (rejected claim).
public struct EscrowReclaimed has copy, drop {
    escrow_id: ID,
    claim_id: ID,
    amount: u64,
}
