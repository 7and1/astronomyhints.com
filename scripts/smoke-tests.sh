#!/usr/bin/env bash
#
# Smoke Tests for Orbit Command
# Run after deployment to verify basic functionality
#
set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_URL="${1:-https://astronomyhints.com}"
PASSED=0
FAILED=0
WARNINGS=0

log_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED++))
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED++))
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    ((WARNINGS++))
}

echo "=============================================="
echo "  Smoke Tests for Orbit Command"
echo "  Target: $BASE_URL"
echo "  Time: $(date)"
echo "=============================================="
echo ""

# -----------------------------------------------------------------------------
# Test 1: Main page loads
# -----------------------------------------------------------------------------
echo "Test 1: Main page accessibility"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" 2>/dev/null || echo "000")
if [[ "$HTTP_CODE" == "200" ]]; then
    log_pass "Main page returns HTTP 200"
else
    log_fail "Main page returns HTTP $HTTP_CODE (expected 200)"
fi

# -----------------------------------------------------------------------------
# Test 2: Health endpoint
# -----------------------------------------------------------------------------
echo "Test 2: Health endpoint"
HEALTH_RESPONSE=$(curl -s "${BASE_URL}/api/health" 2>/dev/null || echo "{}")
HEALTH_STATUS=$(echo "$HEALTH_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4 || echo "unknown")

if [[ "$HEALTH_STATUS" == "healthy" ]]; then
    log_pass "Health endpoint reports healthy"
elif [[ "$HEALTH_STATUS" == "degraded" ]]; then
    log_warn "Health endpoint reports degraded"
else
    log_fail "Health endpoint status: $HEALTH_STATUS"
fi

# -----------------------------------------------------------------------------
# Test 3: Ready endpoint
# -----------------------------------------------------------------------------
echo "Test 3: Ready endpoint"
READY_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/ready" 2>/dev/null || echo "000")
if [[ "$READY_CODE" == "200" ]]; then
    log_pass "Ready endpoint returns HTTP 200"
else
    log_fail "Ready endpoint returns HTTP $READY_CODE"
fi

# -----------------------------------------------------------------------------
# Test 4: Static assets
# -----------------------------------------------------------------------------
echo "Test 4: Static assets accessibility"
# Check if main page contains references to static assets
PAGE_CONTENT=$(curl -s "$BASE_URL" 2>/dev/null || echo "")
if echo "$PAGE_CONTENT" | grep -q "_next/static"; then
    log_pass "Static assets referenced in page"
else
    log_warn "Could not verify static assets in page"
fi

# -----------------------------------------------------------------------------
# Test 5: Response time
# -----------------------------------------------------------------------------
echo "Test 5: Response time"
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL" 2>/dev/null || echo "999")
RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc | cut -d'.' -f1)

if [[ $RESPONSE_MS -lt 2000 ]]; then
    log_pass "Response time: ${RESPONSE_MS}ms (< 2000ms)"
elif [[ $RESPONSE_MS -lt 5000 ]]; then
    log_warn "Response time: ${RESPONSE_MS}ms (< 5000ms but slow)"
else
    log_fail "Response time: ${RESPONSE_MS}ms (> 5000ms)"
fi

# -----------------------------------------------------------------------------
# Test 6: HTTPS redirect
# -----------------------------------------------------------------------------
echo "Test 6: HTTPS configuration"
if [[ "$BASE_URL" == https://* ]]; then
    # Check if HTTP redirects to HTTPS
    HTTP_URL="${BASE_URL/https:/http:}"
    REDIRECT_CODE=$(curl -s -o /dev/null -w "%{http_code}" -L "$HTTP_URL" 2>/dev/null || echo "000")
    if [[ "$REDIRECT_CODE" == "200" ]]; then
        log_pass "HTTP redirects to HTTPS correctly"
    else
        log_warn "Could not verify HTTP to HTTPS redirect"
    fi
else
    log_warn "Not testing HTTPS (URL is not HTTPS)"
fi

# -----------------------------------------------------------------------------
# Test 7: Security headers
# -----------------------------------------------------------------------------
echo "Test 7: Security headers"
HEADERS=$(curl -s -I "$BASE_URL" 2>/dev/null || echo "")

check_header() {
    local header="$1"
    if echo "$HEADERS" | grep -qi "^$header:"; then
        log_pass "Header present: $header"
    else
        log_warn "Header missing: $header"
    fi
}

check_header "X-Frame-Options"
check_header "X-Content-Type-Options"
check_header "Referrer-Policy"

# -----------------------------------------------------------------------------
# Test 8: Content-Type
# -----------------------------------------------------------------------------
echo "Test 8: Content-Type"
CONTENT_TYPE=$(echo "$HEADERS" | grep -i "^content-type:" | cut -d':' -f2 | tr -d ' \r' || echo "")
if [[ "$CONTENT_TYPE" == *"text/html"* ]]; then
    log_pass "Content-Type is text/html"
else
    log_warn "Content-Type: $CONTENT_TYPE"
fi

# -----------------------------------------------------------------------------
# Test 9: Compression
# -----------------------------------------------------------------------------
echo "Test 9: Compression"
ENCODING=$(curl -s -I -H "Accept-Encoding: gzip, deflate, br" "$BASE_URL" 2>/dev/null | grep -i "^content-encoding:" || echo "")
if [[ -n "$ENCODING" ]]; then
    log_pass "Compression enabled: $(echo "$ENCODING" | cut -d':' -f2 | tr -d ' \r')"
else
    log_warn "Compression may not be enabled"
fi

# -----------------------------------------------------------------------------
# Test 10: Page content validation
# -----------------------------------------------------------------------------
echo "Test 10: Page content validation"
if echo "$PAGE_CONTENT" | grep -qi "orbit"; then
    log_pass "Page contains expected content"
else
    log_warn "Could not verify page content"
fi

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------
echo ""
echo "=============================================="
echo "  Smoke Test Summary"
echo "=============================================="
echo ""
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

TOTAL=$((PASSED + FAILED))
if [[ $TOTAL -gt 0 ]]; then
    PASS_RATE=$((PASSED * 100 / TOTAL))
    echo "Pass rate: ${PASS_RATE}%"
fi

echo ""

if [[ $FAILED -gt 0 ]]; then
    echo -e "${RED}Some tests failed. Review the results above.${NC}"
    exit 1
elif [[ $WARNINGS -gt 0 ]]; then
    echo -e "${YELLOW}All tests passed with warnings.${NC}"
    exit 0
else
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
fi
