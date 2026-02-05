# Deployment Guide - Orbit Command

Complete deployment documentation for astronomyhints.com.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Automated Deployment](#automated-deployment)
3. [Manual Deployment](#manual-deployment)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Environment Configuration](#environment-configuration)
6. [Platform-Specific Guides](#platform-specific-guides)
7. [Pre-Deployment Checklist](#pre-deployment-checklist)
8. [Post-Deployment Verification](#post-deployment-verification)
9. [Rollback Procedures](#rollback-procedures)
10. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Using the Deploy Script (Recommended)

```bash
# Deploy to production
./scripts/deploy.sh production

# Deploy to staging
./scripts/deploy.sh staging

# Preview deployment
./scripts/deploy.sh preview

# Dry run (simulate without deploying)
./scripts/deploy.sh production --dry-run
```

### Quick Vercel Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

---

## Automated Deployment

### Deploy Script Features

The `scripts/deploy.sh` script provides:

- Pre-deployment checks (dependencies, Node.js version, git status)
- Environment validation
- Linting and testing
- Build optimization
- Deployment to Vercel/Netlify/custom servers
- Post-deployment verification
- Rollback capability
- Slack/Discord notifications
- Sentry release creation

### Usage

```bash
./scripts/deploy.sh [environment] [options]

# Environments:
#   production  - Deploy to production (default)
#   staging     - Deploy to staging
#   preview     - Create preview deployment

# Options:
#   --skip-tests     Skip test execution
#   --skip-lint      Skip linting
#   --force          Force deployment even with warnings
#   --rollback       Rollback to previous deployment
#   --dry-run        Simulate deployment without executing
#   --verbose        Enable verbose output
```

### Examples

```bash
# Standard production deployment
./scripts/deploy.sh production

# Quick deployment (skip tests)
./scripts/deploy.sh production --skip-tests

# Force deployment from feature branch
./scripts/deploy.sh production --force

# Rollback last deployment
./scripts/deploy.sh --rollback

# See what would happen without deploying
./scripts/deploy.sh production --dry-run --verbose
```

---

## Manual Deployment

### Vercel (Recommended)

#### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy preview
vercel

# Deploy to production
vercel --prod
```

#### Option 2: GitHub Integration

1. Push code to GitHub repository
2. Visit [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Vercel auto-detects Next.js and deploys

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Build the project
npm run build

# Deploy
netlify deploy --prod --dir=.next
```

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Cloudflare Pages

1. Connect GitHub repository in Cloudflare Dashboard
2. Configure build settings:
   - Build command: `npm run build`
   - Build output: `.next`
   - Framework preset: Next.js

---

## CI/CD Pipeline

### GitHub Actions Workflows

The project includes two workflows:

#### 1. CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and pull request:
- Dependency installation with caching
- ESLint linting
- TypeScript type checking
- Unit tests with coverage
- Build verification
- Security audit

#### 2. Deploy Workflow (`.github/workflows/deploy.yml`)

- **On PR**: Creates preview deployment
- **On merge to main**: Deploys to production
- **Manual trigger**: Deploy to any environment

### Required GitHub Secrets

Configure these in your repository settings:

| Secret | Description | Required |
|--------|-------------|----------|
| `VERCEL_TOKEN` | Vercel authentication token | Yes |
| `VERCEL_ORG_ID` | Vercel organization ID | Yes |
| `VERCEL_PROJECT_ID` | Vercel project ID | Yes |
| `CODECOV_TOKEN` | Codecov upload token | No |
| `SNYK_TOKEN` | Snyk security scanning | No |
| `SENTRY_AUTH_TOKEN` | Sentry release creation | No |
| `SENTRY_ORG` | Sentry organization slug | No |
| `SENTRY_PROJECT` | Sentry project slug | No |
| `SLACK_WEBHOOK_URL` | Slack notifications | No |

### Getting Vercel Credentials

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel link

# Get credentials from .vercel/project.json
cat .vercel/project.json
```

---

## Environment Configuration

### Environment Files

| File | Purpose |
|------|---------|
| `.env.example` | Template with all variables |
| `.env.local` | Local development (git-ignored) |
| `.env.production` | Production overrides |
| `.env.staging` | Staging overrides |

### Required Variables

```bash
# Base URL (required for SEO)
NEXT_PUBLIC_SITE_URL=https://astronomyhints.com
```

### Optional Variables

```bash
# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=astronomyhints.com

# Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Social
NEXT_PUBLIC_TWITTER_HANDLE=@astronomyhints
```

### Validate Environment

```bash
# Check all required variables
./scripts/validate-env.sh production
```

---

## Platform-Specific Guides

### Vercel Configuration

Vercel auto-detects Next.js. Optional `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ]
}
```

### Custom Server (PM2)

```bash
# Build
npm run build

# Start with PM2
pm2 start npm --name "orbit-command" -- start

# Or use ecosystem file
pm2 start ecosystem.config.js
```

`ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'orbit-command',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 'max',
    exec_mode: 'cluster'
  }]
};
```

### Docker Deployment

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing: `npm run test`
- [ ] No lint errors: `npm run lint`
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Build succeeds: `npm run build`

### Functionality

- [ ] Test in production mode locally: `npm run build && npm run start`
- [ ] WebGL visualization loads correctly
- [ ] All interactive features work
- [ ] Screenshot download works
- [ ] Cinematic mode functions
- [ ] Mobile responsive design works

### Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Performance

- [ ] Bundle size acceptable (check build output)
- [ ] Lighthouse score > 80
- [ ] No console errors
- [ ] No memory leaks

### Security

- [ ] No secrets in code
- [ ] Environment variables configured
- [ ] Security headers enabled
- [ ] npm audit clean

---

## Post-Deployment Verification

### Automated Smoke Tests

```bash
# Run smoke tests against production
./scripts/smoke-tests.sh https://astronomyhints.com
```

### Manual Verification

1. **Health Check**
   ```bash
   curl https://astronomyhints.com/api/health
   ```

2. **Visual Inspection**
   - Load main page
   - Verify 3D visualization
   - Test planet selection
   - Test time controls

3. **Performance Check**
   ```bash
   npx lighthouse https://astronomyhints.com --view
   ```

### Monitoring

- Check Vercel Analytics dashboard
- Verify Sentry is receiving events
- Monitor error rates
- Check response times

---

## Rollback Procedures

### Quick Rollback

```bash
# Using deploy script
./scripts/deploy.sh --rollback

# Using Vercel CLI
vercel rollback
```

### Vercel Dashboard Rollback

1. Go to Vercel Dashboard > Project > Deployments
2. Find the last working deployment
3. Click "..." > "Promote to Production"

### Git-based Rollback

```bash
# Revert last commit
git revert HEAD
git push origin main

# Or deploy specific commit
git checkout <commit-hash>
./scripts/deploy.sh production --force
```

---

## Troubleshooting

### Build Failures

```bash
# Clear all caches
rm -rf node_modules .next
npm ci
npm run build
```

### TypeScript Errors

```bash
# Check for type errors
npx tsc --noEmit

# Generate fresh types
rm -rf .next/types
npm run build
```

### WebGL Issues

- Check browser WebGL support: https://get.webgl.org/
- Test in incognito mode (extensions may interfere)
- Check GPU blacklist in browser
- Verify Three.js version compatibility

### Memory Issues

- Check health endpoint: `/api/health`
- Review Three.js disposal in components
- Check for event listener cleanup
- Monitor with browser DevTools

### Deployment Stuck

```bash
# Cancel and retry
vercel --force

# Or remove .vercel and relink
rm -rf .vercel
vercel link
vercel --prod
```

### Environment Variables Not Working

- Verify variables are set in hosting dashboard
- Check variable names start with `NEXT_PUBLIC_` for client-side
- Redeploy after changing variables
- Check `.env.local` is git-ignored

---

## Related Documentation

- [OPERATIONS.md](./OPERATIONS.md) - Operations runbook
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guide

---

## Support

For deployment issues:
1. Check this documentation
2. Review [OPERATIONS.md](./OPERATIONS.md) troubleshooting section
3. Check Vercel/Netlify status pages
4. Review deployment logs
