# Orbit Command - Quick Reference Guide

## 🚀 Quick Start

```bash
cd /Volumes/SSD/dev/astronomyhints.com
npm install
npm run dev
```

Open http://localhost:3000

---

## 📁 Key Files Reference

### Core Application
```
app/page.tsx              → Entry point (dynamic import)
components/OrbitCommand.tsx → Canvas wrapper
components/Scene.tsx       → 3D orchestration
```

### 3D Components
```
components/Sun.tsx         → Sun with custom shaders
components/Planet.tsx      → Planet with real orbits
components/StarField.tsx   → 5000+ particle background
components/OrbitRing.tsx   → Orbital path lines
```

### UI Components
```
components/HUD.tsx         → Planet information panel
components/Controls.tsx    → Time/camera controls
components/CameraController.tsx → Camera animations
```

### State & Data
```
store/useStore.ts          → Zustand store + planet data
lib/store.ts              → Alternative store (astronomy-engine)
```

---

## 🎮 User Controls

### Mouse/Trackpad
- **Left Click + Drag:** Rotate view
- **Scroll:** Zoom in/out
- **Click Planet:** Select and view details
- **Click Background:** Deselect

### Touch (Mobile)
- **One Finger Drag:** Rotate
- **Pinch:** Zoom
- **Tap Planet:** Select

### UI Controls
- **Time Slider:** 0x (pause) to 100x speed
- **Play/Pause Button:** Toggle time
- **Reset Button:** Return to current date
- **Cinematic Toggle:** Auto-tour mode
- **HUD Toggle:** Show/hide interface
- **Snapshot Button:** Download screenshot
- **Share Button:** Social media sharing

---

## 🎨 Customization Quick Guide

### Change Colors
**File:** `tailwind.config.ts`
```typescript
colors: {
  cyber: {
    blue: '#00f3ff',    // Change primary color
    purple: '#b026ff',  // Change secondary
    pink: '#ff006e',    // Change accent
    green: '#00ff9f',   // Change success
  }
}
```

### Adjust Performance
**File:** `components/Scene.tsx`
```typescript
// Reduce stars
<Stars count={2000} /> // Default: 5000

// Disable post-processing
{/* <EffectComposer>...</EffectComposer> */}
```

### Modify Planet Data
**File:** `store/useStore.ts`
```typescript
export const PLANET_DATA: Record<string, PlanetData> = {
  mercury: {
    name: 'Mercury',
    radius: 0.383,      // Visual size
    distance: 0.39,     // AU from Sun
    color: '#8c7853',   // Planet color
    // ... edit any property
  }
}
```

### Add Planet Textures
1. Download textures (2K recommended)
2. Place in `/public/textures/mercury.jpg`
3. Update `textureUrl` in planet data
4. Load in Planet component:
```tsx
import { useTexture } from '@react-three/drei';
const texture = useTexture(data.textureUrl);
<meshStandardMaterial map={texture} />
```

---

## 🔧 Common Tasks

### Add New Planet
1. Add to `PLANET_DATA` in `store/useStore.ts`
2. Add to planets array in `components/Scene.tsx`
3. Ensure astronomy-engine supports it

### Change Camera Behavior
**File:** `components/CameraController.tsx`
```typescript
// Overview position
gsap.to(camera.position, {
  x: 0,
  y: 80,  // Height
  z: 100, // Distance
  duration: 2,
});

// Cinematic speed
if (cinematicTimer.current > 5) { // Change duration
```

### Modify Bloom Effect
**File:** `components/Scene.tsx`
```typescript
<Bloom
  intensity={1.5}           // Glow strength
  luminanceThreshold={0.2}  // Brightness cutoff
  luminanceSmoothing={0.9}  // Smoothness
/>
```

### Update Branding
**File:** `components/Controls.tsx`
```typescript
<h1 className="text-2xl font-mono text-cyber-blue text-glow">
  YOUR BRAND NAME
</h1>
```

---

## 🐛 Troubleshooting

### Black Screen
```bash
# Check browser console for errors
# Ensure WebGL is enabled
# Try different browser
```

