import { create } from 'zustand';

export interface PlanetData {
  name: string;
  radius: number;
  distance: number;
  color: string;
  textureUrl: string;
  mass: string;
  gravity: string;
  dayLength: string;
  yearLength: string;
  moons: number;
  temperature: string;
  atmosphere: string;
  photographyTips: string[];
}

interface AppState {
  selectedPlanet: string | null;
  timeSpeed: number;
  currentDate: Date;
  cinematicMode: boolean;
  showHUD: boolean;
  setSelectedPlanet: (planet: string | null) => void;
  setTimeSpeed: (speed: number) => void;
  setCurrentDate: (date: Date) => void;
  toggleCinematicMode: () => void;
  toggleHUD: () => void;
}

export const useStore = create<AppState>((set) => ({
  selectedPlanet: null,
  timeSpeed: 1,
  currentDate: new Date(),
  cinematicMode: false,
  showHUD: true,
  setSelectedPlanet: (planet) => set({ selectedPlanet: planet }),
  setTimeSpeed: (speed) => set({ timeSpeed: speed }),
  setCurrentDate: (date) => set({ currentDate: date }),
  toggleCinematicMode: () => set((state) => ({ cinematicMode: !state.cinematicMode })),
  toggleHUD: () => set((state) => ({ showHUD: !state.showHUD })),
}));

export const PLANET_DATA: Record<string, PlanetData> = {
  mercury: {
    name: 'Mercury',
    radius: 0.383,
    distance: 0.39,
    color: '#8c7853',
    textureUrl: '/textures/mercury.jpg',
    mass: '3.30 × 10²³ kg',
    gravity: '3.7 m/s²',
    dayLength: '58.6 Earth days',
    yearLength: '88 Earth days',
    moons: 0,
    temperature: '-173°C to 427°C',
    atmosphere: 'Trace (O₂, Na, H, He)',
    photographyTips: [
      'Best viewed during greatest elongation',
      'Use solar filters for daytime observation',
      'Capture during twilight for best contrast',
    ],
  },
  venus: {
    name: 'Venus',
    radius: 0.949,
    distance: 0.72,
    color: '#ffc649',
    textureUrl: '/textures/venus.jpg',
    mass: '4.87 × 10²⁴ kg',
    gravity: '8.9 m/s²',
    dayLength: '243 Earth days',
    yearLength: '225 Earth days',
    moons: 0,
    temperature: '462°C (average)',
    atmosphere: 'CO₂ (96.5%), N₂ (3.5%)',
    photographyTips: [
      'Morning/Evening star - best at twilight',
      'UV filters reveal cloud patterns',
      'Crescent phase visible with telescopes',
    ],
  },
  earth: {
    name: 'Earth',
    radius: 1.0,
    distance: 1.0,
    color: '#4a90e2',
    textureUrl: '/textures/earth.jpg',
    mass: '5.97 × 10²⁴ kg',
    gravity: '9.8 m/s²',
    dayLength: '24 hours',
    yearLength: '365.25 days',
    moons: 1,
    temperature: '-88°C to 58°C',
    atmosphere: 'N₂ (78%), O₂ (21%)',
    photographyTips: [
      'ISS transits visible with planning',
      'Earthshine on Moon during crescent',
      'Blue Marble effect from space',
    ],
  },
  mars: {
    name: 'Mars',
    radius: 0.532,
    distance: 1.52,
    color: '#e27b58',
    textureUrl: '/textures/mars.jpg',
    mass: '6.42 × 10²³ kg',
    gravity: '3.7 m/s²',
    dayLength: '24.6 hours',
    yearLength: '687 Earth days',
    moons: 2,
    temperature: '-87°C to -5°C',
    atmosphere: 'CO₂ (95%), N₂ (3%)',
    photographyTips: [
      'Opposition offers best views',
      'Red/IR filters enhance surface detail',
      'Polar ice caps visible in spring',
    ],
  },
  jupiter: {
    name: 'Jupiter',
    radius: 11.21,
    distance: 5.2,
    color: '#c88b3a',
    textureUrl: '/textures/jupiter.jpg',
    mass: '1.90 × 10²⁷ kg',
    gravity: '24.8 m/s²',
    dayLength: '9.9 hours',
    yearLength: '11.9 Earth years',
    moons: 95,
    temperature: '-108°C (cloud tops)',
    atmosphere: 'H₂ (90%), He (10%)',
    photographyTips: [
      'Great Red Spot rotates every 10 hours',
      'Galilean moons create mini eclipses',
      'Methane filters reveal atmospheric bands',
    ],
  },
  saturn: {
    name: 'Saturn',
    radius: 9.45,
    distance: 9.54,
    color: '#fad5a5',
    textureUrl: '/textures/saturn.jpg',
    mass: '5.68 × 10²⁶ kg',
    gravity: '10.4 m/s²',
    dayLength: '10.7 hours',
    yearLength: '29.4 Earth years',
    moons: 146,
    temperature: '-139°C (cloud tops)',
    atmosphere: 'H₂ (96%), He (3%)',
    photographyTips: [
      'Ring plane crossing every 15 years',
      'Cassini Division visible with 6" scope',
      'Titan casts shadows on rings',
    ],
  },
  uranus: {
    name: 'Uranus',
    radius: 4.01,
    distance: 19.19,
    color: '#4fd0e7',
    textureUrl: '/textures/uranus.jpg',
    mass: '8.68 × 10²⁵ kg',
    gravity: '8.7 m/s²',
    dayLength: '17.2 hours',
    yearLength: '84 Earth years',
    moons: 27,
    temperature: '-197°C',
    atmosphere: 'H₂ (83%), He (15%), CH₄ (2%)',
    photographyTips: [
      'Appears as blue-green disk',
      'Opposition required for detail',
      'Long exposures reveal faint rings',
    ],
  },
  neptune: {
    name: 'Neptune',
    radius: 3.88,
    distance: 30.07,
    color: '#4b70dd',
    textureUrl: '/textures/neptune.jpg',
    mass: '1.02 × 10²⁶ kg',
    gravity: '11.2 m/s²',
    dayLength: '16.1 hours',
    yearLength: '164.8 Earth years',
    moons: 14,
    temperature: '-201°C',
    atmosphere: 'H₂ (80%), He (19%), CH₄ (1%)',
    photographyTips: [
      'Requires large aperture (10"+)',
      'Deep blue color from methane',
      'Great Dark Spot occasionally visible',
    ],
  },
};
