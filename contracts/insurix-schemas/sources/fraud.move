/// Fraud-check attestation schema for Insurix.
///
/// Attests that a claim or policy was evaluated by a fraud-detection engine and
/// passed the configured check. The `confidence_score` (0–100) records the
/// engine's certainty, enabling downstream consumers to threshold on it.
module insurix_schemas::fraud;

use std::internal;
use std::string::String;
use sui::display_registry::DisplayRegistry;
use sui::transfer::Receiving;
use attestations::attestations::{Registry, Box, Attestation, attest};

// === Schema data ===

/// Attestation payload stored inside `Attestation<FraudCheckPassed>`.
public struct FraudCheckPassed has store, drop {
    /// Type of fraud check performed, e.g. "rule_based", "ml_model".
    check_type: String,
    /// Engine confidence score, 0–100.
    confidence_score: u8,
    /// Timestamp (ms since epoch) when the check was performed.
    checked_at_ms: u64,
}

// === Admin capability ===

/// Single-party authority over this schema's attestations: whoever holds this
/// cap can both issue and revoke any `Attestation<FraudCheckPassed>`. Created
/// once at publish and transferred to the publisher.
public struct FraudCheckerCap has key, store {
    id: UID,
}

// === Events ===

/// Emitted when a fraud-check attestation is issued.
public struct FraudCheckAttested has copy, drop {
    attestation_id: ID,
    subject: ID,
}

// === Setup ===

/// Mint the `FraudCheckerCap` at publish and hand it to the publisher.
fun init(ctx: &mut TxContext) {
    transfer::transfer(FraudCheckerCap { id: object::new(ctx) }, ctx.sender());
}

// === Entry functions ===

/// One-shot setup: register the append-only `Display<Attestation<FraudCheckPassed>>`
/// with the standard presentation set.
entry fun register_fraud_display(
    registry: &Registry,
    display_registry: &mut DisplayRegistry,
    _admin_cap: &FraudCheckerCap,
    ctx: &mut TxContext,
) {
    registry.register_display(
        display_registry,
        internal::permit<FraudCheckPassed>(),
        vector[
            b"name".to_string(),
            b"description".to_string(),
            b"image_url".to_string(),
        ],
        vector[
            b"Fraud check attestation".to_string(),
            b"Type: {data.check_type}, confidence: {data.confidence_score}/100".to_string(),
            b"https://insurix.example.com/fraud-badge.svg".to_string(),
        ],
        ctx,
    );
}

/// Issue an `Attestation<FraudCheckPassed>` about `subject`. Gated by the
/// `FraudCheckerCap`.
public fun attest_fraud_check_passed(
    _admin_cap: &FraudCheckerCap,
    registry: ID,
    subject: ID,
    check_type: String,
    confidence_score: u8,
    checked_at_ms: u64,
    ctx: &mut TxContext,
) {
    let attestation_id = attest(
        registry,
        internal::permit<FraudCheckPassed>(),
        subject,
        FraudCheckPassed {
            check_type,
            confidence_score,
            checked_at_ms,
        },
        ctx,
    );
    sui::event::emit(FraudCheckAttested {
        attestation_id,
        subject,
    });
}

/// Revoke the `Attestation<FraudCheckPassed>` indicated by `rcv`, which `box`
/// — the subject's active box — must own. Gated by the `FraudCheckerCap`.
public fun revoke_fraud_check_passed(
    _admin_cap: &FraudCheckerCap,
    box: &mut Box,
    rcv: Receiving<Attestation<FraudCheckPassed>>,
) {
    box.revoke(internal::permit<FraudCheckPassed>(), rcv);
}

// === Test helpers ===

#[test_only]
public fun new_fraud_checker_cap_for_testing(ctx: &mut TxContext): FraudCheckerCap {
    FraudCheckerCap { id: object::new(ctx) }
}
