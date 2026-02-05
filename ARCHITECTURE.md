# Orbit Command - Architecture Documentation

## System Overview

Orbit Command is a real-time 3D solar system visualization designed for viral social media sharing. The architecture prioritizes visual impact, performance, and accurate astronomical data.

## Core Architecture Principles

### 1. Real-Time Astronomical Calculations
- Uses `astronomy-engine` library for precise planetary positions
- Calculates heliocentric coordinates based on current date/time
- Supports time acceleration (1x to 365x speed)
- Updates positions every 100ms based on time speed

### 2. Component Hierarchy

```
App (page.tsx)
├── Scene (3D Canvas)
│   ├── StarField (5000+ particles)
│   ├── Sun (custom shader + bloom)
│   ├── Planets (8 planets)
│   │   └── Planet (individual)
│   ├── Orbits (orbital paths)
│   ├── CameraController (GSAP animations)
│   ├── OrbitControls (user interaction)
│   └── EffectComposer (post-processing)
└── HUD (2D UI overlay)
    ├── Top Bar (controls)
    ├── Time Slider (speed control)
    ├── Planet Info Panel (data display)
    └── Watermark
```

### 3. State Management (Zustand)

**Store Structure:**
```typescript
{
  selectedPlanet: string | null,
  timeSpeed: number,
  currentDate: Date,
  cameraMode: 'overview' | 'focused' | 'cinematic',
  showOrbits: boolean,
  showLabels: boolean,
  cinematicPlaying: boolean,
  planets: Map<string, PlanetData>
}
```

**Key Actions:**
- `updatePlanetPositions()` - Recalculates all planet positions
- `setSelectedPlanet()` - Focuses camera on planet
- `toggleCinematic()` - Starts/stops auto-tour
- `setTimeSpeed()` - Controls orbital animation speed

### 4. Rendering Pipeline

**Three.js Scene Graph:**
```
Scene
├── Background (solid black)
├── StarField Points
├── Sun Group
│   ├── Sun Mesh (shader material)
│   ├── Glow Mesh (transparent)
│   └── Point Light
├── Planet Groups (x8)
│   ├── Planet Mesh
│   ├── Selection Ring (conditional)
│   ├── Label HTML (conditional)
│   └── Atmosphere Glow (gas giants only)
└── Orbit Tubes (conditional)
```

**Post-Processing:**
- Bloom effect for sun and planet highlights
- Threshold: 0.3, Intensity: 1.5

## Data Flow

### Initialization Flow
```
1. App loads → Store initializes
2. updatePlanetPositions() called
3. astronomy-engine calculates positions
4. Planets Map populated
5. Scene renders with initial positions
```

### Time Update Flow
```
1. setInterval (100ms) triggers
2. currentDate += timeSpeed * 86400000ms
3. setCurrentDate() called
4. updatePlanetPositions() recalculates
5. React re-renders planets with new positions
```

### Interaction Flow
```
User clicks planet
→ setSelectedPlanet(name)
→ cameraMode = 'focused'
→ CameraController animates camera (GSAP)
→ HUD shows planet info panel
```

## Performance Optimizations

### 1. Rendering Optimizations
- **Instanced Geometry**: StarField uses single geometry for 5000 particles
- **LOD**: Planets use 32 segments (balance between quality and performance)
- **Frustum Culling**: Three.js automatically culls off-screen objects
- **Texture Compression**: Ready for compressed textures (future enhancement)

### 2. React Optimizations
- **Dynamic Import**: Scene loaded client-side only (no SSR)
- **Zustand Selectors**: Components subscribe to specific state slices
- **useMemo**: Orbit paths calculated once and cached
- **useCallback**: Event handlers memoized

### 3. Animation Optimizations
- **requestAnimationFrame**: Three.js uses RAF for smooth 60fps
- **GSAP**: Hardware-accelerated camera transitions
- **CSS Transitions**: UI elements use GPU-accelerated transforms

## Camera System

