#[test_only]
module insurix_settlement::settlement_tests;

use std::unit_test::assert_eq;
use sui::test_scenario::{Self, Scenario};
use sui::coin;
use sui::sui::SUI;
use insurix_settlement::claim::{Self, Claim};
use insurix_settlement::escrow::{Self, Escrow};
use insurix_settlement::settlement::{Self, SettlementAdminCap};

const ALICE: address = @0xA11CE;

const CLAIM_AMOUNT: u64 = 100_000_000; // 0.1 SUI in MIST
const PRODUCT_FLIGHT_DELAY: u8 = 0;
const REASON_FRAUD: u64 = 42;

// === Helpers ===

/// Begin a scenario and mint a SettlementAdminCap.
fun begin(): (Scenario, SettlementAdminCap) {
    let mut scenario = test_scenario::begin(ALICE);
    let cap = settlement::new_admin_cap_for_testing(scenario.ctx());
    scenario.next_tx(ALICE);
    (scenario, cap)
}

/// Create a claim (shared) and return its ID.
fun create_claim(scenario: &mut Scenario): ID {
    claim::create_claim(CLAIM_AMOUNT, PRODUCT_FLIGHT_DELAY, scenario.ctx());
    scenario.next_tx(ALICE);
    let claim: Claim = scenario.take_shared();
    let id = object::id(&claim);
    test_scenario::return_shared(claim);
    scenario.next_tx(ALICE);
    id
}

/// Create an escrow (shared) for `claim_id` with `amount` MIST, beneficiary ALICE.
fun create_escrow_for(scenario: &mut Scenario, claim_id: ID, amount: u64): ID {
    let coins = coin::mint_for_testing(amount, scenario.ctx());
    escrow::create_escrow(claim_id, coins, ALICE, scenario.ctx());
    scenario.next_tx(ALICE);
    let escrow: Escrow = scenario.take_shared();
    let id = object::id(&escrow);
    test_scenario::return_shared(escrow);
    scenario.next_tx(ALICE);
    id
}

// =====================================================================
// Claim tests
// =====================================================================

#[test]
fun create_claim_sets_fields_correctly() {
    let (mut scenario, _cap) = begin();
    let claim_id = create_claim(&mut scenario);

    let claim: Claim = scenario.take_shared();
    assert_eq!(object::id(&claim), claim_id);
    assert_eq!(claim::owner(&claim), ALICE);
    assert_eq!(claim::amount(&claim), CLAIM_AMOUNT);
    assert_eq!(claim::product_type(&claim), PRODUCT_FLIGHT_DELAY);
    assert!(claim::is_pending(&claim));
    assert!(!claim::is_settled(&claim));
    assert!(!claim::is_rejected(&claim));
    test_scenario::return_shared(claim);
    scenario.end();
}

// =====================================================================
// Escrow tests
// =====================================================================

#[test]
fun create_escrow_sets_fields_correctly() {
    let (mut scenario, _cap) = begin();
    let claim_id = create_claim(&mut scenario);
    let escrow_id = create_escrow_for(&mut scenario, claim_id, CLAIM_AMOUNT);

    let escrow: Escrow = scenario.take_shared();
    assert_eq!(object::id(&escrow), escrow_id);
    assert_eq!(escrow::claim_id(&escrow), claim_id);
    assert_eq!(escrow::balance(&escrow), CLAIM_AMOUNT);
    assert_eq!(escrow::beneficiary(&escrow), ALICE);
    assert!(escrow::is_locked(&escrow));
    assert!(!escrow::is_released(&escrow));
    assert!(!escrow::is_reclaimed(&escrow));
    test_scenario::return_shared(escrow);
    scenario.end();
}

// =====================================================================
// Settlement tests
// =====================================================================

/// Happy path: admin settles a pending claim, escrow releases to beneficiary.
#[test]
fun try_settle_succeeds() {
    let (mut scenario, cap) = begin();
    let claim_id = create_claim(&mut scenario);
    let _escrow_id = create_escrow_for(&mut scenario, claim_id, CLAIM_AMOUNT);

    let balance_before = test_scenario::account_balance(ALICE);

    let mut claim_obj: Claim = scenario.take_shared();
    let mut escrow_obj: Escrow = scenario.take_shared();
    settlement::try_settle(&cap, &mut claim_obj, &mut escrow_obj, vector::empty(), scenario.ctx());

    // Verify state transitions.
    assert!(claim::is_settled(&claim_obj));
    assert_eq!(claim::status(&claim_obj), 1);
    assert!(escrow::is_released(&escrow_obj));
    assert_eq!(escrow::status(&escrow_obj), 1);
    assert_eq!(escrow::balance(&escrow_obj), 0);

    transfer::public_transfer(cap, ALICE);
    scenario.end();
}

