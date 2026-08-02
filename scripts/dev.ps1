#requires -Version 5.1
<#
.SYNOPSIS
  Master dev script — starts localnet, backend, and frontend together.
.DESCRIPTION
  1. Starts Sui localnet in the background
  2. Starts backend API in the background
  3. Starts frontend dev server in the foreground
  4. Provides instructions for stopping all services
#>

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Insurix Development Environment" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Start localnet (background) ──────────────────────────────
Write-Host "[1/3] Starting Sui localnet (background)..." -ForegroundColor Yellow

$localnetScript = Join-Path $PSScriptRoot "start-localnet.ps1"
$localnetJob = Start-Job -ScriptBlock {
    param($scriptPath)
    & $scriptPath
} -ArgumentList $localnetScript

Write-Host "  Localnet starting in background (Job ID: $($localnetJob.Id))..." -ForegroundColor Green

# Give localnet a head start
Write-Host "  Waiting 5 seconds for localnet initialization..." -ForegroundColor DarkGray
Start-Sleep -Seconds 5

# ── Step 2: Start backend (background) ───────────────────────────────
Write-Host "[2/3] Starting backend API (background)..." -ForegroundColor Yellow

$backendProcess = Start-Process -FilePath "pnpm" -ArgumentList "--filter", "backend", "dev" `
    -WorkingDirectory $ProjectRoot `
    -PassThru `
    -NoNewWindow `
    -RedirectStandardOutput "$ProjectRoot\.backend-stdout.log" `
    -RedirectStandardError "$ProjectRoot\.backend-stderr.log"

Write-Host "  Backend PID: $($backendProcess.Id)" -ForegroundColor Green
Write-Host "  API URL: http://localhost:3001" -ForegroundColor Green

# Wait for backend to start
Write-Host "  Waiting for backend to be ready..." -ForegroundColor DarkGray
$maxAttempts = 20
$attempt = 0
$backendReady = $false

while (-not $backendReady -and $attempt -lt $maxAttempts) {
    $attempt++
    Start-Sleep -Seconds 2
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 3
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
        }
    } catch {
        # Not ready yet
    }
}

if ($backendReady) {
    Write-Host "  Backend is ready!" -ForegroundColor Green
} else {
    Write-Host "  WARNING: Backend may still be starting. Check http://localhost:3001/api/health" -ForegroundColor Yellow
}

# ── Step 3: Start frontend (foreground) ──────────────────────────────
Write-Host "[3/3] Starting frontend dev server (foreground)..." -ForegroundColor Yellow
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  All services starting:" -ForegroundColor Cyan
Write-Host "    Localnet : Sui local network (background)" -ForegroundColor White
Write-Host "    Backend  : http://localhost:3001" -ForegroundColor White
Write-Host "    Frontend : http://localhost:3000" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop all services:" -ForegroundColor Yellow
Write-Host "  1. Press Ctrl+C to stop the frontend" -ForegroundColor DarkGray
Write-Host "  2. Run: Stop-Process -Id $($backendProcess.Id) -Force" -ForegroundColor DarkGray
Write-Host "  3. Run: Remove-Job -Id $($localnetJob.Id) -Force" -ForegroundColor DarkGray
Write-Host ""

# Run frontend in foreground
Set-Location $ProjectRoot
try {
    pnpm --filter frontend dev
} finally {
    # Cleanup when frontend stops
    Write-Host "`nShutting down..." -ForegroundColor Yellow

    if (-not $backendProcess.HasExited) {
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
        Write-Host "  Backend stopped." -ForegroundColor Green
    }

    Remove-Job -Id $localnetJob.Id -Force -ErrorAction SilentlyContinue
    Write-Host "  Localnet job removed." -ForegroundColor Green

    Write-Host "  All services stopped." -ForegroundColor Green
}
