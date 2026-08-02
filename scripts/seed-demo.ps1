#requires -Version 5.1
<#
.SYNOPSIS
  Seeds demo data into the Insurix platform via the API.
.DESCRIPTION
  Creates a demo flight-delay claim and lists all claims to show the result.
  Requires the backend to be running on http://localhost:3001.
#>

$ErrorActionPreference = "Stop"

$BackendUrl = "http://localhost:3001"

Write-Host "=== Insurix Demo Seed ===" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Check backend health ──────────────────────────────────
Write-Host "[1/3] Checking backend health..." -ForegroundColor Yellow

try {
    $health = Invoke-RestMethod -Uri "$BackendUrl/api/health" -Method Get -TimeoutSec 5
    Write-Host "  Backend is running (network: $($health.network))" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Backend is not running at $BackendUrl" -ForegroundColor Red
    Write-Host "  Start it with: .\scripts\start-backend.ps1" -ForegroundColor Red
    exit 1
}

# ── Step 2: Create a demo claim ──────────────────────────────────────
Write-Host "`n[2/3] Creating demo flight-delay claim..." -ForegroundColor Yellow

$body = @{
    walletAddress = "0x1234"
    claimType     = "flight-delay"
    description   = "Flight VN123 delayed by 3 hours"
    amount        = 1000000000
    params        = @{
        flightNumber = "VN123"
        date         = "2026-08-01"
    }
} | ConvertTo-Json -Depth 3

try {
    $result = Invoke-RestMethod -Uri "$BackendUrl/api/claims" -Method Post -Body $body -ContentType "application/json"
    Write-Host "  Claim created!" -ForegroundColor Green
    Write-Host "  Claim ID:  $($result.claimId)" -ForegroundColor White
    Write-Host "  TX Digest: $($result.txDigest)" -ForegroundColor White
    Write-Host "  Status:    $($result.status)" -ForegroundColor White

    $claimId = $result.claimId
} catch {
    Write-Host "  ERROR: Failed to create claim." -ForegroundColor Red
    Write-Host "  $_" -ForegroundColor DarkGray
    exit 1
}

# Wait a moment for agents to process
Write-Host "`n  Waiting 3 seconds for AI agents to process attestations..." -ForegroundColor DarkGray
Start-Sleep -Seconds 3

# ── Step 3: List all claims ──────────────────────────────────────────
Write-Host "`n[3/3] Listing all claims..." -ForegroundColor Yellow

try {
    $claims = Invoke-RestMethod -Uri "$BackendUrl/api/claims" -Method Get -TimeoutSec 5

    if ($claims.Count -eq 0) {
        Write-Host "  No claims found." -ForegroundColor Yellow
    } else {
        Write-Host "  Found $($claims.Count) claim(s):" -ForegroundColor Green
        Write-Host ""

        foreach ($claim in $claims) {
            Write-Host "  ─────────────────────────────────────" -ForegroundColor DarkGray
            Write-Host "  Claim ID:   $($claim.claimId)" -ForegroundColor White
            Write-Host "  Type:       $($claim.claimType)" -ForegroundColor White
            Write-Host "  Amount:     $($claim.amount)" -ForegroundColor White
            Write-Host "  Status:     $($claim.status)" -ForegroundColor White
            Write-Host "  Created:    $(Get-Date -Date ([DateTimeOffset]::FromUnixTimeMilliseconds($claim.createdAt).DateTime) -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
        }
        Write-Host "  ─────────────────────────────────────" -ForegroundColor DarkGray
    }
} catch {
    Write-Host "  ERROR: Failed to list claims." -ForegroundColor Red
    Write-Host "  $_" -ForegroundColor DarkGray
}

# ── Bonus: Show claim details ────────────────────────────────────────
if ($claimId) {
    Write-Host "`nClaim details for $claimId :" -ForegroundColor Yellow

    try {
        $detail = Invoke-RestMethod -Uri "$BackendUrl/api/claims/$claimId" -Method Get -TimeoutSec 5
        Write-Host "  Status:     $($detail.status)" -ForegroundColor White
        Write-Host "  Attestations:" -ForegroundColor White
        Write-Host "    Identity:       $($detail.attestationProgress.identity)" -ForegroundColor White
        Write-Host "    External Data:  $($detail.attestationProgress.externalData)" -ForegroundColor White
        Write-Host "    Fraud Check:    $($detail.attestationProgress.fraudCheck)" -ForegroundColor White
    } catch {
        Write-Host "  Could not fetch claim details." -ForegroundColor Yellow
    }
}

Write-Host "`n=== Demo Seed Complete ===" -ForegroundColor Cyan
Write-Host "Open http://localhost:3000/claims to view claims in the UI." -ForegroundColor Green
