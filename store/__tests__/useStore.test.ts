/**
 * Store Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useStore, PLANET_DATA } from '../useStore';

describe('useStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useStore.setState({
      selectedPlanet: null,
      timeSpeed: 1,
      currentDate: new Date(),
      cinematicMode: false,
      showHUD: true,
    });
  });

  describe('Initial State', () => {
    it('should have null selected planet initially', () => {
      const state = useStore.getState();
      expect(state.selectedPlanet).toBeNull();
    });

    it('should have default time speed of 1', () => {
      const state = useStore.getState();
      expect(state.timeSpeed).toBe(1);
    });

    it('should have current date', () => {
      const state = useStore.getState();
      expect(state.currentDate).toBeInstanceOf(Date);
    });

    it('should have cinematic mode off', () => {
      const state = useStore.getState();
      expect(state.cinematicMode).toBe(false);
    });

    it('should have HUD visible', () => {
      const state = useStore.getState();
      expect(state.showHUD).toBe(true);
    });
  });

  describe('setSelectedPlanet', () => {
    it('should set selected planet', () => {
      useStore.getState().setSelectedPlanet('Mars');
      expect(useStore.getState().selectedPlanet).toBe('Mars');
    });

    it('should clear selected planet with null', () => {
      useStore.getState().setSelectedPlanet('Earth');
      useStore.getState().setSelectedPlanet(null);
      expect(useStore.getState().selectedPlanet).toBeNull();
    });

    it('should accept any planet name', () => {
      const planets = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
      planets.forEach(planet => {
        useStore.getState().setSelectedPlanet(planet);
        expect(useStore.getState().selectedPlanet).toBe(planet);
      });
    });
  });

  describe('setTimeSpeed', () => {
    it('should set time speed', () => {
      useStore.getState().setTimeSpeed(10);
      expect(useStore.getState().timeSpeed).toBe(10);
    });

    it('should accept zero', () => {
      useStore.getState().setTimeSpeed(0);
      expect(useStore.getState().timeSpeed).toBe(0);
    });

    it('should accept large values', () => {
      useStore.getState().setTimeSpeed(365);
      expect(useStore.getState().timeSpeed).toBe(365);
    });

    it('should accept decimal values', () => {
      useStore.getState().setTimeSpeed(0.5);
      expect(useStore.getState().timeSpeed).toBe(0.5);
    });
  });

  describe('setCurrentDate', () => {
    it('should set current date', () => {
      const newDate = new Date('2024-06-15T12:00:00Z');
      useStore.getState().setCurrentDate(newDate);
      expect(useStore.getState().currentDate).toEqual(newDate);
    });

    it('should accept past dates', () => {
      const pastDate = new Date('2000-01-01T00:00:00Z');
      useStore.getState().setCurrentDate(pastDate);
      expect(useStore.getState().currentDate).toEqual(pastDate);
    });

    it('should accept future dates', () => {
      const futureDate = new Date('2100-12-31T23:59:59Z');
      useStore.getState().setCurrentDate(futureDate);
      expect(useStore.getState().currentDate).toEqual(futureDate);
    });
  });

  describe('toggleCinematicMode', () => {
    it('should toggle cinematic mode on', () => {
      expect(useStore.getState().cinematicMode).toBe(false);
      useStore.getState().toggleCinematicMode();
      expect(useStore.getState().cinematicMode).toBe(true);
    });

    it('should toggle cinematic mode off', () => {
      useStore.getState().toggleCinematicMode(); // on
      useStore.getState().toggleCinematicMode(); // off
      expect(useStore.getState().cinematicMode).toBe(false);
    });

    it('should toggle multiple times', () => {
      for (let i = 0; i < 5; i++) {
        const before = useStore.getState().cinematicMode;
        useStore.getState().toggleCinematicMode();
        expect(useStore.getState().cinematicMode).toBe(!before);
      }
    });
  });

  describe('toggleHUD', () => {
    it('should toggle HUD off', () => {
      expect(useStore.getState().showHUD).toBe(true);
      useStore.getState().toggleHUD();
      expect(useStore.getState().showHUD).toBe(false);
    });

    it('should toggle HUD on', () => {
      useStore.getState().toggleHUD(); // off
      useStore.getState().toggleHUD(); // on
      expect(useStore.getState().showHUD).toBe(true);
    });
  });

  describe('State Persistence', () => {
    it('should maintain state across multiple operations', () => {
      useStore.getState().setSelectedPlanet('Jupiter');
      useStore.getState().setTimeSpeed(50);
      useStore.getState().toggleCinematicMode();

      const state = useStore.getState();
      expect(state.selectedPlanet).toBe('Jupiter');
      expect(state.timeSpeed).toBe(50);
      expect(state.cinematicMode).toBe(true);
    });
  });

  describe('Subscriptions', () => {
    it('should notify subscribers on state change', () => {
      const callback = vi.fn();
      const unsubscribe = useStore.subscribe(callback);

      useStore.getState().setSelectedPlanet('Venus');

      expect(callback).toHaveBeenCalled();

      unsubscribe();
    });

    it('should not notify after unsubscribe', () => {
      const callback = vi.fn();
      const unsubscribe = useStore.subscribe(callback);

      unsubscribe();
      useStore.getState().setSelectedPlanet('Mercury');

      expect(callback).not.toHaveBeenCalled();
    });
  });
});

describe('PLANET_DATA', () => {
  it('should contain all 8 planets', () => {
    const planetKeys = Object.keys(PLANET_DATA);
    expect(planetKeys.length).toBe(8);
  });

  it('should have lowercase keys', () => {
    const planetKeys = Object.keys(PLANET_DATA);
    planetKeys.forEach(key => {
      expect(key).toBe(key.toLowerCase());
    });
  });

  it('should have correct planet names', () => {
    expect(PLANET_DATA.mercury.name).toBe('Mercury');
    expect(PLANET_DATA.venus.name).toBe('Venus');
    expect(PLANET_DATA.earth.name).toBe('Earth');
    expect(PLANET_DATA.mars.name).toBe('Mars');
    expect(PLANET_DATA.jupiter.name).toBe('Jupiter');
    expect(PLANET_DATA.saturn.name).toBe('Saturn');
    expect(PLANET_DATA.uranus.name).toBe('Uranus');
    expect(PLANET_DATA.neptune.name).toBe('Neptune');
  });

  describe('Planet Properties', () => {
    const requiredProperties = [
      'name',
      'radius',
      'distance',
      'color',
      'textureUrl',
      'mass',
      'gravity',
      'dayLength',
      'yearLength',
      'moons',
      'temperature',
      'atmosphere',
      'photographyTips',
    ];

    Object.entries(PLANET_DATA).forEach(([key, planet]) => {
      describe(`${planet.name}`, () => {
        requiredProperties.forEach(prop => {
          it(`should have ${prop}`, () => {
            expect(planet).toHaveProperty(prop);
          });
        });

        it('should have positive radius', () => {
          expect(planet.radius).toBeGreaterThan(0);
        });

        it('should have positive distance', () => {
          expect(planet.distance).toBeGreaterThan(0);
        });

        it('should have valid color hex', () => {
          expect(planet.color).toMatch(/^#[0-9a-fA-F]{6}$/);
        });

        it('should have texture URL', () => {
          expect(planet.textureUrl).toMatch(/^\/textures\/.*\.jpg$/);
        });

        it('should have non-negative moons', () => {
          expect(planet.moons).toBeGreaterThanOrEqual(0);
        });

        it('should have photography tips array', () => {
          expect(Array.isArray(planet.photographyTips)).toBe(true);
          expect(planet.photographyTips.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Planet Order by Distance', () => {
    it('should have Mercury closest', () => {
      const distances = Object.values(PLANET_DATA).map(p => ({ name: p.name, distance: p.distance }));
      const sorted = [...distances].sort((a, b) => a.distance - b.distance);
      expect(sorted[0].name).toBe('Mercury');
    });

    it('should have Neptune farthest', () => {
      const distances = Object.values(PLANET_DATA).map(p => ({ name: p.name, distance: p.distance }));
      const sorted = [...distances].sort((a, b) => a.distance - b.distance);
      expect(sorted[sorted.length - 1].name).toBe('Neptune');
    });

    it('should have Earth at 1 AU', () => {
      expect(PLANET_DATA.earth.distance).toBe(1.0);
    });
  });

  describe('Planet Sizes', () => {
    it('should have Jupiter as largest', () => {
      const radii = Object.values(PLANET_DATA).map(p => ({ name: p.name, radius: p.radius }));
      const sorted = [...radii].sort((a, b) => b.radius - a.radius);
      expect(sorted[0].name).toBe('Jupiter');
    });

    it('should have Mercury as smallest', () => {
      const radii = Object.values(PLANET_DATA).map(p => ({ name: p.name, radius: p.radius }));
      const sorted = [...radii].sort((a, b) => a.radius - b.radius);
      expect(sorted[0].name).toBe('Mercury');
    });

    it('should have Earth radius as 1.0 (reference)', () => {
      expect(PLANET_DATA.earth.radius).toBe(1.0);
    });
  });

  describe('Moon Counts', () => {
    it('should have Mercury with 0 moons', () => {
      expect(PLANET_DATA.mercury.moons).toBe(0);
    });

    it('should have Venus with 0 moons', () => {
      expect(PLANET_DATA.venus.moons).toBe(0);
    });

    it('should have Earth with 1 moon', () => {
      expect(PLANET_DATA.earth.moons).toBe(1);
    });

    it('should have Mars with 2 moons', () => {
      expect(PLANET_DATA.mars.moons).toBe(2);
    });

    it('should have gas giants with many moons', () => {
      expect(PLANET_DATA.jupiter.moons).toBeGreaterThan(50);
      expect(PLANET_DATA.saturn.moons).toBeGreaterThan(50);
    });
  });
});
