export const PLANET_ORDER = [
  'Mercury',
  'Venus',
  'Earth',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
] as const;

export type PlanetName = (typeof PLANET_ORDER)[number];

const planetSet: ReadonlySet<string> = new Set(PLANET_ORDER);

export function isPlanetName(value: string): value is PlanetName {
  return planetSet.has(value);
}

