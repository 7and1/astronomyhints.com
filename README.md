# Orbit Command

**Real-Time 3D Solar System Explorer**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://astronomyhints.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)

A stunning interactive 3D solar system visualization with real-time planetary positions, built with Next.js, Three.js, and astronomical calculations.

![Orbit Command Screenshot](public/og-image.png)

## Features

### Core Features
- **Real-Time Planetary Positions** - Accurate positions calculated using astronomy-engine
- **Interactive 3D Environment** - Rotate, zoom, and explore with mouse or touch
- **Planet Information** - Detailed stats, composition, and astrophotography tips
- **Time Control** - Pause, play, or accelerate time up to 3650x speed
- **Cinematic Mode** - Automated tour through the solar system

### Visual Features
- **Stunning Graphics** - Bloom effects, chromatic aberration, and glow
- **5000+ Star Background** - Immersive space environment
- **Orbital Paths** - Visualize planetary orbits
- **Responsive HUD** - Sci-fi inspired interface

### Technical Features
- **Offline Support** - Works without internet (PWA)
- **Mobile Optimized** - Touch controls and responsive design
- **Accessible** - Screen reader support and keyboard navigation
- **Screenshot Capture** - Save and share your view

## Quick Start

```bash
# Clone the repository
git clone https://github.com/astronomyhints/orbit-command.git
cd orbit-command

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 15](https://nextjs.org/) | React framework with App Router |
| [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/) | React renderer for Three.js |
| [Three.js](https://threejs.org/) | 3D graphics library |
| [astronomy-engine](https://github.com/cosinekitty/astronomy) | Astronomical calculations |
| [Zustand](https://github.com/pmndrs/zustand) | State management |
| [GSAP](https://greensock.com/gsap/) | Animation library |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |

## Controls

### Desktop
| Action | Control |
|--------|---------|
| Rotate view | Left-click + drag |
| Zoom | Mouse wheel |
| Select planet | Click on planet |
| Pan view | Right-click + drag |

### Mobile
| Action | Gesture |
|--------|---------|
| Rotate view | Single finger drag |
| Zoom | Pinch |
| Select planet | Tap |
| Pan view | Two finger drag |

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `1-8` | Select planets (Mercury-Neptune) |
| `Space` | Pause/Resume time |
| `C` | Toggle Cinematic Mode |
| `O` | Toggle orbit lines |
| `L` | Toggle labels |
| `P` | Take screenshot |
| `H` | Toggle HUD |
| `Escape` | Deselect planet |

## Project Structure

```
orbit-command/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── 3d/               # Three.js components
│   ├── hud/              # HUD sub-components
│   ├── Scene.tsx         # Main 3D scene
│   ├── HUD.tsx           # Heads-up display
│   └── ...
├── lib/                   # Utilities and hooks
│   ├── store.ts          # Extended state
│   ├── validation.ts     # Input validation
│   └── ...
├── store/                 # Zustand store
├── public/               # Static assets
├── docs/                 # Documentation
└── scripts/              # Build/deploy scripts
```

## Documentation

| Document | Description |
|----------|-------------|
| [User Guide](docs/USER_GUIDE.md) | Complete user documentation |
| [Astrophotography Guide](docs/ASTROPHOTOGRAPHY.md) | Planet photography tips |
| [Educational Content](docs/EDUCATION.md) | Solar system facts and figures |
| [Developer Guide](docs/DEVELOPER_GUIDE.md) | Technical documentation |
| [FAQ](docs/FAQ.md) | Frequently asked questions |
| [Contributing](CONTRIBUTING.md) | How to contribute |
| [Changelog](CHANGELOG.md) | Version history |

## Configuration

### Environment Variables

```bash
# .env.local (optional)
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
NEXT_PUBLIC_API_URL=https://api.example.com
```

### Customization

**Adding a planet:**
```typescript
// store/useStore.ts
export const PLANET_DATA = {
  // ... existing planets
  pluto: {
    name: 'Pluto',
    radius: 0.18,
    distance: 39.48,
    color: '#c4b5a0',
    // ... other properties
  },
};
```

**Changing colors:**
```typescript
// tailwind.config.ts
colors: {
  cyber: {
    blue: '#00f3ff',
    purple: '#b026ff',
    pink: '#ff006e',
    green: '#00ff9f',
  }
}
```

## Performance

Orbit Command is optimized for smooth performance:

- **Instanced geometry** for 5000+ stars
- **Level of Detail** for planet meshes
- **Selective re-renders** with Zustand selectors
- **Dynamic imports** for code splitting
- **Cached calculations** for astronomy data
- **Adaptive quality** based on device capability

## Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | Full support |
| Firefox | 88+ | Full support |
| Safari | 15+ | Full support* |
| Edge | 90+ | Full support |

*Safari may have reduced bloom effect quality

**Requirements:**
- WebGL 2.0 support
- JavaScript enabled
- 4GB RAM recommended

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # TypeScript check
npm test             # Run tests
npm run test:watch   # Tests in watch mode
npm run deploy       # Deploy to production
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Credits

- **Astronomical Data**: [NASA JPL](https://ssd.jpl.nasa.gov/)
- **Calculations**: [astronomy-engine](https://github.com/cosinekitty/astronomy)
- **3D Framework**: [Three.js](https://threejs.org/) & [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)

## Links

- **Live Demo**: [astronomyhints.com](https://astronomyhints.com)
- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/astronomyhints/orbit-command/issues)
- **Contact**: hello@astronomyhints.com

---

<p align="center">
  Built with care by <a href="https://astronomyhints.com">Astronomy Hints</a>
</p>
