# Changelog

All notable changes to Orbit Command will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Dwarf planets (Pluto, Ceres, Eris)
- Asteroid belt visualization
- Saturn ring detail
- Moon systems for gas giants
- VR/WebXR support
- Multi-language support

---

## [1.1.0] - 2026-02-04

### Added
- **Mobile Optimization**
  - Responsive touch controls (pinch zoom, drag rotate)
  - Mobile-optimized HUD layout
  - Bottom navigation for small screens
  - Adaptive quality settings based on device

- **Progressive Web App (PWA)**
  - Offline support with service worker
  - Add to home screen capability
  - App-like experience on mobile

- **Accessibility Improvements**
  - Screen reader support with ARIA labels
  - Keyboard navigation for all controls
  - Skip link for main content
  - Accessible scene descriptions
  - Focus management for modals

- **Performance Enhancements**
  - Astronomy calculation caching
  - Optimized render loop
  - Lazy loading for non-critical components
  - Memory leak prevention

- **Security Hardening**
  - Content Security Policy headers
  - Input validation for all user inputs
  - XSS prevention measures
  - Secure cookie handling

- **Developer Experience**
  - Comprehensive error handling
  - Structured logging system
  - Performance monitoring hooks
  - Unit test coverage

- **Documentation**
  - User Guide with full feature documentation
  - Astrophotography planning guide
  - Educational content about the solar system
  - Developer guide with architecture details
  - FAQ section
  - Contributing guidelines

### Changed
- Improved camera animation smoothness
- Enhanced planet selection feedback
- Better time control precision
- Updated planet data with latest moon counts

### Fixed
- Planet positions now accurate for dates 1900-2100
- Touch controls no longer conflict with scroll
- Screenshot capture works on all browsers
- Memory cleanup on component unmount

### Security
- Added security headers in Next.js config
- Implemented input sanitization
- Added rate limiting considerations

---

## [1.0.0] - 2026-01-15

### Added
- **Core Solar System Visualization**
  - 8 planets with accurate relative sizes
  - Real-time planetary positions using astronomy-engine
  - Orbital path visualization
  - Sun with glow effect

- **Interactive Controls**
  - Mouse/touch camera controls (rotate, zoom, pan)
  - Planet selection with info panel
  - Time speed control (pause to 3650x)
  - Orbit line toggle
  - Planet label toggle

- **Cinematic Mode**
  - Automated tour through solar system
  - Smooth camera transitions
  - Auto-rotation

- **Visual Effects**
  - Bloom post-processing
  - Chromatic aberration
  - Star field background (5000+ stars)
  - Planet glow on selection

- **Information Display**
  - Planet statistics (mass, radius, temperature)
  - Orbital information (distance, period)
  - Astrophotography tips for each planet
  - Atmospheric composition

- **Screenshot Feature**
  - Capture current view as PNG
  - Download to device

- **Responsive Design**
  - Desktop optimized layout
  - Basic mobile support

### Technical
- Next.js 15 with App Router
- React Three Fiber for 3D rendering
- Zustand for state management
- TypeScript throughout
- Tailwind CSS for styling

---

## [0.1.0] - 2026-01-01

### Added
- Initial prototype
- Basic 3D scene with planets
- Simple orbital animation
- Proof of concept for astronomy-engine integration

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 1.1.0 | 2026-02-04 | Mobile, PWA, Accessibility, Security |
| 1.0.0 | 2026-01-15 | Initial public release |
| 0.1.0 | 2026-01-01 | Prototype |

---

## Upgrade Guide

### From 1.0.0 to 1.1.0

No breaking changes. Simply update and rebuild:

```bash
git pull
npm install
npm run build
```

New features are automatically available.

### Environment Variables

New optional environment variables in 1.1.0:

```bash
# Performance monitoring (optional)
NEXT_PUBLIC_ENABLE_MONITORING=true

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ID=your-id
```

---

## Deprecation Notices

### Planned Deprecations

None currently planned.

### Removed Features

None removed yet.

---

## Known Issues

### Current Limitations

1. **Safari WebGL**: Bloom effect may appear different on Safari
2. **Very old devices**: May experience low frame rates
3. **Extreme time speeds**: Positions may skip at >1000x speed

### Workarounds

1. Safari: Use Chrome or Firefox for best visual experience
2. Old devices: Lower quality setting in preferences
3. Time speed: Use moderate speeds for smooth animation

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute to this project.

When contributing, please update this changelog under the `[Unreleased]` section.

---

## Links

- [GitHub Repository](https://github.com/astronomyhints/orbit-command)
- [Live Application](https://astronomyhints.com)
- [Documentation](docs/)
- [Issue Tracker](https://github.com/astronomyhints/orbit-command/issues)

---

*Maintained by the Astronomy Hints team*
