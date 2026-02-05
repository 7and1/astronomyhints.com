# Operations Runbook - Orbit Command

This document provides operational procedures for maintaining and troubleshooting the Orbit Command application.

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Deployment Procedures](#deployment-procedures)
3. [Monitoring](#monitoring)
4. [Incident Response](#incident-response)
5. [Rollback Procedures](#rollback-procedures)
6. [Maintenance Tasks](#maintenance-tasks)
7. [Troubleshooting Guide](#troubleshooting-guide)
8. [Security Procedures](#security-procedures)

---

## Quick Reference

### Key URLs

| Environment | URL | Health Check |
|-------------|-----|--------------|
| Production | https://astronomyhints.com | https://astronomyhints.com/api/health |
| Staging | https://staging.astronomyhints.com | https://staging.astronomyhints.com/api/health |

### Key Commands

```bash
# Deploy to production
./scripts/deploy.sh production

# Deploy to staging
./scripts/deploy.sh staging

# Rollback last deployment
./scripts/deploy.sh --rollback

# Run smoke tests
./scripts/smoke-tests.sh https://astronomyhints.com

# Validate environment
./scripts/validate-env.sh production
```

### Emergency Contacts

| Role | Contact |
|------|---------|
| On-call Engineer | [Configure in PagerDuty/Opsgenie] |
| Platform Admin | [Your contact] |

---

## Deployment Procedures

### Standard Deployment

1. **Pre-deployment checklist:**
   ```bash
   # Validate environment
   ./scripts/validate-env.sh production

   # Run tests locally
   npm run test
   npm run lint
   npm run build
   ```

2. **Deploy:**
   ```bash
   ./scripts/deploy.sh production
   ```

3. **Post-deployment verification:**
   ```bash
   ./scripts/smoke-tests.sh https://astronomyhints.com
   ```

### Deployment via CI/CD

Deployments are automatically triggered:
- **Production**: On merge to `main` branch
- **Preview**: On pull request creation/update

Manual deployment can be triggered via GitHub Actions:
1. Go to Actions > Deploy Orbit Command
2. Click "Run workflow"
3. Select environment and branch

### Deployment Checklist

- [ ] All tests passing in CI
- [ ] Code reviewed and approved
- [ ] No critical security vulnerabilities
- [ ] Environment variables configured
- [ ] Monitoring alerts configured
- [ ] Rollback plan ready

---

## Monitoring

### Health Endpoints

| Endpoint | Purpose | Expected Response |
|----------|---------|-------------------|
| `/api/health` | Full health check | `{"status": "healthy"}` |
| `/api/ready` | Readiness probe | `{"status": "ready"}` |

### Key Metrics to Monitor

1. **Availability**
   - Uptime percentage (target: 99.9%)
   - Health check status

2. **Performance**
   - Response time (p50, p95, p99)
   - Time to First Byte (TTFB)
   - Largest Contentful Paint (LCP)

3. **Errors**
   - Error rate
   - 5xx response rate
   - JavaScript errors

4. **Resources**
   - Memory usage
   - CPU usage
   - Network bandwidth

### Monitoring Tools

| Tool | Purpose | Dashboard |
|------|---------|-----------|
| Vercel Analytics | Performance & Web Vitals | Vercel Dashboard |
| Sentry | Error tracking | sentry.io |
| Google Analytics | User analytics | analytics.google.com |

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Error rate | > 1% | > 5% |
| Response time (p95) | > 2s | > 5s |
| Availability | < 99.9% | < 99% |
| Memory usage | > 75% | > 90% |

---

## Incident Response

### Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| P1 - Critical | Service down | 15 minutes | Site unreachable, data loss |
| P2 - High | Major feature broken | 1 hour | WebGL not loading, errors for all users |
| P3 - Medium | Minor feature broken | 4 hours | Single feature not working |
| P4 - Low | Cosmetic issues | 24 hours | UI glitches, typos |

### Incident Response Steps

1. **Acknowledge** - Confirm the incident
2. **Assess** - Determine severity and impact
3. **Communicate** - Notify stakeholders
4. **Mitigate** - Take immediate action (rollback if needed)
5. **Resolve** - Fix the root cause
6. **Review** - Post-incident review

### Communication Templates

**Initial Notification:**
```
[INCIDENT] Orbit Command - [Severity]
Status: Investigating
Impact: [Description of user impact]
Started: [Time]
Updates: [Channel/URL]
```

**Resolution:**
```
[RESOLVED] Orbit Command - [Severity]
Duration: [Time]
Root Cause: [Brief description]
Resolution: [What was done]
Follow-up: [Any pending actions]
```

---

## Rollback Procedures

### Automatic Rollback (Vercel)

1. Go to Vercel Dashboard > Project > Deployments
2. Find the last working deployment
3. Click "..." > "Promote to Production"

### CLI Rollback

```bash
# Rollback to previous deployment
./scripts/deploy.sh --rollback

# Or manually with Vercel CLI
vercel rollback
```

### Manual Rollback

1. Identify the last working commit:
   ```bash
   git log --oneline -10
   ```

2. Create a revert commit:
   ```bash
   git revert HEAD
   git push origin main
   ```

3. Or deploy a specific commit:
   ```bash
   git checkout <commit-hash>
   ./scripts/deploy.sh production --force
   ```

### Rollback Verification

After rollback, verify:
- [ ] Health endpoint returns healthy
- [ ] Main page loads correctly
- [ ] WebGL visualization works
- [ ] No console errors
- [ ] Smoke tests pass

---

## Maintenance Tasks

### Daily

- [ ] Check error tracking dashboard
- [ ] Review any alerts

### Weekly

- [ ] Review performance metrics
- [ ] Check for dependency updates
- [ ] Review security advisories

### Monthly

- [ ] Update dependencies: `npm update`
- [ ] Run security audit: `npm audit`
- [ ] Review and rotate secrets if needed
- [ ] Test disaster recovery procedures

### Quarterly

- [ ] Full security review
- [ ] Performance optimization review
- [ ] Documentation update
- [ ] Capacity planning review

### Dependency Updates

```bash
# Check for updates
npm outdated

# Update patch versions (safe)
npm update

# Update to latest (review changelog first)
npm install <package>@latest

# Security audit
npm audit
npm audit fix
```

---

## Troubleshooting Guide

### Site Not Loading

1. **Check health endpoint:**
   ```bash
   curl -I https://astronomyhints.com/api/health
   ```

2. **Check Vercel status:**
   - Visit https://www.vercel-status.com/

3. **Check DNS:**
   ```bash
   dig astronomyhints.com
   nslookup astronomyhints.com
   ```

4. **Check SSL certificate:**
   ```bash
   openssl s_client -connect astronomyhints.com:443 -servername astronomyhints.com
   ```

### WebGL Not Working

1. **Check browser console for errors**

2. **Verify WebGL support:**
   - Visit https://get.webgl.org/

3. **Common causes:**
   - GPU blacklisted
   - Browser extensions blocking
   - Outdated graphics drivers
   - Mobile device limitations

4. **Fallback behavior:**
   - Application should show error message
   - Check `WebGLErrorBoundary` component

### Slow Performance

1. **Run Lighthouse audit:**
   ```bash
   npx lighthouse https://astronomyhints.com --view
   ```

2. **Check bundle size:**
   ```bash
   npm run build
   # Review .next/analyze if configured
   ```

3. **Common causes:**
   - Large JavaScript bundles
   - Unoptimized images
   - Too many re-renders
   - Memory leaks in Three.js

### Build Failures

1. **Clear cache and rebuild:**
   ```bash
   rm -rf .next node_modules
   npm ci
   npm run build
   ```

2. **Check TypeScript errors:**
   ```bash
   npx tsc --noEmit
   ```

3. **Check ESLint errors:**
   ```bash
   npm run lint
   ```

### Memory Issues

1. **Check memory usage:**
   ```bash
   curl https://astronomyhints.com/api/health | jq '.checks[] | select(.name=="memory")'
   ```

2. **Common causes:**
   - Three.js geometry/material not disposed
   - Event listeners not cleaned up
   - Large arrays in state

3. **Solutions:**
   - Review useEffect cleanup functions
   - Implement proper Three.js disposal
   - Use React.memo for expensive components

---

## Security Procedures

### Security Headers

The application implements these security headers:
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security
- Referrer-Policy
- Permissions-Policy

### Secret Rotation

1. **Vercel tokens:**
   - Generate new token in Vercel dashboard
   - Update GitHub secrets
   - Revoke old token

2. **API keys:**
   - Generate new key in provider dashboard
   - Update environment variables
   - Test deployment
   - Revoke old key

### Security Incident Response

1. **Immediate actions:**
   - Assess the scope of the breach
   - Rotate compromised credentials
   - Review access logs

2. **Investigation:**
   - Identify attack vector
   - Determine data exposure
   - Document timeline

3. **Recovery:**
   - Patch vulnerability
   - Restore from clean backup if needed
   - Monitor for further attacks

4. **Post-incident:**
   - Conduct security review
   - Update security procedures
   - Notify affected parties if required

### Vulnerability Management

```bash
# Check for vulnerabilities
npm audit

# Fix automatically where possible
npm audit fix

# Review and fix manually
npm audit --json > audit-report.json
```

---

## Appendix

### Environment Variables Reference

See `.env.example` for complete list of environment variables.

### Useful Commands

```bash
# Local development
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run tests
npm run test
npm run test:coverage

# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

### Log Locations

| Log Type | Location |
|----------|----------|
| Deployment logs | `./logs/deploy-*.log` |
| Vercel logs | Vercel Dashboard > Logs |
| Error tracking | Sentry Dashboard |

### Related Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guide
