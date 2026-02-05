#!/usr/bin/env bash
#
# Production Deployment Script for Orbit Command (astronomyhints.com)
# Version: 1.0.0
#
# Usage:
#   ./scripts/deploy.sh [environment] [options]
#
# Environments:
#   production  - Deploy to production (default)
#   staging     - Deploy to staging
#   preview     - Create preview deployment
#
# Options:
#   --skip-tests     Skip test execution
#   --skip-lint      Skip linting
#   --force          Force deployment even with warnings
#   --rollback       Rollback to previous deployment
#   --dry-run        Simulate deployment without executing
#   --verbose        Enable verbose output
#
set -euo pipefail

# =============================================================================
# Configuration
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOY_LOG="${PROJECT_ROOT}/logs/deploy-$(date +%Y%m%d-%H%M%S).log"
LOCKFILE="${PROJECT_ROOT}/.deploy.lock"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="${1:-production}"
SKIP_TESTS=false
SKIP_LINT=false
FORCE_DEPLOY=false
ROLLBACK=false
DRY_RUN=false
VERBOSE=false

# Deployment targets
VERCEL_ORG_ID="${VERCEL_ORG_ID:-}"
VERCEL_PROJECT_ID="${VERCEL_PROJECT_ID:-}"
DEPLOY_PLATFORM="${DEPLOY_PLATFORM:-vercel}"

# =============================================================================
# Utility Functions
# =============================================================================

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    case "$level" in
        INFO)  echo -e "${BLUE}[INFO]${NC} ${timestamp} - ${message}" ;;
        SUCCESS) echo -e "${GREEN}[SUCCESS]${NC} ${timestamp} - ${message}" ;;
        WARN)  echo -e "${YELLOW}[WARN]${NC} ${timestamp} - ${message}" ;;
        ERROR) echo -e "${RED}[ERROR]${NC} ${timestamp} - ${message}" ;;
        DEBUG) [[ "$VERBOSE" == true ]] && echo -e "${CYAN}[DEBUG]${NC} ${timestamp} - ${message}" ;;
    esac

    # Also write to log file
    mkdir -p "$(dirname "$DEPLOY_LOG")"
    echo "[${level}] ${timestamp} - ${message}" >> "$DEPLOY_LOG"
}

die() {
    log ERROR "$1"
    cleanup
    exit 1
}

cleanup() {
    # Remove lock file
    rm -f "$LOCKFILE"
    log DEBUG "Cleanup completed"
}

trap cleanup EXIT

# =============================================================================
# Parse Arguments
# =============================================================================

parse_args() {
    shift || true  # Skip first argument (environment)

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --skip-tests)
                SKIP_TESTS=true
                ;;
            --skip-lint)
                SKIP_LINT=true
                ;;
            --force)
                FORCE_DEPLOY=true
                ;;
            --rollback)
                ROLLBACK=true
                ;;
            --dry-run)
                DRY_RUN=true
                ;;
            --verbose)
                VERBOSE=true
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                # Check if it's an environment
                if [[ "$1" =~ ^(production|staging|preview)$ ]]; then
                    ENVIRONMENT="$1"
                else
                    die "Unknown option: $1"
                fi
                ;;
        esac
        shift
    done
}

show_help() {
    cat << EOF
Orbit Command Deployment Script

Usage: ./scripts/deploy.sh [environment] [options]

Environments:
  production    Deploy to production environment (default)
  staging       Deploy to staging environment
  preview       Create a preview deployment

Options:
  --skip-tests  Skip running tests before deployment
  --skip-lint   Skip linting checks
  --force       Force deployment even with warnings
  --rollback    Rollback to the previous deployment
  --dry-run     Simulate deployment without executing
  --verbose     Enable verbose output
  -h, --help    Show this help message

Examples:
  ./scripts/deploy.sh                     # Deploy to production
  ./scripts/deploy.sh staging             # Deploy to staging
  ./scripts/deploy.sh production --force  # Force production deploy
  ./scripts/deploy.sh --rollback          # Rollback last deployment
  ./scripts/deploy.sh --dry-run           # Simulate deployment

Environment Variables:
  VERCEL_TOKEN          Vercel authentication token
  VERCEL_ORG_ID         Vercel organization ID
  VERCEL_PROJECT_ID     Vercel project ID
  DEPLOY_PLATFORM       Deployment platform (vercel|netlify|custom)
  SLACK_WEBHOOK_URL     Slack webhook for notifications
  SENTRY_AUTH_TOKEN     Sentry authentication token
EOF
}

