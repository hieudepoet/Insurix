/// Identity verification attestation schema for Insurix.
///
/// Follows the auditor example pattern exactly: an `IdentityVerified` payload
/// gated by `Permit<IdentityVerified>`, with an `IdentityVerifierCap` admin
/// capability controlling attest and revoke authority.
module insurix_schemas::identity;

use std::internal;
use std::string::String;
use sui::display_registry::DisplayRegistry;
use sui::transfer::Receiving;
use attestations::attestations::{Registry, Box, Attestation, attest};

// === Schema data ===

/// Attestation payload stored inside `Attestation<IdentityVerified>`.
/// `verification_level` encoding: 0 = basic, 1 = intermediate, 2 = full.
public struct IdentityVerified has store, drop {
    /// Address of the verifier that issued this attestation.
    verified_by: address,
    /// Timestamp (ms since epoch) when verification was performed.
    verified_at_ms: u64,
    /// Verification depth: 0 = basic, 1 = intermediate, 2 = full.
    verification_level: u8,
}

// === Admin capability ===

/// Single-party authority over this schema's attestations: whoever holds this
/// cap can both issue and revoke any `Attestation<IdentityVerified>`. Created
/// once at publish and transferred to the publisher.
public struct IdentityVerifierCap has key, store {
    id: UID,
}

// === Events ===

/// Emitted when an identity attestation is issued.
public struct IdentityAttested has copy, drop {
    attestation_id: ID,
    subject: ID,
    verified_by: address,
}

// === Setup ===

/// Mint the `IdentityVerifierCap` at publish and hand it to the publisher.
fun init(ctx: &mut TxContext) {
    transfer::transfer(IdentityVerifierCap { id: object::new(ctx) }, ctx.sender());
}

// === Entry functions ===

/// One-shot setup: register the append-only `Display<Attestation<IdentityVerified>>`
/// with the standard presentation set. Should be called once shortly after
/// publish; aborts on second call (V2 enforcement via `display_registry`).
entry fun register_identity_display(
    registry: &Registry,
    display_registry: &mut DisplayRegistry,
    _admin_cap: &IdentityVerifierCap,
    ctx: &mut TxContext,
) {
    registry.register_display(
        display_registry,
        internal::permit<IdentityVerified>(),
        vector[
            b"name".to_string(),
            b"description".to_string(),
            b"image_url".to_string(),
        ],
        vector[
            b"Identity verification".to_string(),
            b"Verified by {data.verified_by}, level {data.verification_level}".to_string(),
            b"https://insurix.example.com/identity-badge.svg".to_string(),
        ],
        ctx,
    );
}

/// Issue an `Attestation<IdentityVerified>` about `subject`. Gated by the
/// `IdentityVerifierCap`, the single authority over this schema's attestations.
public fun attest_identity_verified(
    _admin_cap: &IdentityVerifierCap,
    registry: ID,
    subject: ID,
    verification_level: u8,
    verified_at_ms: u64,
    ctx: &mut TxContext,
) {
    let attestation_id = attest(
        registry,
        internal::permit<IdentityVerified>(),
        subject,
        IdentityVerified {
            verified_by: ctx.sender(),
            verified_at_ms,
            verification_level,
        },
        ctx,
    );
    sui::event::emit(IdentityAttested {
        attestation_id,
        subject,
        verified_by: ctx.sender(),
    });
}

/// Revoke the `Attestation<IdentityVerified>` indicated by `rcv`, which `box`
/// — the subject's active box — must own. Gated by the `IdentityVerifierCap`.
public fun revoke_identity_verified(
    _admin_cap: &IdentityVerifierCap,
    box: &mut Box,
    rcv: Receiving<Attestation<IdentityVerified>>,
) {
    box.revoke(internal::permit<IdentityVerified>(), rcv);
}

// === Test helpers ===

#[test_only]
public fun new_verifier_cap_for_testing(ctx: &mut TxContext): IdentityVerifierCap {
    IdentityVerifierCap { id: object::new(ctx) }
}
