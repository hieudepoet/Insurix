/// Shared utilities and re-exports for all Insurix attestation schemas.
/// Each schema module (identity, external_data, fraud) imports common types
/// and helpers from here to stay consistent with the attestations core API.
module insurix_schemas::lib;

// Re-export core attestations types so schema modules can `use insurix_schemas::lib::*`
// alongside their own attestations imports when convenient.