/// After settlement, the beneficiary's SUI balance increases by the claim amount.
#[test]
fun try_settle_transfers_correct_amount() {
    let (mut scenario, cap) = begin();
    let claim_id = create_claim(&mut scenario);
    let _escrow_id = create_escrow_for(&mut scenario, claim_id, CLAIM_AMOUNT);

    let balance_before = test_scenario::account_balance(ALICE);

    let mut claim_obj: Claim = scenario.take_shared();
    let mut escrow_obj: Escrow = scenario.take_shared();
    settlement::try_settle(&cap, &mut claim_obj, &mut escrow_obj, vector::empty(), scenario.ctx());

    let balance_after = test_scenario::account_balance(ALICE);
    assert_eq!(balance_after, balance_before + CLAIM_AMOUNT);

    transfer::public_transfer(cap, ALICE);
    scenario.end();
}

/// Settlement accepts attestation IDs for audit trail without on-chain enforcement.
#[test]
fun try_settle_accepts_attestation_ids() {
    let (mut scenario, cap) = begin();
    let claim_id = create_claim(&mut scenario);
    let _escrow_id = create_escrow_for(&mut scenario, claim_id, CLAIM_AMOUNT);

    let fake_id = @0x1.to_id();
    let mut claim_obj: Claim = scenario.take_shared();
    let mut escrow_obj: Escrow = scenario.take_shared();
    settlement::try_settle(
        &cap, &mut claim_obj, &mut escrow_obj, vector[fake_id], scenario.ctx(),
    );

    // Settlement succeeds regardless (off-chain verification model).
    assert!(claim::is_settled(&claim_obj));
    assert!(escrow::is_released(&escrow_obj));

    transfer::public_transfer(cap, ALICE);
    scenario.end();
}

// =====================================================================
// Double-settle protection
// =====================================================================

/// Second settlement attempt on the same claim aborts with EClaimNotPending.
#[test]
#[expected_failure(abort_code = settlement::EClaimNotPending)]
fun double_settle_aborts() {
    let (mut scenario, cap) = begin();
    let claim_id = create_claim(&mut scenario);
    let _escrow_id = create_escrow_for(&mut scenario, claim_id, CLAIM_AMOUNT);

    let mut claim_obj: Claim = scenario.take_shared();
    let mut escrow_obj: Escrow = scenario.take_shared();

    // First settle succeeds.
    settlement::try_settle(&cap, &mut claim_obj, &mut escrow_obj, vector::empty(), scenario.ctx());
    // Second settle aborts: claim is no longer pending.
    settlement::try_settle(&cap, &mut claim_obj, &mut escrow_obj, vector::empty(), scenario.ctx());
}

// =====================================================================
// Rejection tests
// =====================================================================

/// Admin rejects a pending claim, escrow reclaims to admin.
#[test]
fun reject_claim_succeeds() {
    let (mut scenario, cap) = begin();
    let claim_id = create_claim(&mut scenario);
    let _escrow_id = create_escrow_for(&mut scenario, claim_id, CLAIM_AMOUNT);

    let balance_before = test_scenario::account_balance(ALICE);

    let mut claim_obj: Claim = scenario.take_shared();
    let mut escrow_obj: Escrow = scenario.take_shared();
    settlement::reject_claim(&cap, &mut claim_obj, &mut escrow_obj, REASON_FRAUD, scenario.ctx());

    assert!(claim::is_rejected(&claim_obj));
    assert_eq!(claim::status(&claim_obj), 2);
    assert!(escrow::is_reclaimed(&escrow_obj));
    assert_eq!(escrow::status(&escrow_obj), 2);
    assert_eq!(escrow::balance(&escrow_obj), 0);

    // Admin (ALICE) received reclaimed funds.
    let balance_after = test_scenario::account_balance(ALICE);
    assert_eq!(balance_after, balance_before + CLAIM_AMOUNT);

    transfer::public_transfer(cap, ALICE);
    scenario.end();
}

/// Rejecting an already-settled claim aborts.
#[test]
#[expected_failure(abort_code = settlement::EClaimNotPending)]
fun reject_after_settle_aborts() {
    let (mut scenario, cap) = begin();
    let claim_id = create_claim(&mut scenario);
    let _escrow_id = create_escrow_for(&mut scenario, claim_id, CLAIM_AMOUNT);

    let mut claim_obj: Claim = scenario.take_shared();
    let mut escrow_obj: Escrow = scenario.take_shared();

    // Settle first.
    settlement::try_settle(&cap, &mut claim_obj, &mut escrow_obj, vector::empty(), scenario.ctx());
    // Reject after settle aborts.
    settlement::reject_claim(&cap, &mut claim_obj, &mut escrow_obj, 1, scenario.ctx());
}

/// Settling an already-rejected claim aborts.
#[test]
#[expected_failure(abort_code = settlement::EClaimNotPending)]
fun settle_after_reject_aborts() {
    let (mut scenario, cap) = begin();
    let claim_id = create_claim(&mut scenario);
    let _escrow_id = create_escrow_for(&mut scenario, claim_id, CLAIM_AMOUNT);

    let mut claim_obj: Claim = scenario.take_shared();
    let mut escrow_obj: Escrow = scenario.take_shared();

    // Reject first.
    settlement::reject_claim(&cap, &mut claim_obj, &mut escrow_obj, 99, scenario.ctx());
    // Settle after reject aborts.
    settlement::try_settle(&cap, &mut claim_obj, &mut escrow_obj, vector::empty(), scenario.ctx());
}

