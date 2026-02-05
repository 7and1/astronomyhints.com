# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously at Astronomy Hints. If you discover a security vulnerability in Orbit Command, please report it responsibly.

### How to Report

1. **Email**: Send details to security@astronomyhints.com
2. **Subject**: Use "[SECURITY] Orbit Command - Brief Description"
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Resolution Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 7 days
  - Medium: 30 days
  - Low: 90 days

### Responsible Disclosure

- Please do not publicly disclose the vulnerability until we have addressed it
- We will credit you in our security acknowledgments (unless you prefer anonymity)
- We do not offer bug bounties at this time

## Security Measures

### Content Security Policy (CSP)

Orbit Command implements a strict CSP with the following directives:

- `default-src 'self'` - Only load resources from same origin
- `script-src 'self' 'unsafe-eval'` - Scripts from same origin (unsafe-eval required for Three.js shader compilation)
- `style-src 'self' 'unsafe-inline'` - Styles from same origin with inline styles for React/Three.js
- `img-src 'self' data: blob:` - Images from same origin, data URIs, and blobs
- `connect-src 'self'` - Only connect to same origin
- `frame-ancestors 'none'` - Prevent embedding in iframes
- `object-src 'none'` - Block plugins
- `form-action 'self'` - Forms only submit to same origin

### Security Headers

All responses include:

- `X-Frame-Options: DENY` - Prevent clickjacking
- `X-Content-Type-Options: nosniff` - Prevent MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Control referrer information
- `Permissions-Policy` - Disable unnecessary browser features
- `Strict-Transport-Security` - Enforce HTTPS (HSTS)

### Data Handling

- **No User Accounts**: No authentication or user data collection
- **Local Storage**: Only stores user preferences (render quality, cookie consent)
- **No Server-Side APIs**: All calculations performed client-side
- **No External Data Fetching**: All astronomical calculations use local library

### Input Validation

- All URL parameters are validated and sanitized
- Numeric inputs are clamped to safe ranges
- Planet names are validated against whitelist
- Date inputs are validated for range (-9999 to 9999)

### Third-Party Dependencies

We regularly audit dependencies using `npm audit`. Current status:

- **Next.js**: Monitor for security updates
- **Three.js**: WebGL rendering (trusted library)
- **astronomy-engine**: Astronomical calculations (trusted library)
- **React**: UI framework (trusted library)

## Security Checklist for Maintainers

### Before Each Release

- [ ] Run `npm audit` and address vulnerabilities
- [ ] Review any new dependencies
- [ ] Test CSP headers are applied correctly
- [ ] Verify no sensitive data in build output
- [ ] Check source maps are not exposed in production

### Ongoing

- [ ] Monitor dependency security advisories
- [ ] Review error messages for information leakage
- [ ] Ensure console.log removed in production builds
- [ ] Verify HTTPS enforcement

## Known Limitations

1. **unsafe-eval in CSP**: Required for Three.js shader compilation. This is a known trade-off for WebGL applications.

2. **unsafe-inline for styles**: Required for React/Three.js inline styles. Consider migrating to CSS-in-JS with nonce support in future.

3. **Client-Side Only**: All data processing happens in the browser. While this eliminates server-side vulnerabilities, it means all code is visible to users.

## Security Contacts

- **Primary**: security@astronomyhints.com
- **Backup**: hello@astronomyhints.com

## Changelog

### 2026-02-04
- Initial security policy
- Implemented comprehensive security headers
- Added CSP policy
- Created security documentation
