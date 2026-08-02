/// Claim represents a single insurance claim submitted by a customer.
/// Shared object so the settlement admin can access it for settlement/rejection.
module insurix_settlement::claim;

use sui::object::{Self, UID, ID};
use sui::tx_context::{Self, TxContext};
use sui::event;

// === Events ===
// Event structs must live in the module that emits them (Sui Move rule), so
// each source module in this package defines its own instead of sharing a
// centralized `events` module.

/// Emitted when a new claim is created.
public struct ClaimCreated has copy, drop {
    claim_id: ID,
    owner: address,
    amount: u64,
    product_type: u8,
}

// === Status constants ===

/// Claim is pending review/settlement.
const STATUS_PENDING: u8 = 0;
/// Claim has been settled and escrow released.
const STATUS_SETTLED: u8 = 1;
/// Claim has been rejected.
const STATUS_REJECTED: u8 = 2;

// === Product type constants ===

/// Flight delay insurance product.
const PRODUCT_FLIGHT_DELAY: u8 = 0;
/// Heavy rain (weather) insurance product.
const PRODUCT_HEAVY_RAIN: u8 = 1;

// === Error codes ===

/// `product_type` is not one of the known PRODUCT_* constants.
const EInvalidProductType: u64 = 0;

// === Claim object ===

/// A single insurance claim. Shared so the settlement module can mutate it.
public struct Claim has key {
    id: UID,
    /// The claimant's address.
    owner: address,
    /// Claim amount in MIST (smallest SUI unit).
    amount: u64,
    /// Product type (PRODUCT_FLIGHT_DELAY, PRODUCT_HEAVY_RAIN, etc.).
    product_type: u8,
    /// Timestamp (ms) when the claim was created.
    created_at_ms: u64,
    /// Current status (STATUS_PENDING, STATUS_SETTLED, STATUS_REJECTED).
    status: u8,
}

// === Entry functions ===

/// Create a new claim and share it so the settlement admin can access it.
public fun create_claim(
    amount: u64,
    product_type: u8,
    ctx: &mut TxContext,
) {
    assert!(
        product_type == PRODUCT_FLIGHT_DELAY || product_type == PRODUCT_HEAVY_RAIN,
        EInvalidProductType,
    );
    let owner = ctx.sender();
    let claim = Claim {
        id: object::new(ctx),
        owner,
        amount,
        product_type,
        created_at_ms: ctx.epoch_timestamp_ms(),
        status: STATUS_PENDING,
    };
    event::emit(ClaimCreated {
        claim_id: object::id(&claim),
        owner,
        amount,
        product_type,
    });
    transfer::share_object(claim);
}

// === Getters ===

/// The claim's object ID.
public fun id(claim: &Claim): ID { object::id(claim) }

/// The claimant's address.
public fun owner(claim: &Claim): address { claim.owner }

/// The claim amount in MIST.
public fun amount(claim: &Claim): u64 { claim.amount }

/// The product type.
public fun product_type(claim: &Claim): u8 { claim.product_type }

/// Current status code.
public fun status(claim: &Claim): u8 { claim.status }

/// Whether the claim is still pending.
public fun is_pending(claim: &Claim): bool { claim.status == STATUS_PENDING }

/// Whether the claim has been settled.
public fun is_settled(claim: &Claim): bool { claim.status == STATUS_SETTLED }

/// Whether the claim has been rejected.
public fun is_rejected(claim: &Claim): bool { claim.status == STATUS_REJECTED }

// === Package-only mutators ===

/// Mark the claim as settled. Only callable from within this package.
public(package) fun mark_settled(claim: &mut Claim) {
    claim.status = STATUS_SETTLED;
}

/// Mark the claim as rejected. Only callable from within this package.
public(package) fun mark_rejected(claim: &mut Claim) {
    claim.status = STATUS_REJECTED;
}
