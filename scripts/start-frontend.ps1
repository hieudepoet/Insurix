#requires -Version 5.1
<#
.SYNOPSIS
  Starts the Insurix frontend dev server.
.DESCRIPTION
  1. Installs dependencies via pnpm
  2. Starts the Next.js frontend in development mode
  3. Shows the app URL
#>

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "=== Insurix Frontend Startup ===" -ForegroundColor Cyan

# ── Step 1: Install dependencies ─────────────────────────────────────
Write-Host "`n[1/2] Installing dependencies..." -ForegroundColor Yellow

try {
    Set-Location $ProjectRoot
    pnpm install --filter frontend 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "pnpm install failed" }
    Write-Host "  Dependencies installed." -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Failed to install dependencies." -ForegroundColor Red
    Write-Host "  $_" -ForegroundColor DarkGray
    exit 1
}

# ── Step 2: Start frontend ───────────────────────────────────────────
Write-Host "`n[2/2] Starting frontend dev server..." -ForegroundColor Yellow
Write-Host "  App URL: http://localhost:3000" -ForegroundColor Green
Write-Host "  Admin:   http://localhost:3000/admin" -ForegroundColor Green
Write-Host "  Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

Set-Location $ProjectRoot
pnpm --filter frontend dev
