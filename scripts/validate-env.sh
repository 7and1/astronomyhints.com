#!/usr/bin/env bash
#
# Environment Validation Script for Orbit Command
# Validates that all required environment variables are set
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ENVIRONMENT="${1:-development}"
ERRORS=0
WARNINGS=0

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    ((ERRORS++))
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    ((WARNINGS++))
}

log_ok() {
    echo -e "${GREEN}[OK]${NC} $1"
}

echo "=============================================="
echo "  Environment Validation"
echo "  Environment: $ENVIRONMENT"
echo "=============================================="
echo ""

# Load environment file if exists
ENV_FILE="${PROJECT_ROOT}/.env.local"
if [[ -f "$ENV_FILE" ]]; then
    echo "Loading $ENV_FILE..."
    set -a
    source "$ENV_FILE"
    set +a
fi

# -----------------------------------------------------------------------------
# Required Variables
# -----------------------------------------------------------------------------

echo ""
echo "Checking required variables..."
echo ""

# NEXT_PUBLIC_SITE_URL
if [[ -n "${NEXT_PUBLIC_SITE_URL:-}" ]]; then
    if [[ "$NEXT_PUBLIC_SITE_URL" =~ ^https?:// ]]; then
        log_ok "NEXT_PUBLIC_SITE_URL: $NEXT_PUBLIC_SITE_URL"
    else
        log_error "NEXT_PUBLIC_SITE_URL must start with http:// or https://"
    fi
else
    if [[ "$ENVIRONMENT" == "production" ]]; then
        log_error "NEXT_PUBLIC_SITE_URL is required for production"
    else
        log_warn "NEXT_PUBLIC_SITE_URL not set (optional for development)"
    fi
fi

# -----------------------------------------------------------------------------
# Optional Variables (with recommendations)
# -----------------------------------------------------------------------------

echo ""
echo "Checking optional variables..."
echo ""

# Analytics
if [[ -n "${NEXT_PUBLIC_GA_ID:-}" ]]; then
    if [[ "$NEXT_PUBLIC_GA_ID" =~ ^G-[A-Z0-9]+$ ]]; then
        log_ok "NEXT_PUBLIC_GA_ID: configured"
    else
        log_warn "NEXT_PUBLIC_GA_ID format may be invalid (expected G-XXXXXXXXXX)"
    fi
else
    if [[ "$ENVIRONMENT" == "production" ]]; then
        log_warn "NEXT_PUBLIC_GA_ID not set (recommended for production analytics)"
    fi
fi

# Sentry
if [[ -n "${NEXT_PUBLIC_SENTRY_DSN:-}" ]]; then
    if [[ "$NEXT_PUBLIC_SENTRY_DSN" =~ ^https://.*@.*\.ingest\.sentry\.io/ ]]; then
        log_ok "NEXT_PUBLIC_SENTRY_DSN: configured"
    else
        log_warn "NEXT_PUBLIC_SENTRY_DSN format may be invalid"
    fi
else
    if [[ "$ENVIRONMENT" == "production" ]]; then
        log_warn "NEXT_PUBLIC_SENTRY_DSN not set (recommended for error tracking)"
    fi
fi

# -----------------------------------------------------------------------------
# Deployment Variables (CI/CD)
# -----------------------------------------------------------------------------

if [[ "$ENVIRONMENT" == "production" || "$ENVIRONMENT" == "staging" ]]; then
    echo ""
    echo "Checking deployment variables..."
    echo ""

    # Vercel
    if [[ "${DEPLOY_PLATFORM:-vercel}" == "vercel" ]]; then
        if [[ -z "${VERCEL_TOKEN:-}" ]]; then
            log_warn "VERCEL_TOKEN not set (required for automated deployments)"
        else
            log_ok "VERCEL_TOKEN: configured"
        fi
    fi

    # Netlify
    if [[ "${DEPLOY_PLATFORM:-}" == "netlify" ]]; then
        if [[ -z "${NETLIFY_AUTH_TOKEN:-}" ]]; then
            log_warn "NETLIFY_AUTH_TOKEN not set (required for automated deployments)"
        else
            log_ok "NETLIFY_AUTH_TOKEN: configured"
        fi
    fi
fi

# -----------------------------------------------------------------------------
# Security Checks
# -----------------------------------------------------------------------------

echo ""
echo "Running security checks..."
echo ""

# Check for sensitive files
SENSITIVE_FILES=(
    ".env"
    ".env.local"
    ".env.production"
    ".env.staging"
)

for file in "${SENSITIVE_FILES[@]}"; do
    filepath="${PROJECT_ROOT}/${file}"
    if [[ -f "$filepath" ]]; then
        # Check if in .gitignore
        if grep -q "^${file}$" "${PROJECT_ROOT}/.gitignore" 2>/dev/null; then
            log_ok "$file is in .gitignore"
        else
            log_warn "$file exists but may not be in .gitignore"
        fi
    fi
done

# Check for hardcoded secrets in code
echo ""
echo "Scanning for potential hardcoded secrets..."

PATTERNS=(
    "api[_-]?key.*=.*['\"][a-zA-Z0-9]{20,}['\"]"
    "secret.*=.*['\"][a-zA-Z0-9]{20,}['\"]"
    "password.*=.*['\"][^'\"]+['\"]"
)

for pattern in "${PATTERNS[@]}"; do
    if grep -rE "$pattern" "${PROJECT_ROOT}/app" "${PROJECT_ROOT}/components" "${PROJECT_ROOT}/lib" 2>/dev/null | grep -v node_modules | head -5; then
        log_warn "Potential hardcoded secret found (review above matches)"
    fi
done

log_ok "Secret scan complete"

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------

echo ""
echo "=============================================="
echo "  Validation Summary"
echo "=============================================="
echo ""

if [[ $ERRORS -gt 0 ]]; then
    echo -e "${RED}Errors: $ERRORS${NC}"
fi

if [[ $WARNINGS -gt 0 ]]; then
    echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
fi

if [[ $ERRORS -eq 0 && $WARNINGS -eq 0 ]]; then
    echo -e "${GREEN}All checks passed!${NC}"
fi

echo ""

if [[ $ERRORS -gt 0 ]]; then
    exit 1
fi

exit 0
