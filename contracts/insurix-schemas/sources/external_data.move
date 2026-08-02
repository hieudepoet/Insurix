/// External data verification attestation schema for Insurix.
///
/// Attests that an off-chain data source (e.g. weather API, aviation API) was
/// queried and its response verified against a policy threshold. The data hash
/// binds the attestation to the exact API response payload.
module insurix_schemas::external_data;

use std::internal;
use std::string::String;
use sui::display_registry::DisplayRegistry;
use sui::transfer::Receiving;
use attestations::attestations::{Registry, Box, Attestation, attest};

// === Schema data ===

/// Attestation payload stored inside `Attestation<ExternalDataVerified>`.
public struct ExternalDataVerified has store, drop {
    /// Identifier for the data source, e.g. "openweathermap" | "aviationstack".
    data_source: String,
    /// SHA-256 hash of the API response data this attestation covers.
    data_hash: vector<u8>,
    /// Whether the data met the configured policy threshold.
    threshold_met: bool,
    /// Timestamp (ms since epoch) when verification was performed.
    verified_at_ms: u64,
}

// === Admin capability ===

/// Single-party authority over this schema's attestations: whoever holds this
/// cap can both issue and revoke any `Attestation<ExternalDataVerified>`.
/// Created once at publish and transferred to the publisher.
public struct ExternalDataVerifierCap has key, store {
    id: UID,
}

// === Events ===

/// Emitted when an external-data attestation is issued.
public struct ExternalDataAttested has copy, drop {
    attestation_id: ID,
    subject: ID,
}

// === Setup ===

/// Mint the `ExternalDataVerifierCap` at publish and hand it to the publisher.
fun init(ctx: &mut TxContext) {
    transfer::transfer(ExternalDataVerifierCap { id: object::new(ctx) }, ctx.sender());
}

// === Entry functions ===

/// One-shot setup: register the append-only `Display<Attestation<ExternalDataVerified>>`
/// with the standard presentation set.
entry fun register_external_data_display(
    registry: &Registry,
    display_registry: &mut DisplayRegistry,
    _admin_cap: &ExternalDataVerifierCap,
    ctx: &mut TxContext,
) {
    registry.register_display(
        display_registry,
        internal::permit<ExternalDataVerified>(),
        vector[
            b"name".to_string(),
            b"description".to_string(),
            b"image_url".to_string(),
        ],
        vector[
            b"External data verification".to_string(),
            b"Source: {data.data_source}, threshold met: {data.threshold_met}".to_string(),
            b"https://insurix.example.com/data-badge.svg".to_string(),
        ],
        ctx,
    );
}

/// Issue an `Attestation<ExternalDataVerified>` about `subject`. Gated by the
/// `ExternalDataVerifierCap`.
public fun attest_external_data_verified(
    _admin_cap: &ExternalDataVerifierCap,
    registry: ID,
    subject: ID,
    data_source: String,
    data_hash: vector<u8>,
    threshold_met: bool,
    verified_at_ms: u64,
    ctx: &mut TxContext,
) {
    let attestation_id = attest(
        registry,
        internal::permit<ExternalDataVerified>(),
        subject,
        ExternalDataVerified {
            data_source,
            data_hash,
            threshold_met,
            verified_at_ms,
        },
        ctx,
    );
    sui::event::emit(ExternalDataAttested {
        attestation_id,
        subject,
    });
}

/// Revoke the `Attestation<ExternalDataVerified>` indicated by `rcv`, which
/// `box` — the subject's active box — must own. Gated by the
/// `ExternalDataVerifierCap`.
public fun revoke_external_data_verified(
    _admin_cap: &ExternalDataVerifierCap,
    box: &mut Box,
    rcv: Receiving<Attestation<ExternalDataVerified>>,
) {
    box.revoke(internal::permit<ExternalDataVerified>(), rcv);
}

// === Test helpers ===

#[test_only]
public fun new_data_verifier_cap_for_testing(ctx: &mut TxContext): ExternalDataVerifierCap {
    ExternalDataVerifierCap { id: object::new(ctx) }
}