### Three Camera Modes

**1. Overview Mode**
- Position: [0, 80, 100]
- Target: [0, 0, 0] (Sun)
- Use: Default view showing entire solar system

**2. Focused Mode**
- Position: Planet position + offset
- Target: Planet position
- Use: Close-up view of selected planet

**3. Cinematic Mode**
- Position: Orbits around each planet (5s each)
- Target: Current planet
- Use: Automated tour for social media capture

### Camera Transitions
- GSAP easing: 'power2.inOut'
- Duration: 2 seconds
- Smooth interpolation between positions

## Shader System

### Sun Shader
**Vertex Shader:**
- Passes UV coordinates and normals to fragment shader

**Fragment Shader:**
- Simplex noise for surface turbulence
- 3-layer noise (different frequencies)
- Color gradient: orange → yellow → white
- Fresnel effect for edge glow
- Animated with time uniform

## Coordinate System

### Astronomical to 3D Conversion
```typescript
// astronomy-engine returns AU coordinates
const vector = Astronomy.HelioVector(body, date);

// Convert to Three.js coordinates (Y-up)
const scale = 10; // 1 AU = 10 units
position = [
  vector.x * scale,    // X (right)
  vector.z * scale,    // Y (up)
  -vector.y * scale    // Z (forward)
]
```

### Scale Considerations
- **Spatial Scale**: 1 AU = 10 Three.js units
- **Planet Scale**: Radius * 0.5 (visual adjustment)
- **Sun Scale**: Fixed at 5 units (not to scale for visibility)

## Viral Sharing Features

### 1. Screenshot Capture
- Uses Canvas.toDataURL()
- Downloads as PNG with timestamp
- Includes watermark in scene

### 2. Cinematic Mode
- Auto-tours through all 8 planets
- 5 seconds per planet
- Smooth camera movements
- Perfect for screen recording

### 3. Visual Design
- Cyberpunk/sci-fi aesthetic
- High contrast colors (cyan, purple, pink)
- Glowing effects and bloom
- Professional HUD design

## Future Enhancements

### Phase 2 Features
1. **Planet Textures**: NASA texture maps for realistic surfaces
2. **Saturn Rings**: Custom geometry for ring system
3. **Moon Systems**: Major moons for Jupiter/Saturn
4. **Asteroid Belt**: Particle system between Mars/Jupiter
5. **Comet Trails**: Dynamic particle effects

### Phase 3 Features
1. **VR Support**: WebXR integration
2. **Mobile Optimization**: Touch controls and performance
3. **Social Sharing**: Direct share to Twitter/Instagram
4. **Custom Dates**: Date picker for historical positions
5. **Educational Mode**: Guided tours with narration

## Technical Constraints

### Browser Requirements
- WebGL 2.0 support
- ES6+ JavaScript
- 2GB+ RAM recommended
- GPU with shader support

### Performance Targets
- 60 FPS on desktop
- 30 FPS on mobile
- < 3s initial load time
- < 100ms interaction response

## Deployment

### Build Process
```bash
npm run build
# Generates optimized production build
# Static export to /out directory
```

### Hosting Recommendations
- **Vercel**: Optimal for Next.js (automatic optimization)
- **Netlify**: Good alternative with CDN
- **Cloudflare Pages**: Fast global distribution

### CDN Strategy
- Static assets served from CDN
- Gzip/Brotli compression enabled
- Cache-Control headers for assets
- Preload critical resources

## Monitoring

### Key Metrics
- **FPS**: Monitor via Stats.js (development)
- **Load Time**: Lighthouse performance score
- **Interaction Latency**: Time to interactive
- **Memory Usage**: Chrome DevTools profiling

### Error Tracking
- WebGL context loss handling
- Fallback for unsupported browsers
- Console error logging
- User feedback mechanism

## Security Considerations

- No user data collection
- No external API calls (except astronomy calculations)
- CSP headers for XSS protection
- HTTPS only in production