# =============================================================================
# Pre-deployment Checks
# =============================================================================

check_lock() {
    if [[ -f "$LOCKFILE" ]]; then
        local lock_pid
        lock_pid=$(cat "$LOCKFILE")
        if kill -0 "$lock_pid" 2>/dev/null; then
            die "Another deployment is in progress (PID: $lock_pid)"
        else
            log WARN "Stale lock file found, removing..."
            rm -f "$LOCKFILE"
        fi
    fi
    echo $$ > "$LOCKFILE"
}

check_dependencies() {
    log INFO "Checking dependencies..."

    local missing_deps=()

    # Required tools
    command -v node >/dev/null 2>&1 || missing_deps+=("node")
    command -v npm >/dev/null 2>&1 || missing_deps+=("npm")
    command -v git >/dev/null 2>&1 || missing_deps+=("git")

    # Platform-specific tools
    case "$DEPLOY_PLATFORM" in
        vercel)
            command -v vercel >/dev/null 2>&1 || missing_deps+=("vercel")
            ;;
        netlify)
            command -v netlify >/dev/null 2>&1 || missing_deps+=("netlify")
            ;;
    esac

    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        die "Missing dependencies: ${missing_deps[*]}"
    fi

    log SUCCESS "All dependencies available"
}

check_node_version() {
    log INFO "Checking Node.js version..."

    local node_version
    node_version=$(node -v | sed 's/v//')
    local required_version="18.0.0"

    if ! printf '%s\n%s' "$required_version" "$node_version" | sort -V -C; then
        die "Node.js version $node_version is below required $required_version"
    fi

    log SUCCESS "Node.js version $node_version OK"
}

check_environment_vars() {
    log INFO "Validating environment variables..."

    local env_file="${PROJECT_ROOT}/.env.${ENVIRONMENT}"
    local env_example="${PROJECT_ROOT}/.env.example"

    # Check if environment file exists for non-production
    if [[ "$ENVIRONMENT" != "production" && ! -f "$env_file" ]]; then
        log WARN "Environment file $env_file not found, using defaults"
    fi

    # Validate required variables for deployment
    case "$DEPLOY_PLATFORM" in
        vercel)
            if [[ -z "${VERCEL_TOKEN:-}" ]]; then
                log WARN "VERCEL_TOKEN not set, will use interactive login"
            fi
            ;;
        netlify)
            if [[ -z "${NETLIFY_AUTH_TOKEN:-}" ]]; then
                log WARN "NETLIFY_AUTH_TOKEN not set, will use interactive login"
            fi
            ;;
    esac

    log SUCCESS "Environment validation complete"
}

check_git_status() {
    log INFO "Checking git status..."

    cd "$PROJECT_ROOT"

    # Check if in git repo
    if ! git rev-parse --git-dir >/dev/null 2>&1; then
        log WARN "Not a git repository, skipping git checks"
        return 0
    fi

    # Check for uncommitted changes
    if [[ -n "$(git status --porcelain)" ]]; then
        if [[ "$FORCE_DEPLOY" == true ]]; then
            log WARN "Uncommitted changes detected, proceeding with --force"
        else
            die "Uncommitted changes detected. Commit or stash changes, or use --force"
        fi
    fi

    # Get current branch
    local current_branch
    current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    log INFO "Current branch: $current_branch"

    # Warn if not on main/master for production
    if [[ "$ENVIRONMENT" == "production" && ! "$current_branch" =~ ^(main|master)$ ]]; then
        if [[ "$FORCE_DEPLOY" == true ]]; then
            log WARN "Deploying to production from branch '$current_branch'"
        else
            die "Production deployments should be from main/master branch. Use --force to override"
        fi
    fi

    log SUCCESS "Git status OK"
}

# =============================================================================
# Build & Test
# =============================================================================

