import type { PlanetData } from '@/lib/store';

export type OrbitMission = {
  id: string;
  title: string;
  prompt: string;
  accept: string[];
  hint?: string;
};

function pickOne<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function topBy<T>(items: T[], score: (item: T) => number) {
  let bestScore = -Infinity;
  let best: T[] = [];

  for (const item of items) {
    const value = score(item);
    if (Number.isNaN(value)) continue;
    if (value > bestScore) {
      bestScore = value;
      best = [item];
      continue;
    }
    if (value === bestScore) best.push(item);
  }

  return best;
}

export function generateOrbitMission({
  planets,
  previousId,
}: {
  planets: Map<string, PlanetData> | null | undefined;
  previousId?: string;
}): OrbitMission {
  const fallback: OrbitMission[] = [
    {
      id: 'warmup-red-planet',
      title: 'Warm-up',
      prompt: 'Find the Red Planet.',
      accept: ['Mars'],
      hint: 'It’s the fourth planet from the Sun.',
    },
    {
      id: 'warmup-ringed',
      title: 'Warm-up',
      prompt: 'Find the ringed planet.',
      accept: ['Saturn'],
      hint: 'Its rings are made mostly of ice.',
    },
    {
      id: 'warmup-biggest',
      title: 'Warm-up',
      prompt: 'Find the largest planet.',
      accept: ['Jupiter'],
      hint: 'It’s famous for a giant storm.',
    },
  ];

  const planetList = planets ? Array.from(planets.values()) : [];
  const dynamic: OrbitMission[] = [];

  if (planetList.length >= 4) {
    const hottest = topBy(planetList, (p) => p.temperature);
    if (hottest.length) {
      dynamic.push({
        id: 'dynamic-hottest',
        title: 'Thermal Hunt',
        prompt: 'Find the hottest planet.',
        accept: hottest.map((p) => p.name),
        hint: 'Not the closest one.',
      });
    }

    const mostMoons = topBy(planetList, (p) => p.moons);
    if (mostMoons.length) {
      dynamic.push({
        id: 'dynamic-moon-king',
        title: 'Moon King',
        prompt: 'Find the planet with the most moons.',
        accept: mostMoons.map((p) => p.name),
        hint: 'A gas giant.',
      });
    }

    const farthest = topBy(planetList, (p) => p.distance);
    if (farthest.length) {
      dynamic.push({
        id: 'dynamic-farthest',
        title: 'Deep Space',
        prompt: 'Find the farthest planet from the Sun (in this sim).',
        accept: farthest.map((p) => p.name),
        hint: 'It’s dark blue.',
      });
    }

    const noMoons = planetList.filter((p) => p.moons === 0);
    if (noMoons.length) {
      dynamic.push({
        id: 'dynamic-no-moons',
        title: 'Solo Orbit',
        prompt: 'Find a planet with no moons.',
        accept: noMoons.map((p) => p.name),
        hint: 'Try the inner planets.',
      });
    }
  }

  const candidates = [...dynamic, ...fallback].filter((m) => m.id !== previousId);
  return pickOne(candidates.length ? candidates : fallback);
}

