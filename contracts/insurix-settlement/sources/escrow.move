/// Escrow holds SUI coins locked to a specific claim.
/// Shared object so the settlement module can release or reclaim funds.
/// Funds are held in a `Balance<SUI>` for gas-efficient custody.
module insurix_settlement::escrow;

use sui::object::{Self, UID, ID};
use sui::coin::{Self, Coin};
use sui::sui::SUI;
use sui::balance::{Self, Balance};
use sui::tx_context::{Self, TxContext};
use sui::event;

// === Events ===
// Event structs must live in the module that emits them (Sui Move rule), so
// each source module in this package defines its own instead of sharing a
// centralized `events` module.

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

// === Status constants ===

/// Escrow is locked, funds are held.
const STATUS_LOCKED: u8 = 0;
/// Escrow has been released to the beneficiary.
const STATUS_RELEASED: u8 = 1;
/// Escrow has been reclaimed by the admin (rejected claim).
const STATUS_RECLAIMED: u8 = 2;

// === Error codes ===

/// Escrow is not in LOCKED status; cannot release or reclaim.
const EEscrowNotLocked: u64 = 0;

// === Escrow object ===

/// Custody object holding SUI locked to a claim. Shared so settlement can
/// release funds to the beneficiary or reclaim them for the admin.
public struct Escrow has key {
    id: UID,
    /// The claim this escrow is tied to.
    claim_id: ID,
    /// SUI balance held in custody.
    balance: Balance<SUI>,
    /// Current status (STATUS_LOCKED, STATUS_RELEASED, STATUS_RECLAIMED).
    status: u8,
    /// Address to receive funds on release (typically the claimant).
    beneficiary: address,
}

// === Entry functions ===

/// Create an escrow by depositing SUI coins. The escrow is shared so the
/// settlement module can later release or reclaim funds.
public fun create_escrow(
    claim_id: ID,
    coins: Coin<SUI>,
    beneficiary: address,
    ctx: &mut TxContext,
) {
    let amount = coin::value(&coins);
    let escrow = Escrow {
        id: object::new(ctx),
        claim_id,
        balance: coin::into_balance(coins),
        status: STATUS_LOCKED,
        beneficiary,
    };
    let escrow_id = object::id(&escrow);
    event::emit(EscrowCreated {
        escrow_id,
        claim_id,
        amount,
        beneficiary,
    });
    transfer::share_object(escrow);
}

// === Package-only mutators ===

/// Release all funds to the beneficiary. Only callable from within this package.
public(package) fun release_funds(escrow: &mut Escrow, ctx: &mut TxContext) {
    assert!(escrow.status == STATUS_LOCKED, EEscrowNotLocked);
    let amount = balance::value(&escrow.balance);
    escrow.status = STATUS_RELEASED;
    let coin = coin::from_balance(escrow.balance.withdraw_all(), ctx);
    transfer::public_transfer(coin, escrow.beneficiary);
    event::emit(EscrowReleased {
        escrow_id: object::id(escrow),
        claim_id: escrow.claim_id,
        amount,
    });
}

/// Reclaim all funds to the admin address (for rejected claims).
/// Only callable from within this package.
public(package) fun reclaim_funds(
    escrow: &mut Escrow,
    admin: address,
    ctx: &mut TxContext,
) {
    assert!(escrow.status == STATUS_LOCKED, EEscrowNotLocked);
    let amount = balance::value(&escrow.balance);
    escrow.status = STATUS_RECLAIMED;
    let coin = coin::from_balance(escrow.balance.withdraw_all(), ctx);
    transfer::public_transfer(coin, admin);
    event::emit(EscrowReclaimed {
        escrow_id: object::id(escrow),
        claim_id: escrow.claim_id,
        amount,
    });
}

// === Getters ===

/// Current status code.
public fun status(escrow: &Escrow): u8 { escrow.status }

/// The claim ID this escrow is tied to.
public fun claim_id(escrow: &Escrow): ID { escrow.claim_id }

/// Current balance in MIST.
public fun balance(escrow: &Escrow): u64 { balance::value(&escrow.balance) }

/// The beneficiary address.
public fun beneficiary(escrow: &Escrow): address { escrow.beneficiary }

/// Whether the escrow is still locked.
public fun is_locked(escrow: &Escrow): bool { escrow.status == STATUS_LOCKED }

/// Whether the escrow has been released.
public fun is_released(escrow: &Escrow): bool { escrow.status == STATUS_RELEASED }

/// Whether the escrow has been reclaimed.
public fun is_reclaimed(escrow: &Escrow): bool { escrow.status == STATUS_RECLAIMED }