install_dependencies() {
    log INFO "Installing dependencies..."

    cd "$PROJECT_ROOT"

    if [[ "$DRY_RUN" == true ]]; then
        log INFO "[DRY-RUN] Would run: npm ci"
        return 0
    fi

    # Use npm ci for clean install in CI/CD
    if [[ -f "package-lock.json" ]]; then
        npm ci --prefer-offline --no-audit
    else
        npm install
    fi

    log SUCCESS "Dependencies installed"
}

run_lint() {
    if [[ "$SKIP_LINT" == true ]]; then
        log WARN "Skipping lint (--skip-lint)"
        return 0
    fi

    log INFO "Running linter..."

    cd "$PROJECT_ROOT"

    if [[ "$DRY_RUN" == true ]]; then
        log INFO "[DRY-RUN] Would run: npm run lint"
        return 0
    fi

    if ! npm run lint; then
        if [[ "$FORCE_DEPLOY" == true ]]; then
            log WARN "Lint failed, proceeding with --force"
        else
            die "Lint failed. Fix issues or use --force to override"
        fi
    fi

    log SUCCESS "Lint passed"
}

run_tests() {
    if [[ "$SKIP_TESTS" == true ]]; then
        log WARN "Skipping tests (--skip-tests)"
        return 0
    fi

    log INFO "Running tests..."

    cd "$PROJECT_ROOT"

    if [[ "$DRY_RUN" == true ]]; then
        log INFO "[DRY-RUN] Would run: npm run test"
        return 0
    fi

    if ! npm run test; then
        if [[ "$FORCE_DEPLOY" == true ]]; then
            log WARN "Tests failed, proceeding with --force"
        else
            die "Tests failed. Fix issues or use --force to override"
        fi
    fi

    log SUCCESS "Tests passed"
}

run_build() {
    log INFO "Building application..."

    cd "$PROJECT_ROOT"

    if [[ "$DRY_RUN" == true ]]; then
        log INFO "[DRY-RUN] Would run: npm run build"
        return 0
    fi

    # Set environment for build
    export NODE_ENV=production

    # Clean previous build
    rm -rf .next

    # Run build
    if ! npm run build; then
        die "Build failed"
    fi

    # Check build output
    if [[ ! -d ".next" ]]; then
        die "Build output directory .next not found"
    fi

    # Log build stats
    local build_size
    build_size=$(du -sh .next 2>/dev/null | cut -f1)
    log INFO "Build size: $build_size"

    log SUCCESS "Build completed"
}

# =============================================================================
# Deployment
# =============================================================================

deploy_vercel() {
    log INFO "Deploying to Vercel ($ENVIRONMENT)..."

    cd "$PROJECT_ROOT"

    local deploy_args=()

    case "$ENVIRONMENT" in
        production)
            deploy_args+=("--prod")
            ;;
        staging)
            deploy_args+=("--env" "staging")
            ;;
        preview)
            # No additional args for preview
            ;;
    esac

    # Add token if available
    if [[ -n "${VERCEL_TOKEN:-}" ]]; then
        deploy_args+=("--token" "$VERCEL_TOKEN")
    fi

    # Add org/project if available
    if [[ -n "${VERCEL_ORG_ID:-}" ]]; then
        export VERCEL_ORG_ID
    fi
    if [[ -n "${VERCEL_PROJECT_ID:-}" ]]; then
        export VERCEL_PROJECT_ID
    fi

    if [[ "$DRY_RUN" == true ]]; then
        log INFO "[DRY-RUN] Would run: vercel ${deploy_args[*]}"
        return 0
    fi

    # Deploy and capture URL
    local deploy_output
    deploy_output=$(vercel "${deploy_args[@]}" 2>&1) || die "Vercel deployment failed: $deploy_output"

    # Extract deployment URL
    DEPLOY_URL=$(echo "$deploy_output" | grep -oE 'https://[^ ]+\.vercel\.app' | head -1)

    if [[ -z "$DEPLOY_URL" ]]; then
        DEPLOY_URL=$(echo "$deploy_output" | tail -1)
    fi

    log SUCCESS "Deployed to: $DEPLOY_URL"
}

