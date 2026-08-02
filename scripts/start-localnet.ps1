#requires -Version 5.1
<#
.SYNOPSIS
  Starts a local Sui network and deploys Insurix Move packages.
.DESCRIPTION
  1. Checks if Sui CLI is installed
  2. Starts a local Sui network (sui start --force)
  3. Waits for the network to be ready
  4. Deploys insurix-schemas and insurix-settlement contracts
  5. Outputs published package IDs for .env configuration
#>

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "=== Insurix Localnet Setup ===" -ForegroundColor Cyan

# ── Step 1: Check Sui CLI ────────────────────────────────────────────
Write-Host "`n[1/4] Checking Sui CLI..." -ForegroundColor Yellow
try {
    $suiVersion = sui --version 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Sui CLI not found" }
    Write-Host "  Sui CLI found: $suiVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Sui CLI is not installed." -ForegroundColor Red
    Write-Host "  Install it from: https://docs.sui.io/guides/developer/getting-started/sui-install" -ForegroundColor Red
    exit 1
}

# ── Step 2: Start local Sui network ──────────────────────────────────
Write-Host "`n[2/4] Starting local Sui network..." -ForegroundColor Yellow
Write-Host "  (This may take a minute...)" -ForegroundColor DarkGray

$suiProcess = Start-Process -FilePath "sui" -ArgumentList "start", "--force" `
    -WorkingDirectory $ProjectRoot `
    -PassThru `
    -NoNewWindow `
    -RedirectStandardOutput "$ProjectRoot\.sui-localnet-stdout.log" `
    -RedirectStandardError "$ProjectRoot\.sui-localnet-stderr.log"

Write-Host "  Sui localnet PID: $($suiProcess.Id)" -ForegroundColor Green

# ── Step 3: Wait for network to be ready ─────────────────────────────
Write-Host "`n[3/4] Waiting for localnet to be ready..." -ForegroundColor Yellow

$maxAttempts = 30
$attempt = 0
$ready = $false

while (-not $ready -and $attempt -lt $maxAttempts) {
    $attempt++
    Write-Host "  Attempt $attempt/$maxAttempts..." -ForegroundColor DarkGray
    Start-Sleep -Seconds 2

    try {
        $null = sui client active-env 2>&1
        if ($LASTEXITCODE -eq 0) {
            $ready = $true
        }
    } catch {
        # Not ready yet
    }
}

if (-not $ready) {
    Write-Host "  ERROR: Localnet did not become ready within timeout." -ForegroundColor Red
    Write-Host "  Check logs at: $ProjectRoot\.sui-localnet-stderr.log" -ForegroundColor Red
    Stop-Process -Id $suiProcess.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "  Localnet is ready!" -ForegroundColor Green

# ── Step 4: Deploy Move packages ─────────────────────────────────────
Write-Host "`n[4/4] Deploying Move packages..." -ForegroundColor Yellow

# Deploy insurix-schemas
Write-Host "  Publishing insurix-schemas..." -ForegroundColor Yellow
$schemasOutput = sui client publish --path "$ProjectRoot\contracts\insurix-schemas" --gas-budget 100000000 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  WARNING: Failed to publish insurix-schemas." -ForegroundColor Red
    Write-Host "  Output: $schemasOutput" -ForegroundColor DarkGray
    $schemasPkgId = ""
} else {
    # Parse package ID from output
    $schemasPkgId = ($schemasOutput | Select-String -Pattern "PackageID:\s*(0x[a-fA-F0-9]+)" | Select-Object -First 1).Matches.Groups[1].Value
    if (-not $schemasPkgId) {
        $schemasPkgId = ($schemasOutput | Select-String -Pattern "(0x[a-fA-F0-9]{64})" | Select-Object -First 1).Matches.Groups[1].Value
    }
    Write-Host "  insurix-schemas published: $schemasPkgId" -ForegroundColor Green
}

# Deploy insurix-settlement
Write-Host "  Publishing insurix-settlement..." -ForegroundColor Yellow
$settlementOutput = sui client publish --path "$ProjectRoot\contracts\insurix-settlement" --gas-budget 100000000 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  WARNING: Failed to publish insurix-settlement." -ForegroundColor Red
    Write-Host "  Output: $settlementOutput" -ForegroundColor DarkGray
    $settlementPkgId = ""
} else {
    $settlementPkgId = ($settlementOutput | Select-String -Pattern "PackageID:\s*(0x[a-fA-F0-9]+)" | Select-Object -First 1).Matches.Groups[1].Value
    if (-not $settlementPkgId) {
        $settlementPkgId = ($settlementOutput | Select-String -Pattern "(0x[a-fA-F0-9]{64})" | Select-Object -First 1).Matches.Groups[1].Value
    }
    Write-Host "  insurix-settlement published: $settlementPkgId" -ForegroundColor Green
}

# ── Output results ───────────────────────────────────────────────────
Write-Host "`n=== Deployment Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Add these to your .env file:" -ForegroundColor Yellow
Write-Host "  SCHEMAS_PKG_ID=$schemasPkgId"
Write-Host "  SETTLEMENT_PKG_ID=$settlementPkgId"
Write-Host ""
Write-Host "The localnet is running (PID: $($suiProcess.Id))" -ForegroundColor Green
Write-Host "To stop it: Stop-Process -Id $($suiProcess.Id) -Force" -ForegroundColor DarkGray