### Poor Performance
```typescript
// Reduce particles
<Stars count={1000} />

// Lower geometry detail
<sphereGeometry args={[size, 16, 16]} /> // Reduce segments

// Disable effects
// Comment out <EffectComposer>
```

### Planets Not Moving
```typescript
// Check time speed (may be paused)
// Verify astronomy-engine installed
npm install astronomy-engine
```

### Build Errors
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

---

## 📊 State Management

### Zustand Store Structure
```typescript
{
  selectedPlanet: 'mars' | null,
  timeSpeed: 1,              // 0-100
  currentDate: Date,
  cinematicMode: false,
  showHUD: true
}
```

### Access State
```typescript
import { useStore } from '@/store/useStore';

const selectedPlanet = useStore(state => state.selectedPlanet);
const setTimeSpeed = useStore(state => state.setTimeSpeed);
```

---

## 🎬 Animation System

### GSAP Animations
```typescript
import gsap from 'gsap';

gsap.to(camera.position, {
  x: targetX,
  y: targetY,
  z: targetZ,
  duration: 2,
  ease: 'power2.inOut',
});
```

### useFrame Hook
```typescript
useFrame((state, delta) => {
  // Runs every frame (60 FPS)
  mesh.rotation.y += delta;
});
```

---

## 🌐 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy --prod
```

### Environment Variables
```bash
# Optional
NEXT_PUBLIC_ANALYTICS_ID=your-id
NEXT_PUBLIC_API_URL=https://api.example.com
```

### Build Optimization
**File:** `next.config.js`
```javascript
module.exports = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  images: {
    domains: ['your-cdn.com'],
  },
}
```

---

## 📈 Performance Targets

| Metric | Desktop | Mobile |
|--------|---------|--------|
| FPS | 60 | 30+ |
| Load Time | < 3s | < 5s |
| Bundle Size | ~500KB | ~500KB |

---

## 🔗 Useful Links

- [Three.js Docs](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Drei Components](https://github.com/pmndrs/drei)
- [astronomy-engine](https://github.com/cosinekitty/astronomy)
- [Zustand](https://github.com/pmndrs/zustand)
- [GSAP](https://greensock.com/gsap/)

---

## 🎯 Component Props Quick Reference

### Planet Component
```typescript
<Planet
  name="mars"
  data={PLANET_DATA.mars}
  initialAngle={135}
  currentDate={new Date()}
/>
```

### Sun Component
```typescript
<Sun />  // No props needed
```

### StarField Component
```typescript
<StarField count={5000} />
```

### OrbitRing Component
```typescript
<OrbitRing
  radius={10}
  color="#00ffff"
/>
```

---

## 💡 Pro Tips

1. **Performance:** Use Chrome DevTools Performance tab to profile
2. **Debugging:** Enable React DevTools for component inspection
3. **Testing:** Test on real mobile devices, not just emulators
4. **Textures:** Use compressed formats (WebP, KTX2) for faster loading
5. **Analytics:** Add event tracking for user interactions
6. **SEO:** Add meta tags for social media sharing
7. **Accessibility:** Consider keyboard navigation for controls

---

## 🚨 Important Notes

- **Mac = Code Only:** Don't run dev server on Mac (per CLAUDE.md)
- **No Commits:** Don't commit .env, API keys, CLAUDE.md
- **Real APIs:** No mocks, use real astronomy-engine
- **English Only:** All code and content in English

---

## 📝 Code Snippets

### Add Custom Event
```typescript
// In Controls.tsx
const handleCustomAction = () => {
  console.log('Custom action triggered');
  // Your code here
};
```

### Track Analytics
```typescript
// In HUD.tsx
const trackPlanetView = (planet: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'planet_view', {
      planet_name: planet,
    });
  }
};
```

### Add Watermark to Snapshot
```typescript
// In Controls.tsx
const handleSnapshot = async () => {
  const canvas = document.querySelector('canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Add watermark
  ctx.font = '20px monospace';
  ctx.fillStyle = '#00f3ff';
  ctx.fillText('astronomyhints.com', 20, canvas.height - 20);

  // Download
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orbit-command-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }
  });
};
```

---

**Last Updated:** 2026-02-03
**Version:** 1.0.0
**Status:** Production Ready ✅