deploy_netlify() {
    log INFO "Deploying to Netlify ($ENVIRONMENT)..."

    cd "$PROJECT_ROOT"

    local deploy_args=("deploy" "--dir=.next")

    if [[ "$ENVIRONMENT" == "production" ]]; then
        deploy_args+=("--prod")
    fi

    if [[ -n "${NETLIFY_AUTH_TOKEN:-}" ]]; then
        deploy_args+=("--auth" "$NETLIFY_AUTH_TOKEN")
    fi

    if [[ -n "${NETLIFY_SITE_ID:-}" ]]; then
        deploy_args+=("--site" "$NETLIFY_SITE_ID")
    fi

    if [[ "$DRY_RUN" == true ]]; then
        log INFO "[DRY-RUN] Would run: netlify ${deploy_args[*]}"
        return 0
    fi

    local deploy_output
    deploy_output=$(netlify "${deploy_args[@]}" 2>&1) || die "Netlify deployment failed: $deploy_output"

    DEPLOY_URL=$(echo "$deploy_output" | grep -oE 'https://[^ ]+\.netlify\.app' | head -1)

    log SUCCESS "Deployed to: $DEPLOY_URL"
}

deploy_custom() {
    log INFO "Deploying to custom server..."

    # Custom deployment logic here
    # This could be rsync, scp, docker push, etc.

    local deploy_host="${DEPLOY_HOST:-}"
    local deploy_path="${DEPLOY_PATH:-/var/www/orbit-command}"

    if [[ -z "$deploy_host" ]]; then
        die "DEPLOY_HOST not set for custom deployment"
    fi

    if [[ "$DRY_RUN" == true ]]; then
        log INFO "[DRY-RUN] Would deploy to $deploy_host:$deploy_path"
        return 0
    fi

    # Build standalone output
    cd "$PROJECT_ROOT"

    # Sync files
    rsync -avz --delete \
        --exclude 'node_modules' \
        --exclude '.git' \
        --exclude '.env*' \
        .next/ \
        package.json \
        package-lock.json \
        public/ \
        "$deploy_host:$deploy_path/"

    # Install dependencies and restart on remote
    ssh "$deploy_host" "cd $deploy_path && npm ci --production && pm2 restart orbit-command"

    DEPLOY_URL="https://${DEPLOY_DOMAIN:-$deploy_host}"
    log SUCCESS "Deployed to: $DEPLOY_URL"
}

perform_deployment() {
    case "$DEPLOY_PLATFORM" in
        vercel)
            deploy_vercel
            ;;
        netlify)
            deploy_netlify
            ;;
        custom)
            deploy_custom
            ;;
        *)
            die "Unknown deployment platform: $DEPLOY_PLATFORM"
            ;;
    esac
}

# =============================================================================
# Rollback
# =============================================================================

perform_rollback() {
    log INFO "Initiating rollback..."

    case "$DEPLOY_PLATFORM" in
        vercel)
            rollback_vercel
            ;;
        netlify)
            rollback_netlify
            ;;
        custom)
            rollback_custom
            ;;
    esac
}

rollback_vercel() {
    log INFO "Rolling back Vercel deployment..."

    if [[ "$DRY_RUN" == true ]]; then
        log INFO "[DRY-RUN] Would rollback Vercel deployment"
        return 0
    fi

    # List recent deployments
    local deployments
    deployments=$(vercel ls --limit 5 2>/dev/null)

    log INFO "Recent deployments:"
    echo "$deployments"

    # Get previous production deployment
    local prev_deployment
    prev_deployment=$(vercel ls --prod --limit 2 2>/dev/null | tail -1 | awk '{print $1}')

    if [[ -n "$prev_deployment" ]]; then
        vercel rollback "$prev_deployment"
        log SUCCESS "Rolled back to: $prev_deployment"
    else
        die "No previous deployment found for rollback"
    fi
}

rollback_netlify() {
    log INFO "Rolling back Netlify deployment..."

    if [[ "$DRY_RUN" == true ]]; then
        log INFO "[DRY-RUN] Would rollback Netlify deployment"
        return 0
    fi

    # Netlify rollback via CLI
    netlify rollback

    log SUCCESS "Netlify rollback completed"
}

