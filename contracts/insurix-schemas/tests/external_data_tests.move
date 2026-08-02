#[test_only]
module insurix_schemas::external_data_tests;

use std::string::String;
use std::unit_test::assert_eq;
use sui::test_scenario::{Self, Scenario};
use sui::transfer::Receiving;
use attestations::attestations::{Self, Registry, Box, Attestation};
use insurix_schemas::external_data::{Self, ExternalDataVerified};

const ALICE: address = @0xA11CE;

fun subject_for(addr: address): ID { addr.to_id() }
fun data_source(): String { b"openweathermap".to_string() }
fun data_hash(): vector<u8> { b"\x01\x02\x03\x04" }
fun verified_at_ms(): u64 { 1_700_000_000_000 }

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

/// The ids of external-data attestations owned by `owner`, a box address.
fun data_attestation_ids(owner: ID): vector<ID> {
    test_scenario::receivable_object_ids_for_owner_id<Attestation<ExternalDataVerified>>(owner)
}

/// Verifies the cross-package attest flow: `external_data::attest_external_data_verified`
/// produces an accessible attestation, and `attester_of<ExternalDataVerified>` resolves
/// to insurix_schemas's package address — distinct from attestations's.
#[test]
fun attest_external_data_verified_cross_package() {
    let subject = subject_for(@0xDEAD);
    let (mut scenario, registry) = setup_with_box(subject);
    let active = box_id(registry, subject, false);

    let cap = external_data::new_data_verifier_cap_for_testing(scenario.ctx());
    external_data::attest_external_data_verified(
        &cap, registry, subject, data_source(), data_hash(), true, verified_at_ms(), scenario.ctx(),
    );
    transfer::public_transfer(cap, ALICE);

    scenario.next_tx(ALICE);
    let ids = data_attestation_ids(active);
    assert_eq!(ids.length(), 1);
    scenario.with_shared_by_id!<Box>(active, |box, _| {
        let rcv: Receiving<Attestation<ExternalDataVerified>> =
            test_scenario::receiving_ticket_by_id(ids[0]);
        let a = box.borrow_for_testing(rcv);
        assert_eq!(a.subject(), subject);
        box.put_back_for_testing(a);
    });

    assert!(
        attestations::attester_of<ExternalDataVerified>()
        != attestations::attester_of<Registry>()
    );

    scenario.end();
}

/// The cap-holder policy: issue then revoke, moving the attestation from the
/// active box onto the revoked address.
#[test]
fun revoke_external_data_verified_with_cap() {
    let subject = subject_for(@0xDEAD);
    let (mut scenario, registry) = setup_with_box(subject);
    let active = box_id(registry, subject, false);
    let revoked = box_id(registry, subject, true);

    let cap = external_data::new_data_verifier_cap_for_testing(scenario.ctx());
    external_data::attest_external_data_verified(
        &cap, registry, subject, data_source(), data_hash(), true, verified_at_ms(), scenario.ctx(),
    );

    scenario.next_tx(ALICE);
    let id = data_attestation_ids(active)[0];
    scenario.with_shared_by_id!<Box>(active, |box, _| {
        let rcv: Receiving<Attestation<ExternalDataVerified>> =
            test_scenario::receiving_ticket_by_id(id);
        external_data::revoke_external_data_verified(&cap, box, rcv);
    });
    transfer::public_transfer(cap, ALICE);

    scenario.next_tx(ALICE);
    assert!(data_attestation_ids(active).is_empty());
    assert_eq!(data_attestation_ids(revoked).length(), 1);
    assert_eq!(data_attestation_ids(revoked)[0], id);

    scenario.end();
}

/// Attestations for different data sources can coexist on the same subject.
#[test]
fun multiple_sources_same_subject() {
    let subject = subject_for(@0xDEAD);
    let (mut scenario, registry) = setup_with_box(subject);
    let active = box_id(registry, subject, false);

    let cap = external_data::new_data_verifier_cap_for_testing(scenario.ctx());
    external_data::attest_external_data_verified(
        &cap, registry, subject,
        b"openweathermap".to_string(), b"\x01", true, 100, scenario.ctx(),
    );
    external_data::attest_external_data_verified(
        &cap, registry, subject,
        b"aviationstack".to_string(), b"\x02", false, 200, scenario.ctx(),
    );
    transfer::public_transfer(cap, ALICE);

    scenario.next_tx(ALICE);
    let ids = data_attestation_ids(active);
    assert_eq!(ids.length(), 2);
    assert!(ids[0] != ids[1]);
    scenario.end();
}
