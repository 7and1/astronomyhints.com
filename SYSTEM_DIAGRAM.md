# Orbit Command - System Architecture Diagram

## High-Level System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Next.js App (React)                      │ │
│  │                                                              │ │
│  │  ┌──────────────┐              ┌──────────────────────┐    │ │
│  │  │   page.tsx   │──────────────▶│   Scene.tsx         │    │ │
│  │  │  (Entry)     │   Dynamic     │   (3D Canvas)       │    │ │
│  │  └──────────────┘   Import      └──────────────────────┘    │ │
│  │         │                                   │                │ │
│  │         │                                   │                │ │
│  │         ▼                                   ▼                │ │
│  │  ┌──────────────┐              ┌──────────────────────┐    │ │
│  │  │   HUD.tsx    │              │   Three.js Scene     │    │ │
│  │  │  (UI Layer)  │              │                      │    │ │
│  │  │              │              │  ┌────────────────┐  │    │ │
│  │  │ • Controls   │              │  │  StarField     │  │    │ │
│  │  │ • Time Slider│              │  │  (5000 stars)  │  │    │ │
│  │  │ • Info Panel │              │  └────────────────┘  │    │ │
│  │  │ • Watermark  │              │  ┌────────────────┐  │    │ │
│  │  └──────────────┘              │  │  Sun           │  │    │ │
│  │         │                       │  │  (Shader)      │  │    │ │
│  │         │                       │  └────────────────┘  │    │ │
│  │         │                       │  ┌────────────────┐  │    │ │
│  │         │                       │  │  Planets (x8)  │  │    │ │
│  │         │                       │  │  • Mercury     │  │    │ │
│  │         │                       │  │  • Venus       │  │    │ │
│  │         │                       │  │  • Earth       │  │    │ │
│  │         │                       │  │  • Mars        │  │    │ │
│  │         │                       │  │  • Jupiter     │  │    │ │
│  │         │                       │  │  • Saturn      │  │    │ │
│  │         │                       │  │  • Uranus      │  │    │ │
│  │         │                       │  │  • Neptune     │  │    │ │
│  │         │                       │  └────────────────┘  │    │ │
│  │         │                       │  ┌────────────────┐  │    │ │
│  │         │                       │  │  Orbits        │  │    │ │
│  │         │                       │  │  (Tubes)       │  │    │ │
│  │         │                       │  └────────────────┘  │    │ │
│  │         │                       │  ┌────────────────┐  │    │ │
│  │         │                       │  │  Camera        │  │    │ │
│  │         │                       │  │  Controller    │  │    │ │
│  │         │                       │  └────────────────┘  │    │ │
│  │         │                       │  ┌────────────────┐  │    │ │
│  │         │                       │  │  Post-Process  │  │    │ │
│  │         │                       │  │  (Bloom)       │  │    │ │
│  │         │                       │  └────────────────┘  │    │ │
│  │         │                       └──────────────────────┘    │ │
│  │         │                                   │                │ │
│  │         └───────────────┬───────────────────┘                │ │
│  │                         │                                    │ │
│  │                         ▼                                    │ │
│  │              ┌──────────────────────┐                        │ │
│  │              │   Zustand Store      │                        │ │
│  │              │   (State Manager)    │                        │ │
│  │              │                      │                        │ │
│  │              │ • selectedPlanet     │                        │ │
│  │              │ • timeSpeed          │                        │ │
│  │              │ • currentDate        │                        │ │
│  │              │ • cameraMode         │                        │ │
│  │              │ • showOrbits         │                        │ │
│  │              │ • showLabels         │                        │ │
│  │              │ • cinematicPlaying   │                        │ │
│  │              │ • planets: Map       │                        │ │
│  │              └──────────────────────┘                        │ │
│  │                         │                                    │ │
│  │                         ▼                                    │ │
│  │              ┌──────────────────────┐                        │ │
│  │              │  astronomy-engine    │                        │ │
│  │              │  (Calculations)      │                        │ │
│  │              │                      │                        │ │
│  │              │ • HelioVector()      │                        │ │
│  │              │ • Planet positions   │                        │ │
│  │              │ • Orbital mechanics  │                        │ │
│  │              └──────────────────────┘                        │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────┐
│   User      │
│   Action    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│                    Event Handlers                        │
│  • Click Planet                                          │
│  • Adjust Time Slider                                    │
│  • Toggle Controls                                       │
│  • Take Screenshot                                       │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│              Zustand Store Actions                       │
│  • setSelectedPlanet()                                   │
│  • setTimeSpeed()                                        │
│  • toggleCinematic()                                     │
│  • updatePlanetPositions()                               │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│           astronomy-engine Calculations                  │
│  • Calculate heliocentric coordinates                    │
│  • Convert to Three.js coordinate system                 │
│  • Update planet positions in store                      │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│              React Re-render                             │
│  • Components subscribe to store changes                 │
│  • Only affected components re-render                    │
│  • Three.js scene updates                                │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│              Visual Update                               │
│  • Planets move to new positions                         │
│  • Camera animates (GSAP)                                │
│  • HUD updates with new data                             │
│  • User sees smooth animation                            │
└─────────────────────────────────────────────────────────┘
```

## Component Interaction Flow

```
┌──────────────────────────────────────────────────────────────┐
│                        User Clicks Planet                     │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Planet.tsx          │
              │  onClick handler     │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Store Action        │
              │  setSelectedPlanet() │
              └──────────┬───────────┘
                         │
                         ├─────────────────────┐
                         │                     │
                         ▼                     ▼
              ┌──────────────────┐  ┌──────────────────┐
              │  CameraController│  │  HUD.tsx         │
              │  • Reads state   │  │  • Reads state   │
              │  • Animates cam  │  │  • Shows panel   │
              │  • GSAP tween    │  │  • Displays data │
              └──────────────────┘  └──────────────────┘