rollback_custom() {
    log INFO "Rolling back custom deployment..."

    local deploy_host="${DEPLOY_HOST:-}"
    local deploy_path="${DEPLOY_PATH:-/var/www/orbit-command}"
    local backup_path="${deploy_path}.backup"

    if [[ -z "$deploy_host" ]]; then
        die "DEPLOY_HOST not set for rollback"
    fi

    if [[ "$DRY_RUN" == true ]]; then
        log INFO "[DRY-RUN] Would rollback on $deploy_host"
        return 0
    fi

    ssh "$deploy_host" "
        if [[ -d '$backup_path' ]]; then
            rm -rf '$deploy_path'
            mv '$backup_path' '$deploy_path'
            pm2 restart orbit-command
            echo 'Rollback completed'
        else
            echo 'No backup found for rollback'
            exit 1
        fi
    "

    log SUCCESS "Custom rollback completed"
}

# =============================================================================
# Post-deployment
# =============================================================================

verify_deployment() {
    log INFO "Verifying deployment..."

    if [[ -z "${DEPLOY_URL:-}" ]]; then
        log WARN "No deployment URL available for verification"
        return 0
    fi

    if [[ "$DRY_RUN" == true ]]; then
        log INFO "[DRY-RUN] Would verify deployment at $DEPLOY_URL"
        return 0
    fi

    # Wait for deployment to be ready
    log INFO "Waiting for deployment to be ready..."
    sleep 10

    # Health check
    local max_attempts=5
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        log DEBUG "Health check attempt $attempt/$max_attempts"

        local http_code
        http_code=$(curl -s -o /dev/null -w "%{http_code}" "${DEPLOY_URL}/api/health" 2>/dev/null || echo "000")

        if [[ "$http_code" == "200" ]]; then
            log SUCCESS "Health check passed (HTTP $http_code)"
            break
        elif [[ "$http_code" == "404" ]]; then
            # Health endpoint might not exist, check main page
            http_code=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL" 2>/dev/null || echo "000")
            if [[ "$http_code" == "200" ]]; then
                log SUCCESS "Main page accessible (HTTP $http_code)"
                break
            fi
        fi

        if [[ $attempt -eq $max_attempts ]]; then
            log WARN "Health check failed after $max_attempts attempts (HTTP $http_code)"
        else
            log DEBUG "Waiting before retry..."
            sleep 5
        fi

        ((attempt++))
    done

    # Run smoke tests
    run_smoke_tests
}

run_smoke_tests() {
    log INFO "Running smoke tests..."

    if [[ -z "${DEPLOY_URL:-}" ]]; then
        return 0
    fi

    local failed=0

    # Test 1: Main page loads
    if curl -sf "$DEPLOY_URL" >/dev/null 2>&1; then
        log SUCCESS "Smoke test: Main page loads"
    else
        log ERROR "Smoke test: Main page failed to load"
        ((failed++))
    fi

    # Test 2: Static assets accessible
    if curl -sf "${DEPLOY_URL}/_next/static/" >/dev/null 2>&1 || curl -sf "$DEPLOY_URL" | grep -q "_next/static"; then
        log SUCCESS "Smoke test: Static assets accessible"
    else
        log WARN "Smoke test: Could not verify static assets"
    fi

    # Test 3: Check response time
    local response_time
    response_time=$(curl -s -o /dev/null -w "%{time_total}" "$DEPLOY_URL" 2>/dev/null || echo "0")

    if (( $(echo "$response_time < 5" | bc -l) )); then
        log SUCCESS "Smoke test: Response time ${response_time}s (< 5s)"
    else
        log WARN "Smoke test: Slow response time ${response_time}s"
    fi

    if [[ $failed -gt 0 ]]; then
        log WARN "$failed smoke test(s) failed"
    else
        log SUCCESS "All smoke tests passed"
    fi
}

send_notifications() {
    log INFO "Sending deployment notifications..."

    local status="${1:-success}"
    local message

    if [[ "$status" == "success" ]]; then
        message="Deployment to $ENVIRONMENT completed successfully. URL: ${DEPLOY_URL:-N/A}"
    else
        message="Deployment to $ENVIRONMENT failed. Check logs for details."
    fi

    # Slack notification
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        send_slack_notification "$status" "$message"
    fi

    # Discord notification
    if [[ -n "${DISCORD_WEBHOOK_URL:-}" ]]; then
        send_discord_notification "$status" "$message"
    fi

    log DEBUG "Notifications sent"
}