// =====================================================================
// Escrow double-release protection
// =====================================================================

/// Direct double-release on escrow aborts after settlement already released it.
#[test]
#[expected_failure(abort_code = escrow::EEscrowNotLocked)]
fun double_release_aborts() {
    let (mut scenario, cap) = begin();
    let claim_id = create_claim(&mut scenario);
    let _escrow_id = create_escrow_for(&mut scenario, claim_id, CLAIM_AMOUNT);

    let mut claim_obj: Claim = scenario.take_shared();
    let mut escrow_obj: Escrow = scenario.take_shared();

    // Release via settlement.
    settlement::try_settle(&cap, &mut claim_obj, &mut escrow_obj, vector::empty(), scenario.ctx());
    // Direct release should abort (escrow no longer locked).
    escrow::release_funds(&mut escrow_obj, scenario.ctx());
}

/// Direct double-reclaim on escrow aborts after rejection already reclaimed it.
#[test]
#[expected_failure(abort_code = escrow::EEscrowNotLocked)]
fun double_reclaim_aborts() {
    let (mut scenario, cap) = begin();
    let claim_id = create_claim(&mut scenario);
    let _escrow_id = create_escrow_for(&mut scenario, claim_id, CLAIM_AMOUNT);

    let mut claim_obj: Claim = scenario.take_shared();
    let mut escrow_obj: Escrow = scenario.take_shared();

    // Reclaim via rejection.
    settlement::reject_claim(&cap, &mut claim_obj, &mut escrow_obj, 1, scenario.ctx());
    // Direct reclaim should abort (escrow no longer locked).
    escrow::reclaim_funds(&mut escrow_obj, ALICE, scenario.ctx());
}

// =====================================================================
// Status transition completeness
// =====================================================================

/// Full lifecycle: pending -> settled, locked -> released.
#[test]
fun full_settlement_lifecycle() {
    let (mut scenario, cap) = begin();

    // 1. Create claim — pending.
    let claim_id = create_claim(&mut scenario);
    let claim: Claim = scenario.take_shared();
    assert!(claim::is_pending(&claim));
    test_scenario::return_shared(claim);

    // 2. Create escrow — locked.
    let _escrow_id = create_escrow_for(&mut scenario, claim_id, CLAIM_AMOUNT);
    let escrow: Escrow = scenario.take_shared();
    assert!(escrow::is_locked(&escrow));
    test_scenario::return_shared(escrow);

    // 3. Settle — transitions to settled/released.
    let mut claim_obj: Claim = scenario.take_shared();
    let mut escrow_obj: Escrow = scenario.take_shared();
    settlement::try_settle(&cap, &mut claim_obj, &mut escrow_obj, vector::empty(), scenario.ctx());

    // 4. Verify final states.
    assert!(claim::is_settled(&claim_obj));
    assert!(!claim::is_pending(&claim_obj));
    assert!(!claim::is_rejected(&claim_obj));

    assert!(escrow::is_released(&escrow_obj));
    assert!(!escrow::is_locked(&escrow_obj));
    assert!(!escrow::is_reclaimed(&escrow_obj));

    transfer::public_transfer(cap, ALICE);
    scenario.end();
}

/// Full rejection lifecycle: pending -> rejected, locked -> reclaimed.
#[test]
fun full_rejection_lifecycle() {
    let (mut scenario, cap) = begin();

    // 1. Create claim — pending.
    let claim_id = create_claim(&mut scenario);
    let claim: Claim = scenario.take_shared();
    assert!(claim::is_pending(&claim));
    test_scenario::return_shared(claim);

    // 2. Create escrow — locked.
    let _escrow_id = create_escrow_for(&mut scenario, claim_id, CLAIM_AMOUNT);
    let escrow: Escrow = scenario.take_shared();
    assert!(escrow::is_locked(&escrow));
    test_scenario::return_shared(escrow);

    // 3. Reject — transitions to rejected/reclaimed.
    let mut claim_obj: Claim = scenario.take_shared();
    let mut escrow_obj: Escrow = scenario.take_shared();
    settlement::reject_claim(&cap, &mut claim_obj, &mut escrow_obj, REASON_FRAUD, scenario.ctx());

    // 4. Verify final states.
    assert!(claim::is_rejected(&claim_obj));
    assert!(!claim::is_pending(&claim_obj));
    assert!(!claim::is_settled(&claim_obj));

    assert!(escrow::is_reclaimed(&escrow_obj));
    assert!(!escrow::is_locked(&escrow_obj));
    assert!(!escrow::is_released(&escrow_obj));

    transfer::public_transfer(cap, ALICE);
    scenario.end();
}
