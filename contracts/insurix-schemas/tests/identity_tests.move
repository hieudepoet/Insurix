#[test_only]
module insurix_schemas::identity_tests;

use std::unit_test::assert_eq;
use sui::test_scenario::{Self, Scenario};
use sui::transfer::Receiving;
use attestations::attestations::{Self, Registry, Box, Attestation};
use insurix_schemas::identity::{Self, IdentityVerified};

const ALICE: address = @0xA11CE;

fun subject_for(addr: address): ID { addr.to_id() }
fun verification_level(): u8 { 2 }
fun verified_at_ms(): u64 { 1_700_000_000_000 }

/// Publish the registry and create `subject`'s active box. Returns the scenario
/// at a fresh tx, plus the registry's id.
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

/// The ids of identity attestations owned by `owner`, a box address.
fun identity_attestation_ids(owner: ID): vector<ID> {
    test_scenario::receivable_object_ids_for_owner_id<Attestation<IdentityVerified>>(owner)
}

/// Verifies the cross-package attest flow: `identity::attest_identity_verified`
/// produces an accessible attestation, and `attester_of<IdentityVerified>`
/// resolves to insurix_schemas's package address — distinct from attestations's.
#[test]
fun attest_identity_verified_cross_package() {
    let subject = subject_for(@0xDEAD);
    let (mut scenario, registry) = setup_with_box(subject);
    let active = box_id(registry, subject, false);

    let cap = identity::new_verifier_cap_for_testing(scenario.ctx());
    identity::attest_identity_verified(
        &cap, registry, subject, verification_level(), verified_at_ms(), scenario.ctx(),
    );
    transfer::public_transfer(cap, ALICE);

    scenario.next_tx(ALICE);
    let ids = identity_attestation_ids(active);
    assert_eq!(ids.length(), 1);
    scenario.with_shared_by_id!<Box>(active, |box, _| {
        let rcv: Receiving<Attestation<IdentityVerified>> =
            test_scenario::receiving_ticket_by_id(ids[0]);
        let a = box.borrow_for_testing(rcv);
        assert_eq!(a.subject(), subject);
        box.put_back_for_testing(a);
    });

    // attester_of<IdentityVerified> must resolve to insurix_schemas's package
    // address, not attestations's.
    assert!(attestations::attester_of<IdentityVerified>() != attestations::attester_of<Registry>());

    scenario.end();
}

/// The verifier-cap policy: a holder of `IdentityVerifierCap` issues then
/// revokes an identity attestation, moving it from the active box onto the
/// revoked address.
#[test]
fun revoke_identity_verified_with_cap() {
    let subject = subject_for(@0xDEAD);
    let (mut scenario, registry) = setup_with_box(subject);
    let active = box_id(registry, subject, false);
    let revoked = box_id(registry, subject, true);

    let cap = identity::new_verifier_cap_for_testing(scenario.ctx());
    identity::attest_identity_verified(
        &cap, registry, subject, verification_level(), verified_at_ms(), scenario.ctx(),
    );

    scenario.next_tx(ALICE);
    let id = identity_attestation_ids(active)[0];
    scenario.with_shared_by_id!<Box>(active, |box, _| {
        let rcv: Receiving<Attestation<IdentityVerified>> =
            test_scenario::receiving_ticket_by_id(id);
        identity::revoke_identity_verified(&cap, box, rcv);
    });
    transfer::public_transfer(cap, ALICE);

    // The attestation left the active box for the revoked address.
    scenario.next_tx(ALICE);
    assert!(identity_attestation_ids(active).is_empty());
    assert_eq!(identity_attestation_ids(revoked).length(), 1);
    assert_eq!(identity_attestation_ids(revoked)[0], id);

    scenario.end();
}

/// Multiple identity attestations can be issued for the same subject.
#[test]
fun reissuance_succeeds() {
    let subject = subject_for(@0xDEAD);
    let (mut scenario, registry) = setup_with_box(subject);
    let active = box_id(registry, subject, false);

    let cap = identity::new_verifier_cap_for_testing(scenario.ctx());
    identity::attest_identity_verified(&cap, registry, subject, 0, 100, scenario.ctx());
    identity::attest_identity_verified(&cap, registry, subject, 1, 200, scenario.ctx());
    transfer::public_transfer(cap, ALICE);

    scenario.next_tx(ALICE);
    let ids = identity_attestation_ids(active);
    assert_eq!(ids.length(), 2);
    assert!(ids[0] != ids[1]);
    scenario.end();
}
