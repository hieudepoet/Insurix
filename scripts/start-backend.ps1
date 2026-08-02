#requires -Version 5.1
<#
.SYNOPSIS
  Starts the Insurix backend API server.
.DESCRIPTION
  1. Checks if .env exists (copies from .env.example if missing)
  2. Installs dependencies via pnpm
  3. Starts the backend in development mode
  4. Shows the API URL
#>

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "=== Insurix Backend Startup ===" -ForegroundColor Cyan

# ── Step 1: Check .env file ──────────────────────────────────────────
Write-Host "`n[1/3] Checking environment configuration..." -ForegroundColor Yellow

$envFile = Join-Path $ProjectRoot ".env"
$envExample = Join-Path $ProjectRoot ".env.example"

if (-not (Test-Path $envFile)) {
    if (Test-Path $envExample) {
        Write-Host "  .env not found — copying from .env.example..." -ForegroundColor Yellow
        Copy-Item -Path $envExample -Destination $envFile
        Write-Host "  Created .env from .env.example" -ForegroundColor Green
        Write-Host "  NOTE: Edit .env to add your contract IDs and API keys." -ForegroundColor Yellow
    } else {
        Write-Host "  ERROR: Neither .env nor .env.example found." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  .env file found." -ForegroundColor Green
}

# ── Step 2: Install dependencies ─────────────────────────────────────
Write-Host "`n[2/3] Installing dependencies..." -ForegroundColor Yellow

try {
    Set-Location $ProjectRoot
    pnpm install --filter backend 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "pnpm install failed" }
    Write-Host "  Dependencies installed." -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Failed to install dependencies." -ForegroundColor Red
    Write-Host "  $_" -ForegroundColor DarkGray
    exit 1
}

# ── Step 3: Start backend ────────────────────────────────────────────
Write-Host "`n[3/3] Starting backend server..." -ForegroundColor Yellow

# Read port from .env
$backendPort = "3001"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
    foreach ($line in $envContent) {
        if ($line -match "^BACKEND_PORT=(.+)$") {
            $backendPort = $Matches[1].Trim()
            break
        }
    }
}

Write-Host "  API URL: http://localhost:$backendPort" -ForegroundColor Green
Write-Host "  Health:  http://localhost:$backendPort/api/health" -ForegroundColor Green
Write-Host "  Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

Set-Location $ProjectRoot
pnpm --filter backend dev
