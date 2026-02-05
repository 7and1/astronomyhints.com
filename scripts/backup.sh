#!/usr/bin/env bash
#
# Backup Script for Orbit Command
# Creates backups of important project files and configurations
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${BACKUP_DIR:-${PROJECT_ROOT}/backups}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="orbit-command-${TIMESTAMP}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

show_help() {
    cat << EOF
Orbit Command Backup Script

Usage: ./scripts/backup.sh [command] [options]

Commands:
  create      Create a new backup (default)
  list        List available backups
  restore     Restore from a backup

Options:
  --output    Output directory for backups (default: ./backups)
  --name      Custom backup name
  -h, --help  Show this help message

Examples:
  ./scripts/backup.sh                    # Create backup
  ./scripts/backup.sh create             # Create backup
  ./scripts/backup.sh list               # List backups
  ./scripts/backup.sh restore <name>     # Restore from backup
EOF
}

create_backup() {
    log "Creating backup: ${BACKUP_NAME}"

    # Create backup directory
    mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}"

    # Backup source code (excluding node_modules, .next, etc.)
    log "Backing up source code..."
    tar -czf "${BACKUP_DIR}/${BACKUP_NAME}/source.tar.gz" \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='.vercel' \
        --exclude='coverage' \
        --exclude='backups' \
        --exclude='logs' \
        --exclude='.git' \
        -C "${PROJECT_ROOT}" .

    # Backup package files separately for quick reference
    log "Backing up package files..."
    cp "${PROJECT_ROOT}/package.json" "${BACKUP_DIR}/${BACKUP_NAME}/"
    cp "${PROJECT_ROOT}/package-lock.json" "${BACKUP_DIR}/${BACKUP_NAME}/"

    # Backup configuration files
    log "Backing up configuration..."
    mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}/config"

    for config_file in next.config.js tsconfig.json tailwind.config.ts vercel.json netlify.toml; do
        if [[ -f "${PROJECT_ROOT}/${config_file}" ]]; then
            cp "${PROJECT_ROOT}/${config_file}" "${BACKUP_DIR}/${BACKUP_NAME}/config/"
        fi
    done

    # Create backup manifest
    log "Creating manifest..."
    cat > "${BACKUP_DIR}/${BACKUP_NAME}/manifest.json" << EOF
{
  "name": "${BACKUP_NAME}",
  "created": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version": "$(node -p "require('${PROJECT_ROOT}/package.json').version" 2>/dev/null || echo 'unknown')",
  "node_version": "$(node -v)",
  "npm_version": "$(npm -v)",
  "git_commit": "$(cd "${PROJECT_ROOT}" && git rev-parse HEAD 2>/dev/null || echo 'not a git repo')",
  "git_branch": "$(cd "${PROJECT_ROOT}" && git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
}
EOF

    # Calculate backup size
    BACKUP_SIZE=$(du -sh "${BACKUP_DIR}/${BACKUP_NAME}" | cut -f1)

    log "Backup created successfully!"
    echo ""
    echo "  Location: ${BACKUP_DIR}/${BACKUP_NAME}"
    echo "  Size: ${BACKUP_SIZE}"
    echo ""

    # Cleanup old backups (keep last 5)
    cleanup_old_backups
}

list_backups() {
    log "Available backups in ${BACKUP_DIR}:"
    echo ""

    if [[ ! -d "${BACKUP_DIR}" ]]; then
        warn "No backups directory found"
        return
    fi

    local count=0
    for backup in "${BACKUP_DIR}"/orbit-command-*; do
        if [[ -d "$backup" ]]; then
            local name=$(basename "$backup")
            local size=$(du -sh "$backup" 2>/dev/null | cut -f1)
            local manifest="${backup}/manifest.json"

            if [[ -f "$manifest" ]]; then
                local created=$(grep -o '"created": "[^"]*"' "$manifest" | cut -d'"' -f4)
                local version=$(grep -o '"version": "[^"]*"' "$manifest" | cut -d'"' -f4)
                echo "  ${name}"
                echo "    Created: ${created}"
                echo "    Version: ${version}"
                echo "    Size: ${size}"
                echo ""
            else
                echo "  ${name} (${size})"
            fi
            ((count++))
        fi
    done

    if [[ $count -eq 0 ]]; then
        warn "No backups found"
    else
        echo "Total: ${count} backup(s)"
    fi
}

restore_backup() {
    local backup_name="$1"

    if [[ -z "$backup_name" ]]; then
        error "Please specify a backup name. Use './scripts/backup.sh list' to see available backups."
    fi

    local backup_path="${BACKUP_DIR}/${backup_name}"

    if [[ ! -d "$backup_path" ]]; then
        error "Backup not found: ${backup_path}"
    fi

    log "Restoring from backup: ${backup_name}"

    # Confirm restoration
    echo ""
    warn "This will overwrite current project files!"
    read -p "Are you sure you want to continue? (y/N) " -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Restoration cancelled"
        exit 0
    fi

    # Create a backup of current state first
    log "Creating backup of current state..."
    BACKUP_NAME="pre-restore-${TIMESTAMP}" create_backup

    # Restore source code
    log "Restoring source code..."

    # Remove current files (except protected directories)
    find "${PROJECT_ROOT}" -maxdepth 1 -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.json" | while read -r file; do
        rm -f "$file"
    done

    # Extract backup
    tar -xzf "${backup_path}/source.tar.gz" -C "${PROJECT_ROOT}"

    log "Restoration complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Run 'npm ci' to install dependencies"
    echo "  2. Run 'npm run build' to verify the build"
    echo "  3. Test the application locally"
    echo ""
}

cleanup_old_backups() {
    local max_backups=5
    local backup_count=$(ls -d "${BACKUP_DIR}"/orbit-command-* 2>/dev/null | wc -l)

    if [[ $backup_count -gt $max_backups ]]; then
        log "Cleaning up old backups (keeping last ${max_backups})..."
        ls -dt "${BACKUP_DIR}"/orbit-command-* | tail -n +$((max_backups + 1)) | while read -r old_backup; do
            log "Removing: $(basename "$old_backup")"
            rm -rf "$old_backup"
        done
    fi
}

# Parse arguments
COMMAND="${1:-create}"

case "$COMMAND" in
    create)
        create_backup
        ;;
    list)
        list_backups
        ;;
    restore)
        restore_backup "${2:-}"
        ;;
    -h|--help)
        show_help
        ;;
    *)
        error "Unknown command: $COMMAND. Use -h for help."
        ;;
esac
