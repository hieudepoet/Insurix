#[test_only]
module insurix_schemas::fraud_tests;

use std::string::String;
use std::unit_test::assert_eq;
use sui::test_scenario::{Self, Scenario};
use sui::transfer::Receiving;
use attestations::attestations::{Self, Registry, Box, Attestation};
use insurix_schemas::fraud::{Self, FraudCheckPassed};

const ALICE: address = @0xA11CE;

fun subject_for(addr: address): ID { addr.to_id() }
fun check_type(): String { b"rule_based".to_string() }
fun confidence_score(): u8 { 85 }
fun checked_at_ms(): u64 { 1_700_000_000_000 }

/// Publish the registry and create `subject`'s active box.
fun setup_with_box(subject: ID): (Scenario, ID) {
    let mut scenario = test_scenario::begin(ALICE);
    attestations::init_for_testing(scenario.ctx());

    scenario.next_tx(ALICE);
    let mut registry: Registry = scenario.take_shared();
    let registry_id = object::id(&registry);
    registry.create_box(subject);
    test_scenario::return_shared(registry);

    scenario.next_tx(ALICE);
    (scenario, registry_id)
}

/// The id form of `subject`'s active or revoked box address.
fun box_id(registry: ID, subject: ID, revoked: bool): ID {
    object::id_from_address(attestations::box_address(registry, subject, revoked))
}

/// The ids of fraud-check attestations owned by `owner`, a box address.
fun fraud_attestation_ids(owner: ID): vector<ID> {
    test_scenario::receivable_object_ids_for_owner_id<Attestation<FraudCheckPassed>>(owner)
}

/// Verifies the cross-package attest flow: `fraud::attest_fraud_check_passed`
/// produces an accessible attestation, and `attester_of<FraudCheckPassed>`
/// resolves to insurix_schemas's package address — distinct from attestations's.
#[test]
fun attest_fraud_check_cross_package() {
    let subject = subject_for(@0xDEAD);
    let (mut scenario, registry) = setup_with_box(subject);
    let active = box_id(registry, subject, false);

    let cap = fraud::new_fraud_checker_cap_for_testing(scenario.ctx());
    fraud::attest_fraud_check_passed(
        &cap, registry, subject, check_type(), confidence_score(), checked_at_ms(), scenario.ctx(),
    );
    transfer::public_transfer(cap, ALICE);

    scenario.next_tx(ALICE);
    let ids = fraud_attestation_ids(active);
    assert_eq!(ids.length(), 1);
    scenario.with_shared_by_id!<Box>(active, |box, _| {
        let rcv: Receiving<Attestation<FraudCheckPassed>> =
            test_scenario::receiving_ticket_by_id(ids[0]);
        let a = box.borrow_for_testing(rcv);
        assert_eq!(a.subject(), subject);
        box.put_back_for_testing(a);
    });

    assert!(
        attestations::attester_of<FraudCheckPassed>()
        != attestations::attester_of<Registry>()
    );

    scenario.end();
}

/// The cap-holder policy: issue then revoke, moving the attestation from the
/// active box onto the revoked address.
#[test]
fun revoke_fraud_check_with_cap() {
    let subject = subject_for(@0xDEAD);
    let (mut scenario, registry) = setup_with_box(subject);
    let active = box_id(registry, subject, false);
    let revoked = box_id(registry, subject, true);

    let cap = fraud::new_fraud_checker_cap_for_testing(scenario.ctx());
    fraud::attest_fraud_check_passed(
        &cap, registry, subject, check_type(), confidence_score(), checked_at_ms(), scenario.ctx(),
    );

    scenario.next_tx(ALICE);
    let id = fraud_attestation_ids(active)[0];
    scenario.with_shared_by_id!<Box>(active, |box, _| {
        let rcv: Receiving<Attestation<FraudCheckPassed>> =
            test_scenario::receiving_ticket_by_id(id);
        fraud::revoke_fraud_check_passed(&cap, box, rcv);
    });
    transfer::public_transfer(cap, ALICE);

    scenario.next_tx(ALICE);
    assert!(fraud_attestation_ids(active).is_empty());
    assert_eq!(fraud_attestation_ids(revoked).length(), 1);
    assert_eq!(fraud_attestation_ids(revoked)[0], id);

    scenario.end();
}

/// Multiple fraud checks with different types can be issued on the same subject.
#[test]
fun multiple_checks_same_subject() {
    let subject = subject_for(@0xDEAD);
    let (mut scenario, registry) = setup_with_box(subject);
    let active = box_id(registry, subject, false);

    let cap = fraud::new_fraud_checker_cap_for_testing(scenario.ctx());
    fraud::attest_fraud_check_passed(
        &cap, registry, subject, b"rule_based".to_string(), 90, 100, scenario.ctx(),
    );
    fraud::attest_fraud_check_passed(
        &cap, registry, subject, b"ml_model".to_string(), 75, 200, scenario.ctx(),
    );
    transfer::public_transfer(cap, ALICE);

    scenario.next_tx(ALICE);
    let ids = fraud_attestation_ids(active);
    assert_eq!(ids.length(), 2);
    assert!(ids[0] != ids[1]);
    scenario.end();
}
