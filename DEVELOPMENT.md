# Orbit Command - Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## Architecture Overview

### Core Technologies

1. **Next.js 15 (App Router)**
   - Server-side rendering disabled for 3D canvas
   - Dynamic imports for Three.js components
   - Client-side state management

2. **React Three Fiber (R3F)**
   - Declarative Three.js in React
   - Automatic memory management
   - Hook-based animation loop

3. **Zustand State Management**
   - Lightweight global state
   - No boilerplate
   - TypeScript support

4. **astronomy-engine**
   - Real orbital mechanics
   - Heliocentric coordinates
   - Date-based calculations

### Component Hierarchy

```
OrbitCommand (Canvas wrapper)
└── Scene (3D orchestration)
    ├── Sun (central star)
    ├── Planet × 8 (orbital bodies)
    ├── Stars (background)
    ├── OrbitControls (camera)
    └── EffectComposer (post-processing)
        ├── Bloom
        └── ChromaticAberration
```

### State Flow

```
User Interaction → Zustand Store → React Components → Three.js Scene
                                 ↓
                            HUD/Controls UI
```

## Key Features Implementation

### 1. Real Orbital Calculations

**File:** `/components/3d/Planet.tsx`

```typescript
const position = Astronomy.HelioVector(astroBody, currentDate);
meshRef.current.position.set(
  position.x * scale,
  position.y * scale,
  position.z * scale
);
```

Uses astronomy-engine to calculate actual planetary positions based on current simulation date.

### 2. Camera Animation

**File:** `/components/Scene.tsx`

```typescript
gsap.to(camera.position, {
  x: targetPosition.x,
  y: targetPosition.y,
  z: targetPosition.z,
  duration: 2,
  ease: 'power2.inOut',
});
```

GSAP provides smooth camera transitions when selecting planets.

### 3. Time Control

**File:** `/store/useStore.ts`

```typescript
timeSpeed: number; // 0 = paused, 1 = real-time, 100 = 100x speed
```

Time progression updates in `useFrame` hook, advancing simulation date.

### 4. Post-Processing Effects

**File:** `/components/Scene.tsx`

- **Bloom**: Creates glow around bright objects (Sun, planets)
- **Chromatic Aberration**: Subtle color fringing for cinematic feel

### 5. Cinematic Mode

Auto-rotating camera using OrbitControls:

```typescript
controlsRef.current.autoRotate = true;
controlsRef.current.autoRotateSpeed = 0.5;
```

## Performance Optimization

### Current Settings

- **Stars**: 5000 particles
- **Planet Segments**: 32 (sphere geometry)
- **Orbit Segments**: 128 (line geometry)
- **Post-processing**: Enabled

### Optimization Tips

1. **Reduce Particle Count**
   ```tsx
   <Stars count={2000} /> // Lower for mobile
   ```

2. **Lower Geometry Detail**
   ```tsx
   <sphereGeometry args={[size, 16, 16]} /> // Reduce segments
   ```

3. **Conditional Post-Processing**
   ```tsx
   {!isMobile && <EffectComposer>...</EffectComposer>}
   ```

4. **Texture Compression**
   - Use compressed texture formats (KTX2, Basis)
   - Reduce texture resolution for distant planets

## Customization Guide

### Adding New Planets

1. Add to `PLANET_DATA` in `/store/useStore.ts`:
```typescript
pluto: {
  name: 'Pluto',
  radius: 0.18,
  distance: 39.5,
  color: '#c4b5a0',
  // ... other properties
}
```

2. Add to planets array in `/components/Scene.tsx`:
```typescript
{ name: 'pluto', angle: 360 }
```

### Changing Visual Style

**Colors:** `/tailwind.config.ts`
```typescript
cyber: {
  blue: '#00f3ff',    // Primary
  purple: '#b026ff',  // Secondary
  pink: '#ff006e',    // Accent
  green: '#00ff9f',   // Success
}
```

**Glow Intensity:** `/components/Scene.tsx`
```typescript
<Bloom intensity={1.5} /> // Increase for more glow
```

### Custom Planet Textures

1. Download textures (2K recommended)
2. Place in `/public/textures/`
3. Update `textureUrl` in planet data
4. Load in Planet component:
```tsx
const texture = useTexture(data.textureUrl);
<meshStandardMaterial map={texture} />
```

## Viral Features

### 1. Snapshot System

**Implementation:** `/components/Controls.tsx`

Captures canvas as PNG and triggers download. Can be enhanced with:
- Watermark overlay
- Social media optimized dimensions
- Metadata embedding

### 2. Share Modal

Pre-configured for:
- Twitter sharing with custom text
- Copy link to clipboard
- Future: Facebook, Reddit integration

### 3. Cinematic Mode

Auto-rotating showcase view perfect for:
- Screen recordings
- Social media videos
- Presentations

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| WebGL 2.0 | ✅ | ✅ | ✅ | ✅ |
| Post-processing | ✅ | ✅ | ⚠️ | ✅ |
| Touch controls | ✅ | ✅ | ✅ | ✅ |

⚠️ Safari may have reduced bloom quality

## Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

### Environment Variables

None required for basic functionality. Optional:
- `NEXT_PUBLIC_ANALYTICS_ID` - Analytics tracking
- `NEXT_PUBLIC_API_URL` - Backend API endpoint

### Build Optimization

```javascript
// next.config.js
module.exports = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  images: {
    domains: ['your-cdn.com'],
  },
}
```

## Troubleshooting

### Issue: Black screen on load
**Solution:** Check browser console for WebGL errors. Ensure GPU acceleration enabled.

### Issue: Poor performance
**Solution:** Reduce particle count, disable post-processing, lower geometry detail.

### Issue: Planets not moving
**Solution:** Check time speed slider. Ensure astronomy-engine calculations not throwing errors.

### Issue: Textures not loading
**Solution:** Verify texture files exist in `/public/textures/`. Check browser network tab.

## Future Enhancements

1. **Asteroid Belt**: Particle system between Mars and Jupiter
2. **Saturn Rings**: Separate geometry with transparency
3. **Moon System**: Show major moons for gas giants
4. **Comet Trails**: Dynamic particle effects
5. **VR Support**: WebXR integration
6. **Mobile Optimization**: Adaptive quality settings
7. **Sound Design**: Ambient space audio
8. **Data Visualization**: Orbital velocity, temperature gradients

## Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [astronomy-engine](https://github.com/cosinekitty/astronomy)
- [Zustand](https://github.com/pmndrs/zustand)
- [GSAP](https://greensock.com/gsap/)

## License

MIT - Feel free to use for your own projects!