```

## Time Update Loop

```
┌─────────────────────────────────────────────────────────┐
│              setInterval (100ms)                         │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Calculate new date  │
              │  date += timeSpeed   │
              │  * 86400000ms        │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  setCurrentDate()    │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  updatePlanetPos()   │
              │  • Loop all planets  │
              │  • Call astronomy-   │
              │    engine            │
              │  • Update Map        │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  React re-renders    │
              │  • Planet components │
              │  • New positions     │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Three.js updates    │
              │  • Mesh positions    │
              │  • Smooth animation  │
              └──────────────────────┘
                         │
                         │ (Loop continues)
                         └──────────────────┐
                                            │
                                            ▼
                         ┌──────────────────────────────┐
                         │  Back to setInterval         │
                         └──────────────────────────────┘
```

## Rendering Pipeline

```
┌─────────────────────────────────────────────────────────┐
│                   Browser Frame                          │
│                   (60 FPS target)                        │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  React Render        │
              │  • Virtual DOM diff  │
              │  • Component updates │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  R3F Reconciler      │
              │  • Three.js updates  │
              │  • Scene graph       │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Three.js Render     │
              │  • Geometry          │
              │  • Materials         │
              │  • Shaders           │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Post-Processing     │
              │  • Bloom effect      │
              │  • Composer          │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  WebGL Render        │
              │  • GPU execution     │
              │  • Canvas output     │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Screen Display      │
              │  • User sees frame   │
              └──────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Developer                             │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ git push
                         ▼
              ┌──────────────────────┐
              │  GitHub Repository   │
              └──────────┬───────────┘
                         │
                         │ webhook
                         ▼
              ┌──────────────────────┐
              │  Vercel Platform     │
              │  • Auto-detect Next  │
              │  • npm install       │
              │  • npm run build     │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Build Output        │
              │  • Static HTML       │
              │  • JS bundles        │
              │  • CSS files         │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Vercel Edge Network │
              │  • Global CDN        │
              │  • SSL/TLS           │
              │  • Caching           │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  End Users           │
              │  • Fast load times   │
              │  • Low latency       │
              └──────────────────────┘
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────┐
│                   Zustand Store                          │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │              State (Immutable)                  │    │
│  │  {                                              │    │
│  │    selectedPlanet: "Mars",                      │    │
│  │    timeSpeed: 100,                              │    │
│  │    currentDate: Date,                           │    │
│  │    cameraMode: "focused",                       │    │
│  │    planets: Map<string, PlanetData>             │    │
│  │  }                                              │    │
│  └────────────────────────────────────────────────┘    │
│                         │                               │
│                         │                               │
│  ┌─────────────────────┴────────────────────────┐      │
│  │                                               │      │
│  ▼                                               ▼      │
│  Actions                                    Selectors   │
│  • setSelectedPlanet()                      • (state)   │
│  • setTimeSpeed()                             => state  │
│  • updatePlanetPositions()                    .planet   │
│  • toggleCinematic()                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
         │                                    │
         │ Subscribe                          │ Subscribe
         ▼                                    ▼
┌──────────────────┐              ┌──────────────────┐
│  HUD Component   │              │  Planet Component│
│  • Re-renders on │              │  • Re-renders on │
│    state change  │              │    state change  │
└──────────────────┘              └──────────────────┘
```

## Legend

```
┌─────┐
│ Box │  = Component/Module
└─────┘

   │
   ▼     = Data/Control Flow

  ───    = Connection/Relationship
```