send_slack_notification() {
    local status="$1"
    local message="$2"
    local color

    [[ "$status" == "success" ]] && color="good" || color="danger"

    if [[ "$DRY_RUN" == true ]]; then
        log INFO "[DRY-RUN] Would send Slack notification"
        return 0
    fi

    curl -s -X POST "$SLACK_WEBHOOK_URL" \
        -H 'Content-Type: application/json' \
        -d "{
            \"attachments\": [{
                \"color\": \"$color\",
                \"title\": \"Orbit Command Deployment\",
                \"text\": \"$message\",
                \"fields\": [
                    {\"title\": \"Environment\", \"value\": \"$ENVIRONMENT\", \"short\": true},
                    {\"title\": \"Platform\", \"value\": \"$DEPLOY_PLATFORM\", \"short\": true}
                ],
                \"footer\": \"Orbit Command CI/CD\",
                \"ts\": $(date +%s)
            }]
        }" >/dev/null 2>&1 || log WARN "Failed to send Slack notification"
}

send_discord_notification() {
    local status="$1"
    local message="$2"
    local color

    [[ "$status" == "success" ]] && color="3066993" || color="15158332"

    if [[ "$DRY_RUN" == true ]]; then
        log INFO "[DRY-RUN] Would send Discord notification"
        return 0
    fi

    curl -s -X POST "$DISCORD_WEBHOOK_URL" \
        -H 'Content-Type: application/json' \
        -d "{
            \"embeds\": [{
                \"title\": \"Orbit Command Deployment\",
                \"description\": \"$message\",
                \"color\": $color,
                \"fields\": [
                    {\"name\": \"Environment\", \"value\": \"$ENVIRONMENT\", \"inline\": true},
                    {\"name\": \"Platform\", \"value\": \"$DEPLOY_PLATFORM\", \"inline\": true}
                ],
                \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
            }]
        }" >/dev/null 2>&1 || log WARN "Failed to send Discord notification"
}

create_sentry_release() {
    if [[ -z "${SENTRY_AUTH_TOKEN:-}" ]]; then
        log DEBUG "Sentry not configured, skipping release creation"
        return 0
    fi

    log INFO "Creating Sentry release..."

    if [[ "$DRY_RUN" == true ]]; then
        log INFO "[DRY-RUN] Would create Sentry release"
        return 0
    fi

    local version
    version=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")
    local release_name="orbit-command@${version}"

    # Create release (requires sentry-cli)
    if command -v sentry-cli >/dev/null 2>&1; then
        sentry-cli releases new "$release_name" || true
        sentry-cli releases set-commits "$release_name" --auto || true
        sentry-cli releases finalize "$release_name" || true
        sentry-cli releases deploys "$release_name" new -e "$ENVIRONMENT" || true
        log SUCCESS "Sentry release created: $release_name"
    else
        log WARN "sentry-cli not found, skipping Sentry release"
    fi
}

# =============================================================================
# Main
# =============================================================================

main() {
    echo ""
    echo "=============================================="
    echo "  Orbit Command Deployment"
    echo "  Environment: $ENVIRONMENT"
    echo "  Platform: $DEPLOY_PLATFORM"
    echo "  Time: $(date)"
    echo "=============================================="
    echo ""

    # Parse command line arguments
    parse_args "$@"

    # Handle rollback
    if [[ "$ROLLBACK" == true ]]; then
        check_lock
        perform_rollback
        send_notifications "success"
        exit 0
    fi

    # Pre-deployment checks
    check_lock
    check_dependencies
    check_node_version
    check_environment_vars
    check_git_status

    # Build & Test
    install_dependencies
    run_lint
    run_tests
    run_build

    # Deploy
    perform_deployment

    # Post-deployment
    verify_deployment
    create_sentry_release
    send_notifications "success"

    echo ""
    echo "=============================================="
    echo "  Deployment Complete!"
    echo "  URL: ${DEPLOY_URL:-N/A}"
    echo "  Log: $DEPLOY_LOG"
    echo "=============================================="
    echo ""
}

# Run main function with all arguments
main "$@"
